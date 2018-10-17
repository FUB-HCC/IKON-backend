FROM postgres:9
COPY src/postgres/init.sql /docker-entrypoint-initdb.d/
COPY assets/data/database_dump/dump.sqlite /dump_data/

RUN apt-get update
RUN apt-get -y install sbcl unzip libsqlite3-dev make curl gawk freetds-dev libzip-dev git
RUN git clone https://github.com/dimitri/pgloader.git
RUN cd pgloader/
RUN make pgloader

#CMD ["pgloader", "pgloader /dump_data/dump.sqlite", "pgsql:///postgres"]
