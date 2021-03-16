# -*- coding: UTF-8 -*-
from __future__ import unicode_literals, print_function
__metaclass__ = type
if bytes is not str:
    unicode = str

import json

from rdflib import Graph, ConjunctiveGraph, Literal, URIRef, Namespace, RDF, RDFS, OWL
from rdflib.resource import Resource

from .util import as_iterable


ID = '@id'
TYPE = '@type'
CONTEXT = '@context'
GRAPH = '@graph'
REVERSE = '@reverse'


class VocabView:

    def __init__(self, vocab, context, display, lang='en'):
        self.vocab_uri = u'https://id.kb.se/vocab/'
        self.vocab_data = vocab.data
        self.vocab_etag = vocab.etag
        self.context_data = context.data
        self.display_data = display.data
        self.lang = lang

        self.index = {}

        for node in vocab.data[GRAPH]:
            if GRAPH in node:
                continue
            node_id = node.get(ID)
            if not node_id:
                continue
            if not node_id.startswith(self.vocab_uri):
                continue

            term_key = self._get_term_key(node_id)

            label = node.get('label')
            if not label:
                for langkey, label in node.get('labelByLang', {}).items():
                    if langkey == lang:
                        break
            if label:
                label = unicode(label)

            for domain in as_iterable(node.get('domain') or node.get('domainIncludes')):
                if ID not in domain:
                    continue
                domain_key = self._get_term_key(domain[ID])
                self.index.setdefault(domain_key, {}).setdefault(
                        'properties', []).append(term_key)

            self.index.setdefault(term_key, {}).update(
                    dict(node, label=label, curie=term_key))

    def _get_term_key(self, node_id):
        return node_id.replace(self.vocab_uri, '')

    def get_term_dfn(self, id_or_key):
        if not id_or_key:
            return None
        return self.index.get(self._get_term_key(id_or_key))

    def sortedkeys(self, node, lenstype='cards'):
        lens = self._get_lens_for(node, lenstype)
        # TODO: Rewriting language containers to localized, simple values...
        # - either support containers by properly using the context
        # - or optimize this rewriting
        # - or do not allow this form (remove from base context)
        for key in list(node.keys()):
            if key.endswith('ByLang'):
                v = node.pop(key).get(self.lang)
                newk = key[:-len('ByLang')]
                node[newk] = v

        # TODO: Prepare lensprops for speed.
        lensprops = {key: i for i, key in enumerate(
                    ['sameAs'] + lens['showProperties'] if lens else [])
                    if isinstance(key, unicode)}
        lensmax = len(lensprops)

        return sorted((p for p in node if not p.startswith(('_', '@'))),
                key=lambda key: (lensprops.get(key, lensmax), key))

    _lens_group_key_chains = {
        'full': ['full', 'cards', 'chips'],
        'cards': ['cards', 'chips'],
        'chips': ['chips']
    }

    def _get_lens_for(self, node, lenstype):
        lens_group_keys = self._lens_group_key_chains[lenstype]
        return (self._find_lens_for_type(node.get(TYPE), lens_group_keys)
                or self._find_lens_for_type('Resource', lens_group_keys))

    def _find_lens_for_type(self, type_key, lens_group_keys):
        for lens_group_key in lens_group_keys:
            lenses = self.display_data['lensGroups'][lens_group_key]['lenses']
            for ntype in as_iterable(type_key):
                lens = lenses.get(ntype)
                if lens:
                    return lens
                typedfn = self.index.get(ntype)
                if not typedfn:
                    continue
                for basetype in as_iterable(typedfn.get('subClassOf')):
                    if ID not in basetype:
                        continue
                    base_type_key = self._get_term_key(basetype[ID])
                    lens = self._find_lens_for_type(base_type_key, lens_group_keys)
                    if lens:
                        return lens
        else:
            return None

    def reduce_node(self, node, lenstype='chips'):
        lens = self._get_lens_for(node, lenstype)
        return {k: v for k, v in node.items() if k in lens['showProperties']}

    def get_label_for(self, node):
        return self._construct_label(node) or self._label_from_chips(node)

    def _construct_label(self, node):
        # TODO:
        # - replace hardcoded rules with vocab rules and/or chips logic
        # - if the Term type is to be kept, put 'focus' in its lens (after prefLabel)
        if 'prefLabel' not in node: # ComplexTerm in types
            node = node.get('focus') or node
            termparts = node.get('termParts', [])
            if termparts:
                return " - ".join(self._label_from_chips(bit) for bit in termparts)

        has = node.__contains__
        v = lambda k: " ".join(as_iterable(node.get(k, '')))
        vs = lambda *ks: [v(k) for k in ks if has(k)]

        types = set(as_iterable(node.get(TYPE)))

        if types & {'Record'}:
            if 'mainEntity' not in node:
                return self._label_from_chips(node)
            return "{} ({})".format(self._label_from_chips(node),
                    self.get_label_for(node['mainEntity']))

        if types & {'UniformWork', 'CreativeWork'}:
            label = self._label_from_chips(node)
            attr = node.get('attributedTo')
            if attr:
                attr_label = self._construct_label(attr)
                if attr_label:
                    label = "%s (%s)" % (label, attr_label)
            return label

        if types & {'Person', 'Persona', 'Family', 'Organization', 'Meeting'}:
            return " ".join([
                    v('name') or ", ".join(vs('familyName', 'givenName')),
                    v('numeration'),
                    "(%s)" % v('personTitle') if has('personTitle') else "",
                    "%s-%s" % (v('birthYear'), v('deathYear'))
                    if (has('birthYear') or has('deathYear')) else ""])

    def _label_from_chips(self, node):
        # NOTE: ByLang keys are implicitly rewritten by sortedkeys
        for lkey in self.sortedkeys(node, 'chips'):
            label = node.get(lkey)

            def is_ref(node):
                return isinstance(node, dict) and len(node) == 1 and ID in node

            if not isinstance(label, unicode):
                label = [self._label_from_chips(l) if isinstance(l, dict) else l
                        for l in as_iterable(label) if not is_ref(l)]

            ll = list(as_iterable(label))
            if ll:
                return '--'.join(ll)

        return ""

    def get_util(self):
        try:
            return self._util
        except AttributeError:
            #ns_mgr = Graph().parse('sys/context/base.jsonld',
            #        format='json-ld').namespace_manager
            #ns_mgr.bind("", vocab_uri)
            #graphcache = GraphCache(config['GRAPH_CACHE'])
            #graphcache.graph.namespace_manager = ns_mgr
            #vocabgraph = graphcache.load(config['VOCAB_SOURCE'])
            #vocabgraph.namespace_manager = ns_mgr
            # TODO: load base vocabularies for labels, inheritance here,
            # or in vocab build step? (Or not at all...)
            #for url in vocabgraph.objects(None, OWL.imports):
            #    graphcache.load(vocab_source_map.get(str(url), url))
            vocabgraph = ConjunctiveGraph()
            vocabgraph.parse(
                    data=json.dumps(self.vocab_data[GRAPH]),
                    context=self.context_data,
                    format='json-ld')
            vocabgraph.namespace_manager.bind("", self.vocab_uri)

            self._util = VocabUtil(vocabgraph, self.lang)
            return self._util


class VocabUtil:

    def __init__(self, graph, lang):
        self.graph = graph
        self.lang = lang
        self.resource = graph.resource

        vocabs = list(set(graph.subjects(RDF.type, OWL.Ontology))
                    | set(graph.objects(RDFS.isDefinedBy)))
        self.vocabs = vocabs
        self.vocab = graph.resource(vocabs[0])
        self.properties = self._get_properties()
        self.classes = self._get_classes()

    def _get_classes(self):
        return [self.graph.resource(cid) for cid in sorted(
                set((self.graph.subjects(RDF.type, RDFS.Class)))
                | set((self.graph.subjects(RDF.type, OWL.Class))))
            if isinstance(cid, URIRef)]

    def _get_properties(self):
        return map(self.graph.resource, sorted(
            set(self.graph.subjects(RDF.type, RDF.Property))
            | set(self.graph.subjects(RDF.type, OWL.ObjectProperty))
            | set(self.graph.subjects(RDF.type, OWL.DatatypeProperty))))

    def getrestrictions(self, rclass):
        for c in rclass.objects(RDFS.subClassOf):
            rtype = c.value(RDF.type)
            if rtype and rtype.identifier == OWL.Restriction:
                yield c

    def value(self, obj, prop, lang=None):
        lang = lang or self.lang
        label = None
        for label in obj.objects(prop):
            if label.language == lang:
                return label
        return label

    def label(self, obj, lang=None):
        lang = lang or self.lang
        return self.value(obj, RDFS.label, lang)
        label = None
        for label in obj.objects(RDFS.label):
            if label.language == lang:
                return label
        return label

    def find_references(self, items):
        for o in items:
            ref = o.identifier if isinstance(o, Resource) else o
            if isinstance(ref, URIRef):
                yield o
