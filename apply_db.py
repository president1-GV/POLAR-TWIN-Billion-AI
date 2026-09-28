import json
import urllib.request
import os
import sys

SUPABASE_TOKEN = os.getenv("SUPABASE_ACCESS_TOKEN", "")
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "fpoxnocbznagepusczkk")
QUERY_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

def run_sql(sql_content: str, label: str):
    print(f"Executing {label}...")
    headers = {
        "Authorization": f"Bearer {SUPABASE_TOKEN}",
        "Content-Type": "application/json"
    }
    data = json.dumps({"query": sql_content}).encode("utf-8")
    req = urllib.request.Request(QUERY_URL, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            print(f"Success {label}: {body[:200]}")
            return body
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"Error {label}: {e.code} - {err}")
        sys.exit(1)

if __name__ == "__main__":
    with open("supabase/schema.sql", "r", encoding="utf-8") as f:
        schema_sql = f.read()
    run_sql(schema_sql, "schema.sql")

    with open("supabase/seed.sql", "r", encoding="utf-8") as f:
        seed_sql = f.read()
    run_sql(seed_sql, "seed.sql")

    print("Supabase schema and seed applied successfully!")
