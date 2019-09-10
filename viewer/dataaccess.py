# -*- coding: UTF-8 -*-
from __future__ import unicode_literals
import re
import json
try:
    from urllib.parse import urlparse, urljoin
except ImportError:
    from urlparse import urlparse, urljoin
from collections import namedtuple

import requests
from werkzeug.datastructures import MultiDict

from .util import as_iterable
from .vocabview import VocabView, ID, TYPE, CONTEXT, GRAPH, REVERSE
#from .graphcache import GraphCache, vocab_source_map


IDKBSE = "https://id.kb.se/"
LIBRIS = "https://libris.kb.se/"

LEGACY_BASE = "http://libris.kb.se/"
LEGACY_PATHS = ('/resource/auth/', '/auth/',
        '/resource/bib/', '/bib/',
        '/resource/hold/', '/hold/')


ui_defs = {
    REVERSE: {'label': "Saker som länkar hit"},
    ID: {'label': "URI"},
    TYPE: {'label': "Typ"},
    'SEARCH_RESULTS': {'label': "Sökresultat"},
    'SEE_ALL': {'label': "Se alla"},
    'FACET_LABELS': {
        '@type': 'Typ',
        'carrierType': 'Bärartyp',
        'instanceOf.@type': 'Verkstyp',
        'issuanceType': 'Utgivningssätt',
        'instanceOf.contentType': 'Verksinnehållstyp',
        'instanceOf.language': 'Verksspråk',
        'publication.date': 'Utgivningsdatum',
        'inScheme.@id': 'Termsystem',
        'inCollection.@id': 'Termsamling'
    }
}

sites = {
    IDKBSE: {
        ID: IDKBSE,
        TYPE: "DataCatalog",
        "title": "id.kb.se",
        "summary": {ID: "/doc/summary"},
        "stylesheet": {"name": "id.css"},
        "statsindex": '{"inScheme.@id":{"inCollection.@id":["@type"], "@type":[]}}',
        "statsfind": '{"inScheme.@id":{"inCollection.@id":["@type"], "@type":[]}}',
        "filter_param": "inScheme.@id",
        "itemList": [
            {ID: "/doc/about", "title": "Om id.kb.se", "icon": "info-circle"},
            {ID: "/marcframe", "title": "MARC-mappningar", "icon": "exchange"},
            {ID: "/vocab", "title": "Basvokabulär", "icon": "book"}
        ]
    },
    LIBRIS: {
        ID: LIBRIS,
        TYPE: "DataCatalog",
        "title": "libris.kb.se",
        "summary": {"articleBody": "<p>Data på <b>LIBRIS.KB.SE</b>.</p>"},
        "statsindex": '{"@type": []}',
        "filter_param": "@type",
            # TODO: + @reverse.itemOf.heldBy.@id (and/or count)?
        #"stats": {"@type":{"meta.bibliography.@id":{"publication.providerDate":[]}}}
        "statsfind":
        """
            {
                "instanceOf.language.@id":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "carrierType":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "instanceOf.@type":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "publication.year":{
                    "sort":"key",
                    "sortOrder":"desc",
                    "size":500
                },
                "issuanceType":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "meta.encodingLevel":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "@type":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "inScheme.@id":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                },
                "inCollection.@id":{
                    "sort":"value",
                    "sortOrder":"desc",
                    "size":100
                }
            }
        """,
        "itemList": [
        #    {ID: "/doc/about#", "title": "Om libris.kb.se", "icon": "info-circle"},
        ]
    }
}

# "instanceOf.contentType.@id":{
#                     "sort":"key",
#                     "sortOrder":"asc",
#                     "size":100
#                 },


class DataAccess(object):

    def __init__(self, config):
        self.lang = config['LANG']
        self.vocab_uri = config['VOCAB_IRI']
        self.context_uri = config['CONTEXT_IRI']
        self.display_uri = config['DISPLAY_IRI']
        self.ui_defs = ui_defs
        self.urimap = UriMap(config.get('BASE_URI_ALIAS') or {})
        self._api_base = config['WHELK_REST_API_URL']
        self._vocab = None

    @property
    def vocab(self):
        if not self._vocab: # TODO: or cache time is up...
            self._vocab = self.setup_vocab_view()
        return self._vocab

    @property
    def jsonld_context_data(self):
        return self.vocab.context_data

    def api_request(self, url_path, method='GET', headers=None,
                    json_data=None, query_params=MultiDict([])):
        url = self._get_api_url(url_path)
        json_data = json.dumps(json_data)
        return requests.request(method, url, data=json_data, headers=headers,
                            params=query_params.to_dict(flat=False),
                            allow_redirects=False)

    def _get_api_url(self, url_path):
        if url_path.startswith(self._api_base):
            return url_path

        if url_path.startswith('/'):
            url_path = url_path[1:]
        return '%s/%s' % (self._api_base, url_path)

    def load_from_whelk(self, url):
        return self.api_request(url).json()

    def find_in_whelk(self, query=None, limit=None, stats=None):
        query = query or MultiDict([])
        if 'q' not in query:
            query.add('q', '*')
        if limit is not None and '_limit' not in query:
            query.add('_limit', limit)
        if stats and '_statsrepr' not in query:
            query.add('_statsrepr', stats)
        return self.api_request('find', query_params=query).json()

    def get_index_stats(self, statstree):
        results = self.find_in_whelk(limit=0, stats=statstree)
        return results.get('stats')

    def get_site(self, site_id):
        site = sites.get(site_id)
        if not site:
            return None
        summary = site.get('summary')
        if summary and ID in summary and len(summary) == 1:
            try:
                # TODO: conneg on json instead of tampering with the url!
                article_id = urljoin(site_id, summary[ID] + '/data.json')
                doc = self.load_from_whelk(article_id)
                summary.update(doc)
            except ValueError:
                pass
        return site

    def setup_vocab_view(self):
        vocab = self._load_required(self.vocab_uri)
        context = self._load_required(self.context_uri)
        display = self._load_required(self.display_uri)
        return VocabView(vocab, context, display, lang=self.lang)

    def _load_required(self, uri):
        resp = self.api_request(uri)
        if resp.status_code == 302:
            return self._load_required(resp.headers.get('Location'))
        else:
            data = resp.json()
            etag = resp.headers.get('ETag')
            assert data, 'Failed to get {} from whelk'.format(uri)
            return ApiResource(uri, data, etag)


ApiResource = namedtuple('ApiResource', 'uri, data, etag')


class UriMap(object):

    def __init__(self, base_uri_alias):
        self._base_uri_alias = base_uri_alias
        self._alias_uri_map = {v: k for k, v in self._base_uri_alias.items()}

    def to_canonical_uri(self, url):
        """
        Turn a mapped URI into the formal URI.
        """
        parsedurl = urlparse(url)
        if parsedurl.path.startswith(LEGACY_PATHS):
            uri_base = LEGACY_BASE
        else:
            uri_base = parsedurl._replace(path="/").geturl()
        canonical_base = self._alias_uri_map.get(uri_base) or uri_base
        return urljoin(canonical_base, parsedurl.path)

    def to_view_url(self, url_root, uri):
        if uri.startswith('/'):
            return uri

        url = urlparse(uri)
        uri_base = url._replace(path="/").geturl()
        uri_path = url.path

        if uri_base in self._base_uri_alias:
            return urljoin(self._base_uri_alias[uri_base], uri_path)
        elif uri_base == self.to_canonical_uri(url_root):
            return uri_path
        else:
            return uri
