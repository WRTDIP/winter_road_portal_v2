#!/usr/bin/env python3
"""
Database backup and restore utility.

Commands:
    export  - Export the database to a dated SQL dump file.
    import  - Import a SQL dump into the current database without creating duplicates.

Usage:
    # Export database (creates 2026-05-19_wramp.sql in current directory)
    python db_backup.py export

    # Export to a specific directory
    python db_backup.py export --output-dir ./backups

    # Import a dump file into the database (skips duplicates)
    python db_backup.py import --file 2026-05-19_wramp.sql
"""

import argparse
import os
import subprocess
import sys
from datetime import date
from pathlib import Path


def get_env_defaults():
    return {
        "host": os.environ.get("PGHOST", "localhost"),
        "port": os.environ.get("PGPORT", "5432"),
        "dbname": os.environ.get("PGDATABASE", "wramp"),
        "user": os.environ.get("PGUSER", "postgres"),
        "password": os.environ.get("PGPASSWORD", "password"),
    }


def run_export(args):
    """Export the database to a dated SQL file."""
    today = date.today().strftime("%Y-%m-%d")
    filename = f"{today}_{args.dbname}.sql"
    output_path = Path(args.output_dir) / filename

    Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["PGPASSWORD"] = args.password

    cmd = [
        "pg_dump",
        "-h", args.host,
        "-p", args.port,
        "-U", args.user,
        "-d", args.dbname,
        "--no-owner",
        "--no-privileges",
        "-f", str(output_path),
    ]

    print(f"Exporting database '{args.dbname}' to: {output_path}")
    result = subprocess.run(cmd, env=env, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: pg_dump failed:\n{result.stderr}", file=sys.stderr)
        return 1

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"Export complete: {output_path} ({size_mb:.1f} MB)")
    return 0


def run_import(args):
    """Import a SQL dump into the database without creating duplicates.

    Strategy: restore into a temporary schema, then merge rows that don't
    already exist in the public schema, and finally drop the temp schema.
    """
    dump_file = Path(args.file)
    if not dump_file.is_file():
        print(f"Error: File not found: {dump_file}", file=sys.stderr)
        return 1

    env = os.environ.copy()
    env["PGPASSWORD"] = args.password

    conninfo = f"host={args.host} port={args.port} dbname={args.dbname} user={args.user} password={args.password}"

    try:
        import psycopg
    except ImportError:
        print("Error: psycopg is required. Install with: pip install psycopg", file=sys.stderr)
        return 1

    temp_schema = "_import_temp"

    print(f"Importing '{dump_file}' into '{args.dbname}' (no duplicates)...")

    with psycopg.connect(conninfo) as conn:
        conn.autocommit = True
        with conn.cursor() as cur:
            # Create temp schema
            cur.execute(f"DROP SCHEMA IF EXISTS {temp_schema} CASCADE;")
            cur.execute(f"CREATE SCHEMA {temp_schema};")

    # Restore the dump into the temp schema
    cmd = [
        "pg_restore" if dump_file.suffix in (".dump", ".backup", ".pgdump") else "psql",
        "-h", args.host,
        "-p", args.port,
        "-U", args.user,
        "-d", args.dbname,
    ]

    if dump_file.suffix == ".sql" or dump_file.suffix == ".txt":
        # For plain SQL dumps, we need to redirect into the temp schema
        # Set search_path so all objects go into the temp schema
        sql_content = dump_file.read_text()
        modified_sql = f"SET search_path TO {temp_schema}, public;\n" + sql_content
        result = subprocess.run(
            ["psql", "-h", args.host, "-p", args.port, "-U", args.user, "-d", args.dbname],
            input=modified_sql,
            env=env,
            capture_output=True,
            text=True,
        )
    else:
        # For custom format dumps
        cmd = [
            "pg_restore",
            "-h", args.host,
            "-p", args.port,
            "-U", args.user,
            "-d", args.dbname,
            "--schema=public",
            f"--target-schema={temp_schema}",
            "--no-owner",
            "--no-privileges",
            str(dump_file),
        ]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)

    if result.returncode != 0 and "ERROR" in (result.stderr or ""):
        print(f"Warning: Some errors during restore:\n{result.stderr[:500]}", file=sys.stderr)

    # Merge data from temp schema into public, skipping duplicates
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            # Check what tables exist in the temp schema
            cur.execute(f"""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = '{temp_schema}' AND table_type = 'BASE TABLE';
            """)
            temp_tables = [row[0] for row in cur.fetchall()]

            if not temp_tables:
                print("Warning: No tables found in import. The dump may not have loaded correctly.")
                cur.execute(f"DROP SCHEMA IF EXISTS {temp_schema} CASCADE;")
                conn.commit()
                return 1

            print(f"Found {len(temp_tables)} table(s) to merge: {', '.join(temp_tables)}")

            for table in temp_tables:
                # Get columns for this table
                cur.execute(f"""
                    SELECT column_name FROM information_schema.columns
                    WHERE table_schema = '{temp_schema}' AND table_name = %s
                    ORDER BY ordinal_position;
                """, (table,))
                columns = [row[0] for row in cur.fetchall()]

                if not columns:
                    continue

                # Get primary key columns for conflict detection
                cur.execute(f"""
                    SELECT a.attname
                    FROM pg_index i
                    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                    WHERE i.indrelid = 'public.{table}'::regclass AND i.indisprimary;
                """)
                pk_columns = [row[0] for row in cur.fetchall()]

                cols_list = ", ".join(f'"{c}"' for c in columns)

                if pk_columns:
                    # Use INSERT ... ON CONFLICT DO NOTHING
                    pk_list = ", ".join(f'"{c}"' for c in pk_columns)
                    merge_sql = f"""
                        INSERT INTO public."{table}" ({cols_list})
                        SELECT {cols_list} FROM {temp_schema}."{table}"
                        ON CONFLICT ({pk_list}) DO NOTHING;
                    """
                else:
                    # No primary key: use NOT EXISTS to avoid duplicates
                    where_clause = " AND ".join(
                        f'public."{table}"."{c}" IS NOT DISTINCT FROM src."{c}"'
                        for c in columns
                    )
                    merge_sql = f"""
                        INSERT INTO public."{table}" ({cols_list})
                        SELECT {cols_list} FROM {temp_schema}."{table}" src
                        WHERE NOT EXISTS (
                            SELECT 1 FROM public."{table}"
                            WHERE {where_clause}
                        );
                    """

                cur.execute(merge_sql)
                row_count = cur.rowcount
                print(f"  {table}: {row_count} new row(s) inserted")

            # Clean up temp schema
            cur.execute(f"DROP SCHEMA IF EXISTS {temp_schema} CASCADE;")
        conn.commit()

    print("Import complete (duplicates skipped).")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Database backup and restore utility")
    subparsers = parser.add_subparsers(dest="command", required=True)

    defaults = get_env_defaults()

    # Export command
    export_parser = subparsers.add_parser("export", help="Export database to a dated SQL dump")
    export_parser.add_argument("--output-dir", default=".", help="Directory for the dump file")
    export_parser.add_argument("--host", default=defaults["host"])
    export_parser.add_argument("--port", default=defaults["port"])
    export_parser.add_argument("--dbname", default=defaults["dbname"])
    export_parser.add_argument("--user", default=defaults["user"])
    export_parser.add_argument("--password", default=defaults["password"])

    # Import command
    import_parser = subparsers.add_parser("import", help="Import a dump file without duplicates")
    import_parser.add_argument("--file", required=True, help="Path to the SQL dump file")
    import_parser.add_argument("--host", default=defaults["host"])
    import_parser.add_argument("--port", default=defaults["port"])
    import_parser.add_argument("--dbname", default=defaults["dbname"])
    import_parser.add_argument("--user", default=defaults["user"])
    import_parser.add_argument("--password", default=defaults["password"])

    args = parser.parse_args()

    if args.command == "export":
        return run_export(args)
    elif args.command == "import":
        return run_import(args)


if __name__ == "__main__":
    sys.exit(main() or 0)
