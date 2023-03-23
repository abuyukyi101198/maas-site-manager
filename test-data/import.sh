#!/bin/sh
#
# This script imports the testdata from this directory into the postgres database
#
psql=psql
envfile="../.env.dev"

if ! command -v psql > /dev/null
then
  echo "The ${psql} command was not found. It is need it to import the data. Try:"
  echo "apt-get install postgresql-client"
  exit 1
fi

if ! test -s ${envfile}
then
  echo "Cannot source dev environment. Make sure ../.env.dev exists."
  exit 1
fi
. ${envfile}

docker compose cp users.csv postgres:/
docker compose cp sites.csv postgres:/
docker compose cp tokens.csv postgres:/
docker compose cp site_data.csv postgres:/

${psql} postgresql://"${POSTGRES_USER}":"${POSTGRES_PASSWORD}"@localhost:"${POSTGRES_PORT}"/"${POSTGRES_DB}" -f import.sql
