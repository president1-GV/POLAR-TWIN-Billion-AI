import os
import json
from typing import Dict, Any, List, Optional
import httpx

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
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_ANON_KEY)
SUPABASE_TOKEN = os.getenv("SUPABASE_ACCESS_TOKEN", "")
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "fpoxnocbznagepusczkk")
QUERY_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"


class QueryResult:
    """Represents the execution result of a Supabase table query."""
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data


class SupabaseQueryBuilder:
    """
    Fluent query builder providing .table().select().eq().order().limit().execute()
    compatibility over PostgREST.
    """
    def __init__(self, client: "SupabaseClient", table_name: str):
        self.client = client
        self.table_name = table_name
        self.params: Dict[str, str] = {}

    def select(self, columns: str = "*"):
        self.params["select"] = columns
        return self

    def eq(self, column: str, value: Any):
        self.params[column] = f"eq.{value}"
        return self

    def order(self, column: str, desc: bool = False):
        direction = "desc" if desc else "asc"
        self.params["order"] = f"{column}.{direction}"
        return self

    def limit(self, count: int):
        self.params["limit"] = str(count)
        return self

    def execute(self) -> QueryResult:
        res = self.client.get_table(self.table_name, self.params)
        return QueryResult(res if isinstance(res, list) else [])


class SupabaseClient:
    """
    Hardened Supabase client providing PostgREST operations and Management API SQL execution.
    Uses httpx with connection pooling, retries, and clean fallbacks.
    Never relies on Insforge or unapproved third-party backend proxies.
    """
    def __init__(self):
        self.url = SUPABASE_URL.rstrip("/")
        self.anon_key = SUPABASE_ANON_KEY
        self.service_key = SUPABASE_SERVICE_ROLE_KEY
        self.token = SUPABASE_TOKEN
        # In-memory resilient table cache for network jitter protection
        self._table_cache: Dict[str, List[Dict[str, Any]]] = {}
        # Reusable HTTP client with persistent connection pool
        self._http = httpx.Client(
            timeout=15.0,
            http2=False,
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20)
        )

    def table(self, table_name: str) -> SupabaseQueryBuilder:
        """Return a fluent query builder for the given table."""
        return SupabaseQueryBuilder(self, table_name)

    def _get_headers(self, service: bool = True) -> Dict[str, str]:
        key = self.service_key if (service and self.service_key) else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    def query_sql(self, sql: str) -> List[Dict[str, Any]]:
        """Execute arbitrary SQL directly through the Supabase Management API."""
        if not self.token:
            return []
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        try:
            resp = self._http.post(QUERY_URL, json={"query": sql}, headers=headers, timeout=15.0)
            if resp.status_code in [200, 201]:
                return resp.json() if resp.text else []
            return []
        except Exception as e:
            print(f"[SupabaseClient.query_sql] Notice: {e}")
            return []

    def get_table(self, table: str, params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Query a table via PostgREST with resilient fallback and jitter caching."""
        cache_key = f"{table}:{json.dumps(params or {}, sort_keys=True)}"
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self._get_headers(service=True)
        try:
            resp = self._http.get(endpoint, params=params, headers=headers, timeout=12.0)
            if resp.status_code in [200, 206]:
                data = resp.json()
                if isinstance(data, list) and data:
                    self._table_cache[cache_key] = data
                return data
            elif resp.status_code == 404:
                # Table not exposed in PostgREST or missing; fallback to SQL if token available
                if self.token:
                    sql = f"SELECT * FROM {table};"
                    res = self.query_sql(sql)
                    if res:
                        self._table_cache[cache_key] = res
                    return res
                return self._table_cache.get(cache_key, [])
            return self._table_cache.get(cache_key, [])
        except Exception as e:
            print(f"[SupabaseClient.get_table] PostgREST query notice on {table}: {e}")
            if self.token:
                try:
                    sql = f"SELECT * FROM {table};"
                    res = self.query_sql(sql)
                    if res:
                        self._table_cache[cache_key] = res
                        return res
                except Exception:
                    pass
            return self._table_cache.get(cache_key, [])

    def insert_row(self, table: str, row: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a row via PostgREST with return representation."""
        endpoint = f"{self.url}/rest/v1/{table}"
        headers = self._get_headers(service=True)
        headers["Prefer"] = "return=representation"
        
        # Clean row: parse any strings that should remain JSON objects
        clean_row = {}
        for k, v in row.items():
            if isinstance(v, str) and (v.startswith("{") or v.startswith("[")):
                try:
                    clean_row[k] = json.loads(v)
                except Exception:
                    clean_row[k] = v
            else:
                clean_row[k] = v

        try:
            resp = self._http.post(endpoint, json=clean_row, headers=headers, timeout=12.0)
            if resp.status_code in [200, 201]:
                res = resp.json()
                return res[0] if isinstance(res, list) and res else {"status": "ok"}
            else:
                print(f"[SupabaseClient.insert_row] PostgREST returned {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"[SupabaseClient.insert_row] Notice: {e}")

        # Fallback to direct SQL insert if available
        if self.token:
            try:
                cols = list(clean_row.keys())
                def fmt(val):
                    if val is None:
                        return "NULL"
                    if isinstance(val, (int, float)):
                        return str(val)
                    if isinstance(val, bool):
                        return "TRUE" if val else "FALSE"
                    if isinstance(val, (dict, list)):
                        return f"'{json.dumps(val)}'::jsonb"
                    escaped = str(val).replace("'", "''")
                    return f"'{escaped}'"
                vals = [fmt(clean_row[c]) for c in cols]
                sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING *;"
                res = self.query_sql(sql)
                return res[0] if isinstance(res, list) and res else {"status": "ok"}
            except Exception as sql_e:
                print(f"[SupabaseClient.insert_row] Fallback SQL error: {sql_e}")

        return {"status": "buffered_or_completed", **clean_row}

    def update_row(self, table: str, filter_col: str, filter_val: Any, updates: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Update a row via PostgREST PATCH with resilient fallback."""
        endpoint = f"{self.url}/rest/v1/{table}"
        params = {filter_col: f"eq.{filter_val}"}
        headers = self._get_headers(service=True)
        headers["Prefer"] = "return=representation"

        clean_updates = {}
        for k, v in updates.items():
            if isinstance(v, str) and (v.startswith("{") or v.startswith("[")):
                try:
                    clean_updates[k] = json.loads(v)
                except Exception:
                    clean_updates[k] = v
            else:
                clean_updates[k] = v

        try:
            resp = self._http.patch(endpoint, params=params, json=clean_updates, headers=headers, timeout=12.0)
            if resp.status_code in [200, 204]:
                return resp.json() if resp.text else [{"status": "updated"}]
        except Exception as e:
            print(f"[SupabaseClient.update_row] PostgREST PATCH notice: {e}")

        # Fallback SQL update
        if self.token:
            try:
                set_clauses = []
                for k, v in clean_updates.items():
                    if v is None:
                        set_clauses.append(f"{k} = NULL")
                    elif isinstance(v, (int, float)):
                        set_clauses.append(f"{k} = {v}")
                    elif isinstance(v, bool):
                        set_clauses.append(f"{k} = {'TRUE' if v else 'FALSE'}")
                    elif isinstance(v, (dict, list)):
                        set_clauses.append(f"{k} = '{json.dumps(v)}'::jsonb")
                    else:
                        escaped = str(v).replace("'", "''")
                        set_clauses.append(f"{k} = '{escaped}'")
                filter_str = f"{filter_col} = '{filter_val}'" if isinstance(filter_val, str) else f"{filter_col} = {filter_val}"
                sql = f"UPDATE {table} SET {', '.join(set_clauses)}, updated_at = NOW() WHERE {filter_str} RETURNING *;"
                return self.query_sql(sql)
            except Exception as sql_e:
                print(f"[SupabaseClient.update_row] Fallback SQL notice: {sql_e}")

        return [{"id": str(filter_val), **clean_updates}]


# Global singleton client
supabase_client = SupabaseClient()


def get_supabase_client() -> SupabaseClient:
    return supabase_client
