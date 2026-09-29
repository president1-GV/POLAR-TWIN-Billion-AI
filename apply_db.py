import os
import sys
import httpx

# Auto-load .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

SUPABASE_TOKEN = os.getenv("SUPABASE_ACCESS_TOKEN", "")
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "fpoxnocbznagepusczkk")
QUERY_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

def run_sql(sql_content: str, label: str):
    print(f"Executing {label} via Supabase Management API...")
    if not SUPABASE_TOKEN:
        print(f"Notice: SUPABASE_ACCESS_TOKEN not set in environment. Skipping remote SQL execution.")
        return ""
    headers = {
        "Authorization": f"Bearer {SUPABASE_TOKEN}",
        "Content-Type": "application/json"
    }
    client = httpx.Client(timeout=30.0)
    try:
        resp = client.post(QUERY_URL, json={"query": sql_content}, headers=headers)
        if resp.status_code in [200, 201]:
            print(f"Success {label}: {resp.text[:120]}")
            return resp.text
        else:
            print(f"Warning {label}: HTTP {resp.status_code} - {resp.text[:200]}")
            return resp.text
    except Exception as e:
        print(f"Notice {label}: {e}")
        return ""

if __name__ == "__main__":
    if os.path.exists("supabase/schema.sql"):
        with open("supabase/schema.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()
        run_sql(schema_sql, "schema.sql")

    if os.path.exists("supabase/seed.sql"):
        with open("supabase/seed.sql", "r", encoding="utf-8") as f:
            seed_sql = f.read()
        run_sql(seed_sql, "seed.sql")

    print("Supabase schema and seed check completed.")
