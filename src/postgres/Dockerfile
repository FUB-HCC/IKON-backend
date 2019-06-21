FROM postgres:latest

USER $UID
COPY assets/data/gepris/ /dump_data/
COPY assets/data/data_augmentation/country_code.csv /dump_data/country_code.csv
COPY assets/data/project_input/ /dump_data/
COPY src/postgres/init.sql /docker-entrypoint-initdb.d/
