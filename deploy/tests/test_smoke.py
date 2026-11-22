"""Offline unit tests for deploy/smoke_test.py (the network is mocked).

Run (repo root):  python3 -m unittest discover -s deploy/tests -p 'test_smoke.py'
CI runs it too (.github/workflows/ci-docker.yml).

Covers: public checks pass and login is skipped without credentials; a wrong
health body or a DB that is not ready fails; with credentials the smoke customer
logs in (cookie session), sees a non-empty menu and is always logged out.
"""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('smoke', Path(__file__).parents[1] / 'smoke_test.py')
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)

CREDS = {'SMOKE_EMAIL': 'smoke@cafe.test', 'SMOKE_PASSWORD': 'test-only'}


class SmokeTests(unittest.TestCase):
    def response(self, opener, base, path, data=None):
        return {
            '/api/health': b'{"ok":true}',
            '/api/ready': b'{"status":"ready","db":"connected"}',
            '/': b'<!doctype html><html></html>',
            '/api/auth/login': b'{"id":"u1","name":"Smoke","role":"CUSTOMER"}',
            '/api/menu': b'[{"id":"m1","name":"Latte","price":6000,"isAvailable":true}]',
            '/api/auth/logout': b'',
        }[path]

    def paths(self, req):
        return [c.args[2] for c in req.call_args_list]

    @patch.dict('os.environ', {}, clear=True)
    def test_public_checks_pass_and_skip_optional_login(self):
        with patch.object(smoke, 'request', side_effect=self.response) as req:
            smoke.check('https://demo.test')
        self.assertEqual(self.paths(req), ['/api/health', '/api/ready', '/'])

    @patch.dict('os.environ', {}, clear=True)
    def test_wrong_health_body_fails(self):
        def kit_style(opener, base, path, data=None):
            return b'{"status":"ok"}' if path == '/api/health' else self.response(opener, base, path)
        with patch.object(smoke, 'request', side_effect=kit_style), patch.object(smoke.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, '/api/health'):
                smoke.check('https://demo.test')

    @patch.dict('os.environ', {}, clear=True)
    def test_db_not_ready_fails_even_when_http_responds(self):
        def disconnected(opener, base, path, data=None):
            return b'{"status":"not_ready"}' if path == '/api/ready' else self.response(opener, base, path)
        with patch.object(smoke, 'request', side_effect=disconnected), patch.object(smoke.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, '/api/ready'):
                smoke.check('https://demo.test')

    @patch.dict('os.environ', {'SMOKE_EMAIL': 'smoke@cafe.test'}, clear=True)
    def test_only_one_credential_is_an_error(self):
        with patch.object(smoke, 'request', side_effect=self.response):
            with self.assertRaisesRegex(RuntimeError, 'both'):
                smoke.check('https://demo.test')

    @patch.dict('os.environ', CREDS, clear=True)
    def test_login_menu_logout_share_one_cookie_session(self):
        with patch.object(smoke, 'request', side_effect=self.response) as req:
            smoke.check('https://demo.test')
        self.assertEqual(self.paths(req)[3:], ['/api/auth/login', '/api/menu', '/api/auth/logout'])
        openers = {id(c.args[0]) for c in req.call_args_list[3:]}
        self.assertEqual(len(openers), 1, 'login, menu and logout must use the same cookie jar')
        self.assertEqual(req.call_args_list[3].args[3], {'email': 'smoke@cafe.test', 'password': 'test-only'})

    @patch.dict('os.environ', CREDS, clear=True)
    def test_empty_menu_fails_and_still_logs_out(self):
        def empty_menu(opener, base, path, data=None):
            return b'[]' if path == '/api/menu' else self.response(opener, base, path)
        with patch.object(smoke, 'request', side_effect=empty_menu) as req:
            with self.assertRaisesRegex(RuntimeError, 'Login smoke'):
                smoke.check('https://demo.test')
        self.assertEqual(self.paths(req)[-1], '/api/auth/logout')

    @patch.dict('os.environ', CREDS, clear=True)
    def test_failed_login_does_not_call_logout(self):
        def bad_login(opener, base, path, data=None):
            if path == '/api/auth/login':
                raise ValueError('401')
            return self.response(opener, base, path)
        with patch.object(smoke, 'request', side_effect=bad_login) as req:
            with self.assertRaisesRegex(RuntimeError, 'Login smoke'):
                smoke.check('https://demo.test')
        self.assertNotIn('/api/auth/logout', self.paths(req))


if __name__ == '__main__':
    unittest.main()
