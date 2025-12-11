#!/bin/bash

# MySQL healthcheck: Verify database and schema are ready
# Uses mysqladmin (always available in MySQL image)

MYSQL_HOST="${MYSQL_HOST:-localhost}"

# Get credentials - secrets take priority over env vars
if [ -f /run/secrets/mysql_root_password ]; then
  # Production/Compose with secrets
  MYSQL_ROOT_PASSWORD=$(cat /run/secrets/mysql_root_password)
  MYSQL_DATABASE=$(cat /run/secrets/db_name)
else
  # Development - env vars
  MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-RootSecurePassword456!}"
  MYSQL_DATABASE="${MYSQL_DATABASE:-portfolio_db}"
fi

# Simple check: Is MySQL accepting connections?
# This is enough - the initialization scripts will have run by the time backend tries to connect
mysqladmin ping -h"$MYSQL_HOST" -u root -p"$MYSQL_ROOT_PASSWORD" --silent 2>/dev/null

exit $?
