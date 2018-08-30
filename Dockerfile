
FROM alpine

COPY entrypoint.sh /

RUN apk --no-cache add nodejs

WORKDIR /mnt

ENTRYPOINT ["/entrypoint.sh"]

