#!/bin/bash
# ARG_OPTIONAL_BOOLEAN([gpu],[],[boolean optional argument help msg])
# ARG_HELP([The general script's help msg])
# ARGBASH_GO()
# needed because of Argbash --> m4_ignore([
### START OF CODE GENERATED BY Argbash v2.6.1 one line above ###
# Argbash is a bash code generator used to get arguments parsing right.
# Argbash is FREE SOFTWARE, see https://argbash.io for more info
# Generated online by https://argbash.io/generate

# When called, the process ends.
# Args:
# 	$1: The exit message (print to stderr)
# 	$2: The exit code (default is 1)
# if env var _PRINT_HELP is set to 'yes', the usage is print to stderr (prior to )
# Example:
# 	test -f "$_arg_infile" || _PRINT_HELP=yes die "Can't continue, have to supply file as an argument, got '$_arg_infile'" 4
die()
{
	local _ret=$2
	test -n "$_ret" || _ret=1
	test "$_PRINT_HELP" = yes && print_help >&2
	echo "$1" >&2
	exit ${_ret}
}

# Function that evaluates whether a value passed to it begins by a character
# that is a short option of an argument the script knows about.
# This is required in order to support getopts-like short options grouping.
begins_with_short_option()
{
	local first_option all_short_options
	all_short_options='h'
	first_option="${1:0:1}"
	test "$all_short_options" = "${all_short_options/$first_option/}" && return 1 || return 0
}



# THE DEFAULTS INITIALIZATION - OPTIONALS
_arg_gpu="off"

# Function that prints general usage of the script.
# This is useful if users asks for it, or if there is an argument parsing error (unexpected / spurious arguments)
# and it makes sense to remind the user how the script is supposed to be called.
print_help ()
{
	printf '%s\n' "The general script's help msg"
	printf 'Usage: %s [--(no-)gpu] [-h|--help]\n' "$0"
	printf '\t%s\n' "--gpu,--no-gpu: boolean optional argument help msg (off by default)"
	printf '\t%s\n' "-h,--help: Prints help"
}

# The parsing of the command-line
parse_commandline ()
{
	while test $# -gt 0
	do
		_key="$1"
		case "$_key" in
			# The gpu argurment doesn't accept a value,
			# we expect the --gpu, so we watch for it.
			--no-gpu|--gpu)
				_arg_gpu="on"
				test "${1:0:5}" = "--no-" && _arg_gpu="off"
				;;
			# See the comment of option '--gpu' to see what's going on here - principle is the same.
			-h|--help)
				print_help
				exit 0
				;;
			# We support getopts-style short arguments clustering,
			# so as -h doesn't accept value, other short options may be appended to it, so we watch for -h*.
			# After stripping the leading -h from the argument, we have to make sure
			# that the first character that follows coresponds to a short option.
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

# Now call all the functions defined above that are needed to get the job done
parse_commandline "$@"

# OTHER STUFF GENERATED BY Argbash

### END OF CODE GENERATED BY Argbash (sortof) ### ])
# [ <-- needed because of Argbash

finish()
{
    if [ "$_arg_gpu" = on ];
	then
	    CURRENT_UID=$(id -u):$(id -g)  docker-compose -f docker-compose.yml -f docker-compose.notebook.yml  -f docker-compose.gpu.yml stop notebook postgres
	else
	    CURRENT_UID=$(id -u):$(id -g)  docker-compose -f docker-compose.yml -f docker-compose.notebook.yml  stop notebook postgres
	fi 
    exit
}
trap finish SIGINT


if [ "$_arg_gpu" = on ];
then
    CURRENT_UID=$(id -u):$(id -g) docker-compose -f docker-compose.yml -f docker-compose.notebook.yml -f docker-compose.gpu.yml up --build -d notebook postgres
else
    CURRENT_UID=$(id -u):$(id -g) docker-compose -f docker-compose.yml -f docker-compose.notebook.yml up --build -d notebook postgres
fi

time=$(date +"%s")
until docker logs --since $time NLPNotebook 2>&1 | grep -m 1 "127.0.0.1"; do sleep 5 ; done
token=$(docker logs --since $time NLPNotebook 2>&1 | grep '127.0.0.1' | grep -m 1 -oP 'token=\K(.*)')

xdg-open http://localhost:5436/?token=$token



while :; do
    sleep 5
done

# ] <-- needed because of Argbash
