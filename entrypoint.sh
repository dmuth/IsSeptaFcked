#!/bin/sh

# Errors are fatal
set -e

if test "$1"
then
	echo "# "
	echo "# Argument specified! Executing command: $@"
	echo "# "
	exec $@
fi

cd /mnt

echo "# "
echo "# Running 'npm start'"
echo "# "
npm start


