#!/bin/sh

# Errors are fatal
set -e

echo "# "
echo "# Installing modules"
echo "# "
npm install

if test "$1"
then
	echo "# "
	echo "# Argument specified! Executing command: $@"
	echo "# "
	echo "# Run 'npm start' to start the website."
	echo "# "
	exec $@
fi

cd /mnt

echo "# "
echo "# Running 'npm start'"
echo "# "
npm start


