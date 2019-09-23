FROM nginx:latest

RUN mkdir -p /data/nginx/cache
COPY IKON-projektor/build/ /var/www/
COPY src/controller/src/nginx.conf /etc/nginx/nginx.conf
