# [Choice] Debian OS version (use bullseye on local arm64/Apple Silicon): bookworm, buster, bullseye
ARG VARIANT="20-bullseye"
# FROM --platform=linux/amd64 mcr.microsoft.com/devcontainers/base:${VARIANT}
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

RUN yarn  install; yarn playwright install; yarn playwright install-deps
