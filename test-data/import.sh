#!/bin/bash -e
#
# This script imports the testdata from this directory into the postgres database
#
envfile="../.env.dev"

basedir="$(dirname "$0")"

copy_cmd() {
    local filename="$1"
    local tabledef="$2"
    cat <<EOF
COPY $tabledef
FROM STDIN
DELIMITER ','
QUOTE '"'
CSV HEADER;
$(< "$basedir/$filename")
\.
EOF
}


if ! command -v psql > /dev/null; then
    cat >&2 <<EOF
The psql command was not found. It is need it to import the data. Try:
  apt-get install postgresql-client
EOF
    exit 1
fi

if [ -e "$envfile" ]; then
    # shellcheck disable=SC1090
    . "$envfile"
else 
    echo "Cannot source dev environment. Make sure ${envfile} exists." >&2
    exit 1
fi

(
    copy_cmd sites.csv 'site(id, city, country, latitude, longitude, name, note, region, street, timezone, url)'
    copy_cmd tokens.csv 'token(site_id, value, expired, created)'
    copy_cmd users.csv '"user"(email, full_name, disabled, password)'
    copy_cmd site_data.csv 'site_data(site_id, allocated_machines, deployed_machines, ready_machines, error_machines, last_seen)'
) | psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
