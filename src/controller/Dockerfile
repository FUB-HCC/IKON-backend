FROM node:alpine AS builder

RUN mkdir -p /IKON
COPY IKON-projektor/ /IKON/
RUN yarn install --cwd /IKON/
RUN yarn --cwd /IKON/ build

FROM nginx:latest

RUN mkdir -p /data/nginx/cache
COPY --from=builder /IKON/build/ /var/www/
COPY src/controller/src/nginx.conf /etc/nginx/nginx.conf
