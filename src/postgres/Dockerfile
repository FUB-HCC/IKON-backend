FROM postgres:latest

USER $UID
COPY src/postgres/init.sql /docker-entrypoint-initdb.d/
