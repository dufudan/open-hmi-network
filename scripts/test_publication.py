"""Regression tests for the pre-IndexNow deployment gate; no network requests."""
from pathlib import Path
import tempfile
import unittest
import urllib.error
from wait_for_publication import SITE, local_path, normalized, targets, verify

class Response:
    def __init__(self, body, url=SITE+'/', status=200, headers=None):
        self.body, self.url, self.status = body, url, status
        self.headers=headers or {}
    def read(self): return self.body
    def __enter__(self): return self
    def __exit__(self, *args): pass

class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        (self.root/'index.html').write_bytes(b'new homepage\r\n')
    def tearDown(self): self.temp.cleanup()
    def run_probe(self, response):
        return verify(SITE+'/', 'abc123', self.root, lambda request,timeout:response)[1]
    def test_new_page_and_newlines_match(self):
        self.assertIsNone(self.run_probe(Response(b'new homepage\n')))
    def test_old_homepage_rejected_even_if_key_already_public(self):
        self.assertEqual(self.run_probe(Response(b'old homepage\n')), 'content differs from checkout')
    def test_success_status_with_noindex_rejected(self):
        self.assertEqual(self.run_probe(Response(b'new homepage\n',headers={'X-Robots-Tag':'noindex'})), 'unexpected X-Robots-Tag noindex')
    def test_unexpected_host_rejected(self):
        self.assertEqual(self.run_probe(Response(b'new homepage\n',url='https://example.invalid/')), 'unexpected redirect host')
    def test_http_failure_rejected(self):
        self.assertEqual(self.run_probe(Response(b'new homepage\n',status=503)), 'HTTP 503')
    def test_network_error_rejected(self):
        def unavailable(request, timeout): raise urllib.error.URLError('offline')
        self.assertEqual(verify(SITE+'/', 'abc123', self.root, unavailable)[1], 'URLError')
    def test_directory_mapping(self):
        self.assertEqual(local_path(SITE+'/tools/lvgl-memory-estimator/'), 'tools/lvgl-memory-estimator/index.html')
    def test_all_publication_targets_exist(self):
        from wait_for_publication import ROOT
        self.assertEqual(len(targets(ROOT)),49)

if __name__=='__main__': unittest.main()
