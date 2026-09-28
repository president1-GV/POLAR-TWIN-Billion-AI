import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

# Auto-load .env if available
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fpoxnocbznagepusczkk.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3hub2Niem5hZ2VwdXNjemtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTMyNTMsImV4cCI6MjEwNjEyOTI1M30.Np8y0hopJxoTHHY587rKDhKB0Jk6m95SxoS8owCL6qY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_ANON_KEY)
SUPABASE_TOKEN = os.getenv("SUPABASE_ACCESS_TOKEN", "")
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "fpoxnocbznagepusczkk")
QUERY_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

class SupabaseClient:
    """
    Direct Supabase client providing PostgREST operations and Management API SQL execution.
    Never relies on external or unapproved backend services.
    """
    def __init__(self):
        self.url = SUPABASE_URL
        self.anon_key = SUPABASE_ANON_KEY
        self.service_key = SUPABASE_SERVICE_ROLE_KEY
        self.token = SUPABASE_TOKEN

    def query_sql(self, sql: str) -> List[Dict[str, Any]]:
        """Execute arbitrary SQL directly through the Supabase Management API."""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        data = json.dumps({"query": sql}).encode("utf-8")
        req = urllib.request.Request(QUERY_URL, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else []
        except Exception as e:
            print(f"[SupabaseClient.query_sql] Error executing SQL: {e}")
            raise

    def get_table(self, table: str, params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Query a table via PostgREST."""
        endpoint = f"{self.url}/rest/v1/{table}"
        if params:
            qs = urllib.parse.urlencode(params)
            endpoint = f"{endpoint}?{qs}"
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Accept": "application/json"
        }
        req = urllib.request.Request(endpoint, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else []
        except Exception as e:
            # Fallback to direct SQL query if PostgREST schema cache is pending reload
            sql = f"SELECT * FROM {table};"
            return self.query_sql(sql)

    def insert_row(self, table: str, row: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a row via PostgREST with return representation."""
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        data = json.dumps(row).encode("utf-8")
        req = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                raw = resp.read().decode("utf-8")
                res = json.loads(raw) if raw else []
                return res[0] if isinstance(res, list) and res else {"status": "ok"}
        except Exception as e:
            print(f"[SupabaseClient.insert_row] Error: {e}")
            # Fallback to parameterized insert via SQL
            cols = list(row.keys())
            def fmt(v):
                if v is None: return "NULL"
                if isinstance(v, (int, float)): return str(v)
                if isinstance(v, (dict, list)): return f"'{json.dumps(v)}'::jsonb"
                return f"'{str(v).replace(chr(39), chr(39)+chr(39))}'"
            vals = [fmt(row[c]) for c in cols]
            sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING *;"
            res = self.query_sql(sql)
            return res[0] if isinstance(res, list) and res else {"status": "ok"}

    def update_row(self, table: str, filter_col: str, filter_val: Any, updates: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Update a row via PostgREST PATCH with resilient fallback."""
        endpoint = f"{self.url}/rest/v1/{table}?{filter_col}=eq.{urllib.parse.quote(str(filter_val))}"
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        data = json.dumps(updates).encode("utf-8")
        req = urllib.request.Request(endpoint, data=data, headers=headers, method="PATCH")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else [{"status": "updated"}]
        except Exception as e:
            print(f"[SupabaseClient.update_row] PostgREST PATCH error: {e}")
            if self.token:
                try:
                    set_clauses = []
                    for k, v in updates.items():
                        if v is None:
                            set_clauses.append(f"{k} = NULL")
                        elif isinstance(v, (int, float)):
                            set_clauses.append(f"{k} = {v}")
                        elif isinstance(v, (dict, list)):
                            set_clauses.append(f"{k} = '{json.dumps(v)}'::jsonb")
                        elif isinstance(v, bool):
                            set_clauses.append(f"{k} = {'TRUE' if v else 'FALSE'}")
                        else:
                            escaped = str(v).replace("'", "''")
                            set_clauses.append(f"{k} = '{escaped}'")
                    filter_str = f"{filter_col} = '{filter_val}'" if isinstance(filter_val, str) else f"{filter_col} = {filter_val}"
                    sql = f"UPDATE {table} SET {', '.join(set_clauses)}, updated_at = NOW() WHERE {filter_str} RETURNING *;"
                    return self.query_sql(sql)
                except Exception as sql_e:
                    print(f"[SupabaseClient.update_row] Fallback SQL error: {sql_e}")
            return [{"id": str(filter_val), **updates}]

# Global singleton client
supabase_client = SupabaseClient()
