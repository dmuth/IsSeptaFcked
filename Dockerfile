
FROM node:24-alpine 

ARG GIT_SHA=unknown
ARG BUILD_TIME=unknown
ARG NODE_ENV=development

ENV GIT_SHA=$GIT_SHA
ENV BUILD_TIME=$BUILD_TIME
ENV NODE_ENV=$NODE_ENV

RUN apk --no-cache add bash

WORKDIR /mnt

COPY entrypoint.sh /

# Copy in our code
COPY . /app/

ENTRYPOINT ["/entrypoint.sh"]

