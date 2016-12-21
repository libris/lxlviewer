# -*- coding: UTF-8 -*-
from __future__ import unicode_literals
import re
import json
from urlparse import urlparse, urljoin

import requests
from rdflib import Graph, ConjunctiveGraph

from .util import as_iterable
from .vocabview import VocabView, VocabUtil, ID, TYPE, CONTEXT, GRAPH, REVERSE
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
        "stats": '{"inScheme.@id":{"inCollection.@id":["@type"], "@type":[]}}',
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
        "stats": '{"instanceOf.@type": {"@type": []}}',
            # TODO: + @reverse.itemOf.heldBy.@id (and/or count)?
        #"stats": {"@type":{"meta.bibliography.@id":{"publication.providerDate":[]}}}
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

        #ns_mgr = Graph().parse('sys/context/base.jsonld',
        #        format='json-ld').namespace_manager
        #ns_mgr.bind("", vocab_uri)
        #graphcache = GraphCache(config['GRAPH_CACHE'])
        #graphcache.graph.namespace_manager = ns_mgr

        self.display = self.load_from_whelk(self.display_uri)
        self.vocab = VocabView(self.load_vocab_graph(), self.vocab_uri, lang=self.lang)

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
        # FIXME: hiding bug in backend failing on bnode IDs when embellishing
        try:
            return self.api_request(url).json()
        except ValueError:
            return {GRAPH: []}

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
        results = self.find_in_whelk(limit=1, stats=statstree) # FIXME: limit=0 gets no data...
        return {TYPE: 'DataCatalog', ID: site_base_uri, 'statistics': results['stats']}

    def find_ambiguity(self, request):
        raise NotImplementedError # FIXME: implement

    def get_site(self, site_id):
        # TODO: get_record_data(g.current_base)
        return sites.get(site_id)

    def load_vocab_graph(self):
        context = self.load_from_whelk(self.context_uri)
        if context is None:
            raise Exception('Failed to get context from storage ', self.context_uri)

        self.jsonld_context_data = context

        #vocabgraph = graphcache.load(config['VOCAB_SOURCE'])

        results = self.find_in_whelk({'isDefinedBy.@id': self.vocab_uri}, limit=2000)
        vocab_items = sum(
                ([self.load_from_whelk(term[ID] + '/data.json')] for term in results['items']),
                self.load_from_whelk(self.vocab_uri)[GRAPH])
        vocabdata = json.dumps(vocab_items)
        vocabgraph = ConjunctiveGraph()
        vocabgraph.parse(
                data=vocabdata,
                context=self.jsonld_context_data,
                format='json-ld')
        #vocabgraph.namespace_manager = ns_mgr
        vocabgraph.namespace_manager.bind("", self.vocab_uri)

        # TODO: load base vocabularies for labels, inheritance here,
        # or in vocab build step?
        #for url in vocabgraph.objects(None, OWL.imports):
        #    graphcache.load(vocab_source_map.get(str(url), url))

        return vocabgraph

    def get_vocab_util(self):
        return VocabUtil(self.load_vocab_graph(), self.lang)


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
