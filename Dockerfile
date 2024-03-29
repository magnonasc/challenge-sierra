FROM node:16-bullseye-slim AS base
    ENV APPDIR /usr/hu

    RUN useradd -ms /bin/sh -d $APPDIR hu
    WORKDIR $APPDIR

    ADD requirements.apt /tmp/requirements.apt
    RUN apt-get update \
        && apt-get --yes install `cat /tmp/requirements.apt` \
        && apt-get clean \
        && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
        && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

FROM base AS development
    ENV PORT 9545
    EXPOSE ${PORT}

    RUN yarn global add truffle
