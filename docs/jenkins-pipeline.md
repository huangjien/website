# Jenkins Pipeline

This project now includes a declarative `Jenkinsfile` that mirrors the existing GitHub Actions workflow:

- CI: checkout, install, lint, format check, type check, i18n parity, page-test coverage guard, Jest CI, app build, perf check
- CD (local): build the home Docker image and deploy via `deploy-home.sh`
- CD (optional edge): build/push `Dockerfile.edge` and deploy the rendered Cloud Run manifest

## Required Agent Tooling

- `git`
- `node`
- `corepack`
- `docker`
- `gcloud` (only for `DEPLOY_EDGE=true`)

## Pipeline Parameters

- `REPO_URL`: git repository to build
- `BRANCH`: git ref to build
- `RUN_CD`: run deployment stages after CI
- `DEPLOY_HOME`: deploy local Dockerized home runtime
- `DEPLOY_EDGE`: deploy Cloud Run edge runtime
- `RUN_LIGHTHOUSE`: optional non-blocking Lighthouse CI run
- `HOME_ENV_FILE`: env file for local deployment
- `HOME_IMAGE_NAME`: Docker image tag for the home runtime
- `HOME_CONTAINER_NAME`: Docker container name for the home runtime
- `HOME_PORT`: host port for the home runtime

## Home Deployment Inputs

`deploy-home.sh` now supports:

- `ENV_FILE`: defaults to `.env.home`
- `SKIP_BUILD`: defaults to `false`

Jenkins uses `SKIP_BUILD=true` because the image is already built earlier in the pipeline.

## Edge Deployment Inputs

Set these environment variables in Jenkins before enabling `DEPLOY_EDGE=true`:

- `PROJECT_ID`
- `HOME_UPSTREAM_HOST`
- `HOME_UPSTREAM_PORT`
- `DOCKER_PASSWORD`
- `DOCKER_USERNAME` (optional, defaults to `huangjien`)
- `GCP_SA_KEY` or `GCP_SA_KEY_FILE`

## Publish The Job

Use the helper script to create or update the Jenkins job from this repo:

```bash
export JENKINS_URL=http://localhost:8888
export JENKINS_USER=admin
export JENKINS_TOKEN=...
python3 scripts/deploy-jenkins-pipeline.py --job-name website-ci-cd
```

The helper publishes the repository `Jenkinsfile` as an inline pipeline job so Jenkins does not need a preconfigured SCM job definition.
