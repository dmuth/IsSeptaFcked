#!/bin/sh

# Errors are fatal
set -e


echo "# "
echo "# Changing to /app directory..."
echo "# "
cd /app

echo "# "
echo "# Installing modules"
echo "# "
npm install

if test "$1"
then
	echo "# "
	echo "# Argument specified! Executing command: $@"
	echo "# "
    echo "# You are currently in directory $(pwd)"
    echo "# "
    echo "# If you are in prod, make sure you're in /app"
    echo "# If you're in dev, make sure you're in /mnt and mounted the code directory."
    echo "# "
    echo "# "
	echo "# Run 'npm start' to start the website."
	echo "# "
	exec $@
fi

echo "# "
echo "# Running 'npm start'"
echo "# "
npm start


