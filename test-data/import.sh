#!/bin/bash -e
#
# This script imports the testdata from this directory into the postgres database
#

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"  # default for postgres docker image
POSTGRES_USER="${POSTGRES_USER:-postgres}"  # default for postgres docker image
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-msm}"  # default for postgres docker image

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

(
    copy_cmd sites.csv 'site(id, city, country, latitude, longitude, name, name_unique, note, region, street, timezone, url, accepted, created)'
    copy_cmd tokens.csv 'token(value, expired, created)'
    copy_cmd users.csv '"user"(email, username, full_name, password, is_admin, auth_id)'
    copy_cmd site_data.csv 'site_data(site_id, allocated_machines, deployed_machines, ready_machines, error_machines, other_machines, last_seen)'
) | psql --single-transaction "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
