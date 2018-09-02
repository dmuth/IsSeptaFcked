
FROM alpine

COPY entrypoint.sh /

RUN apk --no-cache add nodejs npm

WORKDIR /mnt

ENTRYPOINT ["/entrypoint.sh"]

