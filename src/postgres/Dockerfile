FROM postgres:latest
COPY assets/data/gepris/ /dump_data/
COPY assets/data/data_augmentation/country_code.csv /dump_data/country_code.csv
COPY assets/data/project_input/projects.csv /dump_data/projects.csv
COPY src/postgres/init.sql /docker-entrypoint-initdb.d/
