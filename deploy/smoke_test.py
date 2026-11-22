"""Public deployment checks for Food-order. Passwords are never printed.

WHAT THIS SCRIPT DOES
    Called by .github/workflows/deploy.yml after a deployment:
        python3 deploy/smoke_test.py SERVICE_URL
    It checks the live service and exits non-zero (failing the workflow) if any
    check fails. Each public check is retried up to 5 times, 3 seconds apart, to
    allow for a Cloud Run cold start.

    Checks (in order)
      1. GET /api/health  -> {"ok": true}
      2. GET /api/ready   -> {"db": "connected"}   (proves the database works)
      3. GET /            -> HTML page (the built React app is served)
      4. OPTIONAL login   -> POST /api/auth/login, GET /api/menu (non-empty, so
         migration + seed worked), POST /api/auth/logout. Runs only if BOTH env
         vars SMOKE_EMAIL and SMOKE_PASSWORD are set (set both or neither).
         Our app uses a session cookie, so these calls share one cookie jar.
         After a successful login the session is always logged out.

    Uses only the Python standard library. Offline tests: deploy/tests/test_smoke.py
    Based on the Lab 5 starter kit (token login replaced by our cookie login).
"""
import http.cookiejar
import json
import os
import sys
import time
import urllib.error
import urllib.request


# --- HTTP helper --------------------------------------------------------------
# Returns the response body (bytes). Raises on HTTP errors / timeouts.
def request(opener, base, path, data=None):
    headers = {'Content-Type': 'application/json'} if data is not None else {}
    req = urllib.request.Request(base + path, headers=headers,
        data=json.dumps(data).encode() if data is not None else None)
    with opener.open(req, timeout=30) as response:
        return response.read()


def new_session():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))


def check(base):
    public = new_session()
    for path, predicate in (
        ('/api/health', lambda b: json.loads(b).get('ok') is True),
        ('/api/ready', lambda b: json.loads(b).get('db') == 'connected'),
        ('/', lambda b: b'<html' in b.lower()),
    ):
        # Retry: a cold Cloud Run instance may need a few seconds to start.
        for attempt in range(5):
            try:
                if not predicate(request(public, base, path)):
                    raise ValueError('Unexpected response')
                break
            except (urllib.error.URLError, TimeoutError, ValueError):
                if attempt == 4:
                    raise RuntimeError('Smoke check failed: ' + path) from None
                time.sleep(3)
        print('PASS ' + path)

    # --- Optional login check (only when both credentials are provided) -------
    email, password = os.getenv('SMOKE_EMAIL'), os.getenv('SMOKE_PASSWORD')
    if bool(email) != bool(password):
        raise RuntimeError('Set both SMOKE_EMAIL and SMOKE_PASSWORD, or neither.')
    if not email:
        print('SKIP login: optional smoke credentials not configured')
        return
    session = new_session()
    logged_in = False
    try:
        request(session, base, '/api/auth/login', {'email': email, 'password': password})
        logged_in = True
        menu = json.loads(request(session, base, '/api/menu'))
        if not isinstance(menu, list) or not menu:
            raise ValueError('Empty menu')
        print('PASS login and /api/menu (' + str(len(menu)) + ' items)')
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise RuntimeError('Login smoke check failed') from None
    finally:
        # Always end the session, even when the menu check failed.
        if logged_in:
            request(session, base, '/api/auth/logout', data={})
            print('PASS logout')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Usage: python3 deploy/smoke_test.py SERVICE_URL')
    check(sys.argv[1].rstrip('/'))
