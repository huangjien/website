# [Choice] Debian OS version: bookworm, bullseye, trixie
ARG VARIANT="4.0.9-22-bookworm"
# FROM --platform=linux/amd64 mcr.microsoft.com/devcontainers/base:${VARIANT}
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>
RUN npm -v && node -v && yarn -v && yarn install 

# RUN apt-get clean && apt-get update \ 
#     && yarn  install && yarn playwright install && yarn playwright install-deps
