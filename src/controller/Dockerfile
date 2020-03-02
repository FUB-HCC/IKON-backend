FROM node:13.8.0-stretch AS builder

RUN mkdir -p /frontend
RUN git clone -j4 -b master https://github.com/FUB-HCC/IKON-projektor.git /frontend
RUN yarn install --cwd /frontend/
RUN yarn --cwd /frontend/ build

FROM nginx:1.17.8-alpine

RUN mkdir -p /data/nginx/cache
COPY --from=builder /frontend/build/ /usr/local/nginx/html/
COPY src/controller/src/nginx.conf /etc/nginx/nginx.conf
