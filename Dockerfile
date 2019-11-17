
FROM alpine

RUN apk --no-cache add nodejs npm bash

WORKDIR /mnt

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]

