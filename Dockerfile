
FROM alpine

RUN apk --no-cache add nodejs npm bash

WORKDIR /mnt

COPY entrypoint.sh /

# Copy in our code
COPY . /app/

ENTRYPOINT ["/entrypoint.sh"]

