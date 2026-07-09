def requireCommand(String name) {
  sh """
    if ! command -v ${name} >/dev/null 2>&1; then
      echo "Missing required command: ${name}" >&2
      exit 1
    fi
  """
}

pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: "20"))
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
    timestamps()
  }

  parameters {
    string(name: "REPO_URL", defaultValue: "https://github.com/huangjien/website.git", description: "Git repository to build.")
    string(name: "BRANCH", defaultValue: "main", description: "Git branch or ref to build.")
    booleanParam(name: "RUN_CD", defaultValue: true, description: "Run deployment stages after CI passes.")
    booleanParam(name: "DEPLOY_HOME", defaultValue: true, description: "Deploy the local home runtime with Docker.")
    booleanParam(name: "DEPLOY_EDGE", defaultValue: false, description: "Build and deploy the edge runtime to Cloud Run.")
    booleanParam(name: "RUN_LIGHTHOUSE", defaultValue: false, description: "Run Lighthouse CI as a non-blocking quality signal.")
    string(name: "HOME_ENV_FILE", defaultValue: ".env.home", description: "Path to the env file used by deploy-home.sh.")
    string(name: "HOME_IMAGE_NAME", defaultValue: "website-home:latest", description: "Docker image tag for the home runtime.")
    string(name: "HOME_CONTAINER_NAME", defaultValue: "website-home", description: "Docker container name for the home runtime.")
    string(name: "HOME_PORT", defaultValue: "8080", description: "Host port to bind to the home runtime container.")
    string(name: "EDGE_IMAGE_REPO", defaultValue: "docker.io/huangjien/website-edge", description: "Edge image repository.")
    string(name: "SERVICE_NAME", defaultValue: "blog", description: "Cloud Run service name.")
    string(name: "RUN_REGION", defaultValue: "europe-west1", description: "Cloud Run region.")
  }

  environment {
    CI = "true"
    DOCKER_BUILDKIT = "1"
    FORCE_COLOR = "1"
    HUSKY = "0"
    NEXT_TELEMETRY_DISABLED = "1"
  }

  stages {
    stage("Preflight") {
      steps {
        script {
          requireCommand("git")
          requireCommand("node")
          requireCommand("corepack")
          requireCommand("docker")
        }
      }
    }

    stage("Checkout") {
      steps {
        deleteDir()
        git branch: params.BRANCH, url: params.REPO_URL
      }
    }

    stage("Install") {
      steps {
        sh """
          corepack enable
          corepack prepare pnpm@11.9.0 --activate
          pnpm install --frozen-lockfile --color=true
        """
      }
    }

    stage("Validate") {
      steps {
        sh "pnpm lint"
        sh "pnpm format:check"
        sh "pnpm type-check"
        sh "pnpm check:i18n-parity"
        sh "pnpm check:pages-tests"
        sh "pnpm exec jest --ci --coverage --watchAll=false --watchman=false"
      }
    }

    stage("Build App") {
      steps {
        sh "pnpm build:webpack"
      }
    }

    stage("Performance Checks") {
      steps {
        sh "pnpm perf:ci"
      }
    }

    stage("Lighthouse CI") {
      when {
        expression { return params.RUN_LIGHTHOUSE }
      }
      steps {
        catchError(buildResult: "UNSTABLE", stageResult: "UNSTABLE") {
          sh "pnpm lhci:collect"
          sh "pnpm lhci:assert"
        }
      }
      post {
        always {
          archiveArtifacts artifacts: "lighthouse-reports/**", allowEmptyArchive: true
        }
      }
    }

    stage("Build Home Image") {
      steps {
        sh "docker build -t '${params.HOME_IMAGE_NAME}' ."
      }
    }

    stage("Deploy Home") {
      when {
        allOf {
          expression { return params.RUN_CD }
          expression { return params.DEPLOY_HOME }
        }
      }
      steps {
        sh """
          test -f '${params.HOME_ENV_FILE}' || {
            echo "HOME_ENV_FILE not found: ${params.HOME_ENV_FILE}" >&2
            exit 1
          }

          chmod +x deploy-home.sh
          ENV_FILE='${params.HOME_ENV_FILE}' \
          IMAGE_NAME='${params.HOME_IMAGE_NAME}' \
          CONTAINER_NAME='${params.HOME_CONTAINER_NAME}' \
          HOME_PORT='${params.HOME_PORT}' \
          SKIP_BUILD=true \
          ./deploy-home.sh
        """
      }
    }

    stage("Deploy Edge") {
      when {
        allOf {
          expression { return params.RUN_CD }
          expression { return params.DEPLOY_EDGE }
        }
      }
      steps {
        script {
          requireCommand("gcloud")
        }
        sh '''
          : "${PROJECT_ID:?PROJECT_ID is required for edge deploy}"
          : "${HOME_UPSTREAM_HOST:?HOME_UPSTREAM_HOST is required for edge deploy}"
          : "${HOME_UPSTREAM_PORT:?HOME_UPSTREAM_PORT is required for edge deploy}"
          : "${DOCKER_PASSWORD:?DOCKER_PASSWORD is required for edge deploy}"

          if ! printf '%s' "${HOME_UPSTREAM_PORT}" | grep -Eq '^[0-9]+$'; then
            echo "HOME_UPSTREAM_PORT must be numeric" >&2
            exit 1
          fi

          if [ -n "${GCP_SA_KEY:-}" ]; then
            printf '%s' "${GCP_SA_KEY}" > .jenkins-gcp-key.json
            gcloud auth activate-service-account --key-file=.jenkins-gcp-key.json
          elif [ -n "${GCP_SA_KEY_FILE:-}" ]; then
            gcloud auth activate-service-account --key-file="${GCP_SA_KEY_FILE}"
          else
            echo "Set GCP_SA_KEY or GCP_SA_KEY_FILE before running edge deploy." >&2
            exit 1
          fi

          echo "${DOCKER_PASSWORD}" | docker login docker.io -u "${DOCKER_USERNAME:-huangjien}" --password-stdin

          EDGE_IMAGE_TAG="${EDGE_IMAGE_REPO}:$(git rev-parse --short=8 HEAD)"
          docker buildx build --platform linux/amd64 --push -f Dockerfile.edge \
            -t "${EDGE_IMAGE_TAG}" \
            -t "${EDGE_IMAGE_REPO}:latest" .

          sed \
            -e "s|__SERVICE_NAME__|${SERVICE_NAME}|g" \
            -e "s|__EDGE_IMAGE__|${EDGE_IMAGE_TAG}|g" \
            -e "s|__HOME_UPSTREAM_HOST__|${HOME_UPSTREAM_HOST}|g" \
            -e "s|__HOME_UPSTREAM_PORT__|${HOME_UPSTREAM_PORT}|g" \
            -e "s|__RELAY_LISTEN_PORT__|18080|g" \
            -e "s|__TS_ADVERTISE_TAGS__|tag:cloud-run-edge|g" \
            -e "s|__TS_AUTHKEY_SECRET__|TS_AUTHKEY|g" \
            deploy/cloudrun/service.yaml > cloudrun-service.rendered.yaml

          if grep -qE "__[A-Z0-9_]+__" cloudrun-service.rendered.yaml; then
            echo "Rendered manifest still contains unresolved placeholders" >&2
            exit 1
          fi

          gcloud run services replace cloudrun-service.rendered.yaml \
            --region "${RUN_REGION}" \
            --project "${PROJECT_ID}" \
            --platform managed

          gcloud run services add-iam-policy-binding "${SERVICE_NAME}" \
            --region "${RUN_REGION}" \
            --project "${PROJECT_ID}" \
            --member="allUsers" \
            --role="roles/run.invoker"
        '''
      }
      post {
        always {
          sh "rm -f .jenkins-gcp-key.json cloudrun-service.rendered.yaml"
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: "coverage/**", allowEmptyArchive: true
    }
    success {
      echo "Pipeline completed successfully."
    }
  }
}
