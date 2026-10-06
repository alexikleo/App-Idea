#!/usr/bin/env bash
# Applies the Supabase stand-in, all migrations and the demo seed to a fresh
# database, then runs the security tests.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=fundi_test
dropdb --if-exists "$DB"
createdb "$DB"
psql_run() { psql -v ON_ERROR_STOP=1 -q -X -d "$DB" "$@"; }
psql_run -f tests/supabase_stub.sql
for f in migrations/*.sql; do
  echo "migrate: $f"
  psql_run -f "$f"
done
psql_run -f seed.sql
psql_run -f tests/rls_test.sql
