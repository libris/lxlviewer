# -*- coding: UTF-8 -*-
from __future__ import unicode_literals
import re
import json
from urlparse import urlparse, urljoin

from rdflib import Graph

from elasticsearch import Elasticsearch

from lxltools.lddb.storage import Storage
from lxltools.graphcache import GraphCache, vocab_source_map
from lxltools.vocabview import VocabView, VocabUtil
from lxltools.dataview import DataView
from lxltools.ld.keys import CONTEXT, GRAPH, ID, TYPE, REVERSE


IDKBSE = "https://id.kb.se/"
LIBRIS = "https://libris.kb.se/"

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
        "slices": {'inScheme.@id':{'inCollection.@id':['@type'], '@type':[]}},
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
        "slices": {"@type":{}},
        #"slices": {"@type":{"meta.bibliography.@id":{"publication.providerDate":[]}}}
        "itemList": [
        #    {ID: "/doc/about#", "title": "Om libris.kb.se", "icon": "info-circle"},
            {ID: "login",  "title": "Logga in", "icon": "sign-in"},
            {ID: "logout", "title": "Logga ut", "icon": "sign-out"}
        ]
    }
}


class Things(object):
    def __init__(self, config):
        self.lang = config['LANG']
        self.vocab_uri = config['VOCAB_IRI']
        self.ui_defs = ui_defs

        self._storage = Storage('lddb',
                config['DBNAME'], config.get('DBHOST', '127.0.0.1'),
                config.get('DBUSER'), config.get('DBPASSWORD'))

        elastic = Elasticsearch(config['ESHOST'],
                sniff_on_start=config.get('ES_SNIFF_ON_START', True),
                sniff_on_connection_fail=True, sniff_timeout=60,
                sniffer_timeout=300, timeout=10)

        #ns_mgr = Graph().parse('sys/context/base.jsonld',
        #        format='json-ld').namespace_manager
        #ns_mgr.bind("", vocab_uri)
        #graphcache = GraphCache(config['GRAPH_CACHE'])
        #graphcache.graph.namespace_manager = ns_mgr

        vocab = VocabView(self.load_vocab_graph(), self.vocab_uri, lang=self.lang)

        self.ldview = DataView(vocab, self._storage, elastic, config['ES_INDEX'])

    def get_site(self, site_id):
        # TODO: ldview.get_record_data(g.current_base)
        return sites.get(site_id)

    def load_vocab_graph(self):
        try:
            self.jsonld_context_data = self._storage.get_record(
                    self.vocab_uri + 'context').data[GRAPH][0]

            #vocabgraph = graphcache.load(config['VOCAB_SOURCE'])
            vocab_items = sum((record.data[GRAPH] for record in
                        self._storage.find_by_quotation(self.vocab_uri, limit=4096)),
                        self._storage.get_record(self.vocab_uri).data[GRAPH])
            vocabdata = json.dumps(vocab_items, indent=2)
            vocabgraph = Graph().parse(
                    data=vocabdata,
                    context=self.jsonld_context_data,
                    format='json-ld')
            #vocabgraph.namespace_manager = ns_mgr
            vocabgraph.namespace_manager.bind("", self.vocab_uri)
        finally:
            self._storage.disconnect()

        # TODO: load base vocabularies for labels, inheritance here,
        # or in vocab build step?
        #for url in vocabgraph.objects(None, OWL.imports):
        #    graphcache.load(vocab_source_map.get(str(url), url))

        return vocabgraph

    def get_vocab_util(self):
        return VocabUtil(self.load_vocab_graph(), self.lang)


LEGACY_BASE = "http://libris.kb.se/"
LEGACY_PATHS = ('/resource/auth/', '/auth/',
        '/resource/bib/', '/bib/',
        '/resource/hold/', '/hold/')


class Uris(object):

    def __init__(self, config):
        self.base_uri_alias = config.get('BASE_URI_ALIAS') or {}
        self.alias_uri_map = {v: k for k, v in self.base_uri_alias.items()}

    def to_canonical_uri(self, url):
        parsedurl = urlparse(url)
        if parsedurl.path.startswith(LEGACY_PATHS):
            return LEGACY_BASE

        uri_base = parsedurl._replace(path="/").geturl()
        canonical_base = self.alias_uri_map.get(uri_base) or uri_base
        return urljoin(canonical_base, parsedurl.path)

    def to_view_url(self, url_root, uri):
        if uri.startswith('/'):
            return uri

        url = urlparse(uri)
        uri_base = url._replace(path="/").geturl()
        uri_path = url.path

        if uri_base in self.base_uri_alias:
            return urljoin(self.base_uri_alias[uri_base], uri_path)
        elif uri_base == self.to_canonical_uri(url_root):
            return uri_path
        else:
            return uri

    def find_canonical_uri(self, url_root, thing):
        site_base_uri = self.to_canonical_uri(url_root)
        thing_id = thing.get(ID) or ""
        if site_base_uri and not thing_id.startswith(site_base_uri):
            for same in thing.get('sameAs', []):
                same_id = same.get(ID)
                if same_id and same_id.startswith(site_base_uri):
                    return same_id
        return thing_id
