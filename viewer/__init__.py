# -*- coding: UTF-8 -*-
from __future__ import absolute_import, unicode_literals, print_function
import operator
from urlparse import urlparse, urljoin
import json

from rdflib import ConjunctiveGraph

from flask import (Flask, Response, g, request, render_template, redirect,
        abort, url_for, send_file)
from flask.helpers import NotFound
from werkzeug.urls import url_quote

from lxltools.util import as_iterable
from lxltools.ld.keys import CONTEXT, ID, TYPE, REVERSE

from .thingview import Things, IDKBSE, LIBRIS
from . import conneg
from . import marcframeview


##
# Application and template settings

class MyFlask(Flask):
    jinja_options = dict(Flask.jinja_options,
            variable_start_string='${', variable_end_string='}',
            line_statement_prefix='%')

app = MyFlask(__name__, static_url_path='/media', static_folder='static',
        instance_relative_config=True)

app.config.from_object('viewer.configdefaults')
app.config.from_envvar('DEFVIEW_SETTINGS', silent=True)
app.config.from_pyfile('config.cfg', silent=True)


import __builtin__
for name, obj in vars(__builtin__).items():
    if callable(obj):
        app.add_template_global(obj, name)

for func in [operator.itemgetter]:
    app.add_template_global(func, func.__name__)

@app.template_global()
def union(*args):
    return reduce(lambda a, b: a | b, args)

@app.template_global()
def format_number(n):
    return '{:,}'.format(n).replace(',', ' ')


##
# Setup basic views

@app.route('/favicon.ico')
def favicon():
    abort(404)


##
# Setup viewer state

TYPE_TEMPLATES = {
    'DataCatalog': 'website.html',
    'PartialCollectionView': 'pagedcollection.html',
    'Article': 'article.html'
}

DOMAIN_BASE_MAP = {
    'localhost': IDKBSE, '127.0.0.1': LIBRIS,
    'id.local.dev': IDKBSE, 'libris.local.dev': LIBRIS,
    'id-dev.kb.se':  IDKBSE, 'libris-dev.kb.se': LIBRIS,
    'id-stg.kb.se':  IDKBSE, 'libris-stg.kb.se': LIBRIS,
    'id-qa.kb.se': IDKBSE, 'libris-qa.kb.se': LIBRIS,
    'id.kb.se':  IDKBSE, 'libris.kb.se': LIBRIS,
}
LEGACY_BASE = "http://libris.kb.se/"
LEGACY_PATHS = ('/resource/auth/', '/auth/',
        '/resource/bib/', '/bib/',
        '/resource/hold/', '/hold/')


def _get_base_uri(url=None):
    url = url or request.url
    parsedurl = urlparse(url)
    if parsedurl.path.startswith(LEGACY_PATHS):
        return LEGACY_BASE
    domain = parsedurl.netloc.split(':', 1)[0]
    return DOMAIN_BASE_MAP.get(domain)

def _get_served_uri(url, path):
    # TODO: why is Flask unquoting url and path values?
    url = url_quote(url)
    path = url_quote(path)
    mapped_base_uri = _get_base_uri(url)
    if mapped_base_uri:
        return urljoin(mapped_base_uri, path)
    else:
        return url

def view_url(uri):
    if uri.startswith('/'):
        return uri
        #if '?' in uri: # implies other views, see data_url below
        #    raise NotImplementedError
        #return url_for('thingview.thingview', path=uri[1:], suffix='html')
    # TODO: get env from current, get equiv for given
    # - e.g.: at id-stg, having a libris uri, get libris-stg
    url_base = _get_base_uri(uri)
    if url_base == _get_base_uri(request.url):
        return urlparse(uri).path
    elif url_base:
        return urljoin(url_base, urlparse(uri).path)
    else:
        return uri

def canonical_uri(thing):
    base = _get_base_uri()
    thing_id = thing.get(ID) or ""
    if not thing_id.startswith(base):
        for same in thing.get('sameAs', []):
            same_id = same.get(ID)
            if same_id and same_id.startswith(base):
                return same_id
    return thing_id


##
# Setup data-access

things = Things(app.config)
ldview = things.ldview


@app.context_processor
def core_context():
    return {
        'ID': ID,'TYPE': TYPE, 'REVERSE': REVERSE,
        'vocab': ldview.vocab,
        'ldview': ldview,
        'ui': things.ui_defs,
        'lang': ldview.vocab.lang,
        'page_limit': 50,
        'LIBRIS': LIBRIS,
        'IDKBSE': IDKBSE,
        'canonical_uri': canonical_uri,
        'view_url': view_url
    }

@app.before_request
def handle_base():
    current_base = _get_base_uri()
    g.site = things.get_site(current_base)

@app.teardown_request
def disconnect_db(exception):
    ldview.storage.disconnect()


@app.route('/context.jsonld')
def jsonld_context():
    return Response(json.dumps(things.jsonld_context_data),
            mimetype='application/ld+json; charset=UTF-8')


##
# Setup data-driven views

@app.route('/<path:path>/data')
@app.route('/<path:path>/data.<suffix>')
@app.route('/<path:path>')
def thingview(path, suffix=None):
    try:
        return app.send_static_file(path)
    except (NotFound, UnicodeEncodeError) as e:
        pass

    item_id = _get_served_uri(request.url, path)

    thing = ldview.get_record_data(item_id)
    if thing:
        #canonical = thing[ID]
        #if canonocal != item_id:
        #    return redirect(_to_data_path(see_path, suffix), 302)
        return rendered_response(path, suffix, thing)
    else:
        record_ids = ldview.find_record_ids(item_id)
        if record_ids: #and len(record_ids) == 1:
            return redirect(_to_data_path(record_ids[0], suffix), 303)
        #else:
        return abort(404)

def _to_data_path(path, suffix):
    return '%s/data.%s' % (path, suffix) if suffix else path

@app.route('/find')
@app.route('/find.<suffix>')
def find(suffix=None):
    make_find_url = lambda **kws: url_for('find', **kws)
    results = ldview.get_search_results(request.args, make_find_url,
            _get_base_uri(request.url))
    return rendered_response('/find', suffix, results)

@app.route('/some')
@app.route('/some.<suffix>')
def some(suffix=None):
    ambiguity = ldview.find_ambiguity(request)
    if not ambiguity:
        return abort(404)
    return rendered_response('/some', suffix, ambiguity)

@app.route('/')
@app.route('/data')
@app.route('/data.<suffix>')
def dataindexview(suffix=None):
    slicerepr = request.args.get('slice')
    slicetree = json.loads(slicerepr) if slicerepr else g.site['slices']
    results = ldview.get_index_stats(_get_base_uri(request.url), slicetree=slicetree)
    results.update(g.site)
    return rendered_response('/', suffix, results)

def rendered_response(path, suffix, thing):
    mimetype, render = negotiator.negotiate(request, suffix)
    if not render:
        return abort(406)
    result = render(path, thing)
    charset = 'charset=UTF-8' # technically redundant, but for e.g. JSONView
    resp = Response(result, mimetype=mimetype +'; '+ charset) if isinstance(
            result, bytes) else result
    if mimetype == 'application/json':
        context_link = '</context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"'
        resp.headers['Link'] = context_link
    return resp


negotiator = conneg.Negotiator()

@negotiator.add('text/html', 'html')
@negotiator.add('application/xhtml+xml', 'xhtml')
def render_html(path, data):
    data = ldview.get_decorated_data(data, True)

    def data_url(suffix):
        if path == '/find':
            return url_for('find', suffix=suffix, **request.args)
        elif path == '/some':
            return url_for('some', suffix=suffix, **request.args)
        else:
            return url_for('thingview', path=path, suffix=suffix)

    return render_template(_get_template_for(data),
            path=path, thing=data, data_url=data_url)

@negotiator.add('application/json', 'json')
@negotiator.add('text/json')
def render_json(path, data):
    data = ldview.get_decorated_data(data, True)
    return _to_json(data)

@negotiator.add('application/ld+json', 'jsonld')
def render_jsonld(path, data):
    data[CONTEXT] = '/context.jsonld'
    return _to_json(data)

@negotiator.add('text/turtle', 'ttl')
@negotiator.add('text/n3', 'n3') # older: text/rdf+n3, application/n3
def render_ttl(path, data):
    return _to_graph(data).serialize(format='turtle')

@negotiator.add('text/trig', 'trig')
def render_trig(path, data):
    return _to_graph(data).serialize(format='trig')

@negotiator.add('application/rdf+xml', 'rdf')
@negotiator.add('text/xml', 'xml')
def render_xml(path, data):
    return _to_graph(data).serialize(format='pretty-xml')

def _to_json(data):
    return json.dumps(data, indent=2, sort_keys=True,
            separators=(',', ': '), ensure_ascii=False).encode('utf-8')

def _to_graph(data, base=None):
    cg = ConjunctiveGraph()
    cg.parse(data=json.dumps(data), base=base or IDKBSE,
                format='json-ld', context=things.jsonld_context_data)
    return cg

def _get_template_for(data):
    for rtype in as_iterable(data.get(TYPE)):
        template = TYPE_TEMPLATES.get(rtype)
        if template:
            return template
    return 'thing.html'


##
# Setup vocab views

from rdflib import URIRef, RDF, RDFS, OWL, Namespace
from rdflib.namespace import SKOS, DCTERMS

rdfns = {
    'RDF': RDF,
    'RDFS': RDFS,
    'OWL': OWL,
    'SKOS': SKOS,
    'DCTERMS': DCTERMS,
    'VANN': Namespace("http://purl.org/vocab/vann/"),
    'VS': Namespace("http://www.w3.org/2003/06/sw-vocab-status/ns#"),
    'SCHEMA': Namespace("http://schema.org/"),
}

app.context_processor(lambda: rdfns)

@app.route('/vocab/')
def vocabview():
    voc = things.get_vocab_util()

    def link(obj):
        if ':' in obj.qname() and not any(obj.objects(None)):
            return obj.identifier
        return '#' + obj.qname()

    def listclass(o):
        return 'ext' if ':' in o.qname() else 'loc'

    return render_template('vocab.html',
            URIRef=URIRef, **vars())

#@app.route('/vocab/<term>')
#def vocab_term(term):
#    return redirect('/vocab/#' + term, 303)


##
# Setup marcframe view

mfview = marcframeview.MarcFrameView(
        app.config['MARCFRAME_SOURCE'], app.config['CACHE_DIR'])

@app.route('/marcframe/')
def marcframeview():
    return render_template('marcframeview.html',
            mf=mfview,
            pretty_json=marcframeview.pretty_json)
