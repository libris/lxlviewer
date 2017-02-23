# -*- coding: UTF-8 -*-
from __future__ import unicode_literals
import re
import json
from urlparse import urlparse, urljoin

import requests

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
        'instanceOf.contentType': 'Verksinnehållstyp',
        'instanceOf.language': 'Verksspråk',
        'publication.date': 'Utgivningsdatum'
    }
}

sites = {
    IDKBSE: {
        ID: IDKBSE,
        "title": "id.kb.se",
        "description": """
            <p>
              <b>id.kb.se</b>
              är en tjänst under utveckling som tillgängliggör
              de grundstenar Kungliga biblioteket använder för att
              publicera strukturerad,
              <a href="https://sv.wikipedia.org/wiki/L%C3%A4nkad_data">länkad data</a>.
              Tjänsten innehåller en samling gemensamma definitioner
              och begrepp som hjälper till att samordna beskrivningar
              av vårt material.
            </p>
            <p>
              I första versionen av id.kb.se har vi lagt ut Svenska ämnesord,
              barnämnesord och genre/formtermer, som utgör viktiga byggstenar
              för denna samordning.<br/>
              I grunden finns ett basvokabulär med gemensamma egenskaper och
              typer.<br/>
              I möjligaste mån länkar alla definitioner till internationella,
              välkända motsvarigheter.
            </p>
        """,
        "stylesheet": {"name": "id.css"},
        "statsindex": '{"inScheme.@id":{"inCollection.@id":["@type"], "@type":[]}}',
        "filter_param": "inScheme.@id",
        "itemList": [
            {ID: "/doc/about", "title": "Om id.kb.se", "icon": "info-circle"},
            {ID: "/marcframe", "title": "MARC-mappningar", "icon": "exchange"},
            {ID: "/vocab", "title": "Basvokabulär", "icon": "book"}
        ]
    },
    LIBRIS: {
        ID: LIBRIS,
        "title": "libris.kb.se",
        "description": "<p>Data på <b>LIBRIS.KB.SE</b>.</p>",
        "statsindex": '{"instanceOf.@type": {"@type": []}}',
        "filter_param": "instanceOf.@type",
            # TODO: + @reverse.itemOf.heldBy.@id (and/or count)?
        #"stats": {"@type":{"meta.bibliography.@id":{"publication.providerDate":[]}}}
        "statsfind": '{"instanceOf.language.@id":{},"carrierType":{},"instanceOf.@type":{},"instanceOf.contentType.@id":{},"publication.date":{},"@type":{}}',
        "itemList": [
        #    {ID: "/doc/about#", "title": "Om libris.kb.se", "icon": "info-circle"},
        ]
    }
}


class DataAccess(object):

    def __init__(self, config):
        self.lang = config['LANG']
        self.vocab_uri = config['VOCAB_IRI']
        self.context_uri = config['CONTEXT_IRI']
        self.display_uri = config['DISPLAY_IRI']
        self.ui_defs = ui_defs
        self.urimap = UriMap(config.get('BASE_URI_ALIAS') or {})
        self._api_base = config['WHELK_REST_API_URL']

        self.vocab = self.setup_vocab_view()

    @property
    def jsonld_context_data(self):
        return self.vocab.context_data

    def api_request(self, url_path, method='GET', headers=None, json_data=None, query_params=[]):
        url = self._get_api_url(url_path)
        json_data = json.dumps(json_data)
        return requests.request(method, url, data=json_data, headers=headers,
                            params=query_params)

    def _get_api_url(self, url_path):
        if url_path.startswith('/'):
            url_path = url_path[1:]
        return '%s/%s' % (self._api_base, url_path)

    def load_from_whelk(self, url):
        return self.api_request(url).json()

    def find_in_whelk(self, query=None, limit=None, stats=None):
        query = query or {}
        if 'q' not in query:
            query['q'] = '*'
        if limit is not None and '_limit' not in query:
            query['_limit'] = limit
        if stats and '_statsrepr' not in query:
            query['_statsrepr'] = stats
        return self.api_request('find', query_params=query).json()

    def get_index_stats(self, statstree, site_base_uri):
        results = self.find_in_whelk(limit=0, stats=statstree)
        return {TYPE: 'DataCatalog', ID: site_base_uri, 'statistics': results.get('stats')}

    def find_ambiguity(self, request):
        raise NotImplementedError # FIXME: implement
        #kws = dict(request.args)
        #rtype = kws.pop('type', None)
        #q = kws.pop('q', None)
        #if q:
        #    q = " ".join(q)
        #    #parts = _tokenize(q)
        #example = {}
        #if rtype:
        #    rtype = rtype[0]
        #    example['@type'] = rtype
        #if q:
        #    example['label'] = q
        #if kws:
        #    example.update({k: v[0] for k, v in kws.items()})
        #
        #def pick_thing(rec):
        #    for item in rec.data[GRAPH]:
        #        if rtype in as_iterable(item[TYPE]):
        #            return item
        #
        #maybes  = [pick_thing(rec) #self.get_decorated_data(rec)
        #           for rec in self.storage.find_by_example(example, # FIXME: use find_in_whelk
        #                   limit=MAX_LIMIT)]
        #
        #some_id = '%s?%s' % (request.path, request.query_string)
        #item = {
        #    "@id": some_id,
        #    "@type": "Ambiguity",
        #    "label": q or ",".join(example.values()),
        #    "maybe": maybes
        #}
        #
        #references = self._get_references_to(item)
        #
        #if not maybes and not references:
        #    return None
        #
        #return {GRAPH: [item] + references}

    def get_site(self, site_id):
        # TODO: get_record_data(g.current_base)
        return sites.get(site_id)

    def setup_vocab_view(self):
        vocab_data = self._load_required(self.vocab_uri)
        context_data = self._load_required(self.context_uri)
        display_data = self._load_required(self.display_uri)

        return VocabView(self.vocab_uri,
                vocab_data,
                context_data,
                display_data,
                lang=self.lang)

    def _load_required(self, uri):
        data = self.load_from_whelk(uri)
        assert data, 'Failed to get {} from whelk'.format(uri)
        return data


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
