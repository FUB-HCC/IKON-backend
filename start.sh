#!/bin/bash


# check if everything is set up and if not generate placeholders

# check ssl certificates and generate dev certs if not present
if [ ! -f ./assets/ssl/server.crt ] || [ ! -f ./assets/ssl/server.key ]; 
then
	FQDN=`hostname`
    openssl genrsa -out ./assets/ssl/server.key 2048
	openssl req -nodes -newkey rsa:2048 -keyout ./assets/ssl/server.key -out ./assets/ssl/server.csr -subj "/C=GB/ST=Street/L=City/O=Organisation/OU=Authority/CN=${FQDN}"
	openssl x509 -req -days 1024 -in ./assets/ssl/server.csr -signkey ./assets/ssl/server.key -out ./assets/ssl/server.crt
fi

shopt -s nullglob dotglob
if [ ! -f ./assets/secrets/ikoncode_secrets ] || [ ! -f ./assets/secrets/postgres_password ];
then
	pwgen 64 1 > ./assets/secrets/postgres_password
	echo "{
      \"protocol\": \"https\",
      \"server\": \"via.naturkundemuseum.berlin\",
      \"path\": \"/wiki\",
      \"debug\": true,
      \"username\": \"viz\",
      \"password\": \"insert_password_here_but_do_not_insert_into_start_script!!!\",
      \"userAgent\": \"IKON\",
      \"domain\": \"MUSEUM\",
      \"concurrency\": 5
}" > ./assets/secrets/ikoncode_secrets
fi

# check if all data tars are unpacked
if [[ ! -f ./assets/models/bert/model.tar.gz ]]    # or [ -n "$(echo *.flac)" ]
then
    wget https://schweter.eu/cloud/berts/bert-base-german-dbmdz-cased.tar.gz -O ./assets/models/bert/model.tar.gz --show-progress
    tar xf ./assets/models/bert/model.tar.gz -C ./assets/models/bert/
    wget https://s3.amazonaws.com/models.huggingface.co/bert/bert-base-german-dbmdz-cased-vocab.txt -O ./assets/models/bert/vocab.txt
    wget https://s3.amazonaws.com/models.huggingface.co/bert/bert-base-german-dbmdz-cased-config.json -O ./assets/models/bert/bert_config.json
fi

docker-compose -f docker-compose.yml up "$@" 
