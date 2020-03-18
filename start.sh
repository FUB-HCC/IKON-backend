#!/bin/bash
#
# This is a rather minimal example Argbash potential
# Example taken from http://argbash.readthedocs.io/en/stable/example.html
#
# ARG_OPTIONAL_BOOLEAN([notebook],[n],[boolean optional argument help msg])
# ARG_OPTIONAL_BOOLEAN([gpu],[g],[boolean optional argument help msg])
# ARG_HELP([The general script's help msg])
# ARGBASH_GO()
# needed because of Argbash --> m4_ignore([
### START OF CODE GENERATED BY Argbash v2.8.1 one line above ###
# Argbash is a bash code generator used to get arguments parsing right.
# Argbash is FREE SOFTWARE, see https://argbash.io for more info
# Generated online by https://argbash.io/generate


die()
{
	local _ret=$2
	test -n "$_ret" || _ret=1
	test "$_PRINT_HELP" = yes && print_help >&2
	echo "$1" >&2
	exit ${_ret}
}


begins_with_short_option()
{
	local first_option all_short_options='ngh'
	first_option="${1:0:1}"
	test "$all_short_options" = "${all_short_options/$first_option/}" && return 1 || return 0
}

# THE DEFAULTS INITIALIZATION - OPTIONALS
_arg_notebook="off"
_arg_gpu="off"


print_help()
{
	printf '%s\n' "The general script's help msg"
	printf 'Usage: %s [-n|--(no-)notebook] [-g|--(no-)gpu] [-h|--help]\n' "$0"
	printf '\t%s\n' "-n, --notebook, --no-notebook: Start the NLPNotebook to checkout the Topicextraction pipeline"
	printf '\t%s\n' "-g, --gpu, --no-gpu: Start the NLPNotebook using a GPU"
	printf '\t%s\n' "-h, --help: Prints help"
}


parse_commandline()
{
	while test $# -gt 0
	do
		_key="$1"
		case "$_key" in
			-n|--no-notebook|--notebook)
				_arg_notebook="on"
				test "${1:0:5}" = "--no-" && _arg_notebook="off"
				;;
			-n*)
				_arg_notebook="on"
				_next="${_key##-n}"
				if test -n "$_next" -a "$_next" != "$_key"
				then
					{ begins_with_short_option "$_next" && shift && set -- "-n" "-${_next}" "$@"; } || die "The short option '$_key' can't be decomposed to ${_key:0:2} and -${_key:2}, because ${_key:0:2} doesn't accept value and '-${_key:2:1}' doesn't correspond to a short option."
				fi
				;;
			-g|--no-gpu|--gpu)
				_arg_gpu="on"
				test "${1:0:5}" = "--no-" && _arg_gpu="off"
				;;
			-g*)
				_arg_gpu="on"
				_next="${_key##-g}"
				if test -n "$_next" -a "$_next" != "$_key"
				then
					{ begins_with_short_option "$_next" && shift && set -- "-g" "-${_next}" "$@"; } || die "The short option '$_key' can't be decomposed to ${_key:0:2} and -${_key:2}, because ${_key:0:2} doesn't accept value and '-${_key:2:1}' doesn't correspond to a short option."
				fi
				;;
			-h|--help)
				print_help
				exit 0
				;;
			-h*)
				print_help
				exit 0
				;;
			*)
				_PRINT_HELP=yes die "FATAL ERROR: Got an unexpected argument '$1'" 1
				;;
		esac
		shift
	done
}

parse_commandline "$@"

# OTHER STUFF GENERATED BY Argbash

### END OF CODE GENERATED BY Argbash (sortof) ### ])
# [ <-- needed because of Argbash

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
if [[ -n $(echo ./assets/data/model/model*) ]]    # or [ -n "$(echo *.flac)" ]
then 
    tar xf ./assets/data/gepris/*.tar.xz -C ./assets/data/gepris/
fi

# check if all data tars are unpacked
if [[ -n $(echo ./assets/data/gepris/*.tar.xz) ]]    # or [ -n "$(echo *.flac)" ]
then
    wget https://schweter.eu/cloud/berts/bert-base-german-dbmdz-cased.tar.gz -O ./assets/model/model.tar.gz --show-progress
    tar xf ./assets/model/model.tar.gz -C ./assets/model/
    wget https://s3.amazonaws.com/models.huggingface.co/bert/bert-base-german-dbmdz-cased-vocab.txt -O ./assets/model/vocab.txt
    wget https://s3.amazonaws.com/models.huggingface.co/bert/bert-base-german-dbmdz-cased-config.json -O ./assets/model/bert_config.json
fi

CURRENT_UID=$(id -u):$(id -g) docker-compose -f docker-compose.yml up --build

# ] <-- needed because of Argbash
