FROM postgres:12-alpine

USER $UID
COPY src/postgres/init.sql /docker-entrypoint-initdb.d/
