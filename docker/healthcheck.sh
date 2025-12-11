#!/bin/bash

# MySQL healthcheck: Verify database and schema are ready
# Supports both dev (env vars) and prod (Docker secrets)

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

# Try to query the projects table
# This proves: MySQL is responding + database exists + schema was initialized
mysql -h"$MYSQL_HOST" -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
  --connect-timeout=3 \
  -e "SELECT 1 FROM projects LIMIT 1;" > /dev/null 2>&1

exit $?
