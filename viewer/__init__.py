# -*- coding: UTF-8 -*-
from __future__ import absolute_import, unicode_literals, print_function
import os
import operator
import json
import random
import string
from urlparse import urljoin
from datetime import datetime, timedelta
import requests

from rdflib import ConjunctiveGraph

from flask import Flask, Response, g, request, render_template, redirect
from flask import abort, url_for, session
from flask.helpers import NotFound
from flask_cors import CORS
from werkzeug.urls import url_quote

from lxltools.util import as_iterable
from lxltools.ld.keys import CONTEXT, GRAPH, ID, TYPE, REVERSE

from .thingview import Things, Uris, IDKBSE, LIBRIS
from .marcframeview import MarcFrameView, pretty_json
from . import admin
from . import conneg


R_METHODS = ['GET', 'HEAD', 'OPTIONS']
RW_METHODS = R_METHODS + ['PUT']

JSONLD_MIMETYPE = 'application/ld+json'
RDF_MIMETYPES = {'text/turtle', JSONLD_MIMETYPE, 'application/rdf+xml', 'text/xml'}
MIMETYPE_FORMATS = ['text/html', 'application/xhtml+xml'] + list(RDF_MIMETYPES)

CONTEXT_PATH = '/context.jsonld'

TYPE_TEMPLATES = {
    'DataCatalog': 'website.html',
    'PartialCollectionView': 'pagedcollection.html',
    'Article': 'article.html'
}


##
# Application and template settings

class MyFlask(Flask):
    jinja_options = dict(Flask.jinja_options,
            variable_start_string='${', variable_end_string='}',
            line_statement_prefix='%')

app = MyFlask(__name__, static_url_path='/assets', static_folder='static',
        instance_relative_config=True)

app.config.from_object('viewer.configdefaults')
app.config.from_envvar('DEFVIEW_SETTINGS', silent=True)
app.config.from_pyfile('config.cfg', silent=True)

CORS(app, methods=R_METHODS)


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

@app.errorhandler(404)
def page_not_found(e):
    return render_template('4XX.html', status_code=404), 404

@app.errorhandler(410)
def page_not_found(e):
    return render_template('4XX.html', status_code=410), 410

@app.route('/favicon.ico')
def favicon():
    abort(404)


##
# Setup viewer state

def make_find_url(**kws):
    if 'q' not in kws:
        kws = dict(q='*', **kws)
    return url_for('find', **kws)

def _get_served_uri(url, path):
    # TODO: why is Flask unquoting url and path values?
    url_base = url_quote(url)
    path = url_quote(path)
    mapped_base = uris.to_canonical_uri(url_base)
    return urljoin(mapped_base, path)


##
# Setup data-access

things = Things(app.config)
uris = Uris(app.config)


@app.context_processor
def core_context():
    return {
        'ID': ID,'TYPE': TYPE, 'REVERSE': REVERSE,
        'vocab': things.ldview.vocab,
        'ldview': things.ldview,
        'ui': things.ui_defs,
        'lang': things.ldview.vocab.lang,
        'page_limit': 50,
        'canonical_uri': lambda uri: uris.find_canonical_uri(request.url_root, uri),
        'view_url': lambda uri: uris.to_view_url(request.url_root, uri)
    }

@app.before_request
def handle_base():
    canonical_site_id = uris.to_canonical_uri(request.url_root)
    g.site = things.get_site(canonical_site_id) or things.get_site(LIBRIS)

@app.teardown_request
def disconnect_db(exception):
    things.ldview.storage.disconnect()


@app.route(CONTEXT_PATH)
def jsonld_context():
    return Response(json.dumps(things.jsonld_context_data),
            mimetype='application/ld+json; charset=UTF-8')


##
# Setup data-driven views

@app.route('/<path:path>', methods=['DELETE'])
def handle_delete(path):
    response = _proxy_request(request)
    return response


@app.route('/<path:path>', methods=['PUT'])
def handle_put(path):
    response = _write_data(request, query_params={'collection': 'xl'})
    return response


@app.route('/<path:path>/data', methods=R_METHODS)
@app.route('/<path:path>/data.<suffix>', methods=R_METHODS)
@app.route('/<path:path>/data-view', methods=R_METHODS)
@app.route('/<path:path>/data-view.<suffix>', methods=R_METHODS)
def thingdataview(path, suffix=None, methods=R_METHODS):
    r = _proxy_request(request)

    response_body = json.loads(r.get_data())
    return rendered_response(path, suffix, response_body, r.mimetype)


@app.route('/<path:path>', methods=R_METHODS)
def thingview(path, suffix=None):
    try:
        return app.send_static_file(path)
    except (NotFound, UnicodeEncodeError) as e:
        pass
    whelk_accept_header = _get_whelk_accept_header(request, suffix)
    r = _proxy_request(request, accept_header=whelk_accept_header)

    response_body = json.loads(r.get_data())
    return rendered_response(path, suffix, response_body)


# FIXME make this less sketcy
def _get_whelk_accept_header(request, suffix):
    mimetype, _ = negotiator.negotiate(request, suffix)
    if (mimetype == 'text/html' or
        mimetype == 'application/xhtml+xml'):
        return 'application/json'
    else:
        return None


@app.route('/find', methods=R_METHODS)
@app.route('/find.<suffix>', methods=R_METHODS)
def find(suffix=None):
    response = _proxy_request(request, query_params=request.args)
    results = json.loads(response.get_data())
    return rendered_response('/find', suffix, results)


@app.route('/some', methods=R_METHODS)
@app.route('/some.<suffix>', methods=R_METHODS)
def some(suffix=None):
    ambiguity = things.ldview.find_ambiguity(request)
    if not ambiguity:
        return abort(404)
    return rendered_response('/some', suffix, ambiguity)


@app.route('/', methods=R_METHODS)
@app.route('/data', methods=R_METHODS)
@app.route('/data.<suffix>', methods=R_METHODS)
def dataindexview(suffix=None):
    slicerepr = request.args.get('slice')
    slicetree = json.loads(slicerepr) if slicerepr else g.site['slices']
    results = things.ldview.get_index_stats(slicetree, make_find_url,
            uris.to_canonical_uri(request.url_root))
    results.update(g.site)
    return rendered_response('/', suffix, results)


def rendered_response(path, suffix, data, mimetype=None):
    if mimetype:
        render = _get_render_for_mimetype(mimetype)
    else:
        mimetype, render = negotiator.negotiate(request, suffix)

    if not render:
        return abort(406)
    result = render(path, data)
    charset = 'charset=UTF-8' # technically redundant, but for e.g. JSONView
    resp = Response(result, mimetype=mimetype +'; '+ charset) if isinstance(
            result, bytes) else result
    if mimetype == 'application/json':
        context_link = '<%s>; rel="http://www.w3.org/ns/json-ld#context"' % CONTEXT_PATH
        resp.headers['Link'] = context_link
    return resp


# FIXME make this less sketchy
def _get_render_for_mimetype(mimetype):
    pairs = {'text/html': render_html,
             'application/xhtml+xml': render_html,
             'application/json': render_json,
             'text/json': render_json,
             'application/ld+json': render_jsonld}
    return pairs[mimetype]


negotiator = conneg.Negotiator()

@negotiator.add('text/html', 'html')
@negotiator.add('application/xhtml+xml', 'xhtml')
def render_html(path, thing):
    def data_url(suffix):
        if path == '/find':
            return url_for('find', suffix=suffix, **request.args)
        elif path == '/some':
            return url_for('some', suffix=suffix, **request.args)
        else:
            return url_for('thingview', path=path, suffix=suffix)

    return render_template(_get_template_for(thing),
            path=path, thing=thing, data_url=data_url)

@negotiator.add('application/json', 'json')
@negotiator.add('text/json')
def render_json(path, data):
    return _to_json(data)

@negotiator.add('application/ld+json', 'jsonld')
def render_jsonld(path, data):
    data[CONTEXT] = CONTEXT_PATH
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
# Admin
os.environ[b'OAUTHLIB_INSECURE_TRANSPORT'] = str(app.config.get('OAUTHLIB_INSECURE_TRANSPORT') or '0')
app.secret_key = app.config.get('SESSION_SECRET_KEY') or ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(10))
app.remember_cookie_duration = timedelta(days=app.config.get('SESSION_COOKIE_LIFETIME') or 31)
app.permanent_session_lifetime = timedelta(days=app.config.get('SESSION_COOKIE_LIFETIME') or 31)

app.register_blueprint(admin.admin_app)


##
# Data Editing (depends on Admin)

# Create post
@app.route("/createnew")
def createpost():
    return render_template('createnew.html')

# Remote search
@app.route("/import")
def import_post():
    return render_template('import.html')

# Mocking edit/create new record with passed types
@app.route('/new/<item_type>')
@admin.login_required
def thingnew(item_type):
    ITEM_TYPES = {'record': 'Record'}
    item_type = ITEM_TYPES.get(item_type) or ITEM_TYPES.get('record')
    at_type = request.args.get(TYPE)
    if not at_type:
        return Response('Missing @type parameter', status=422)
    else:
        return render_template('edit.html',
                thing={
                        GRAPH: [
                            {TYPE: item_type},
                            {TYPE: json.loads(at_type)}
                        ]
                    },
                model={})

# !TODO this is stupid and should be solved a less dangerous way
# So rethink the flow for new records
# or maybe its not that stupid after all?
@app.route('/edit', methods=['POST'])
@admin.login_required
def thingnewp():
    thing = json.loads(request.form['item'])
    return render_template('edit.html', thing=thing, model={})


@app.route('/<path:path>/edit')
@admin.login_required
def thingedit(path):
    request_url = _get_api_url("/{0}".format(path))

    r = _whelk_request(request_url, 'GET', dict(request.headers))

    if r.status_code == 200:
        model = {}
        data = json.loads(r.get_data())
        return render_template('edit.html', thing=data, model=model)
    else:
        # TODO handle this better. GET /<path> *should* return 200,
        # but treating everything else as an error isn't awesome.
        return abort(r.status_code)


@app.route('/create', methods=['POST'])
def create():
    request.path = '/'
    return _write_data(request, query_params={'collection': 'xl'})

@app.route('/_convert', methods=['POST'])
def convert():
    return _write_data(request, query_params={'to': 'application/x-marc-json'})

@app.route('/_remotesearch')
def _remotesearch():
    return _proxy_request(request, query_params=['q', 'databases'])

def _is_tombstone(data):
    items = data.get(GRAPH)
    record = items[0]
    if record.get(TYPE) == 'Tombstone':
        return True
    else:
        return False


# Map from Requests response to Flask response
def _map_response(response):
    def _map_headers(headers):
        _headers = {}
        for head in ['etag', 'location']:
            if head in headers:
                _headers[head] = headers[head];
        return _headers
    return Response(response.text,
                    status=response.status_code,
                    mimetype=response.headers.get('content-type'),
                    headers=_map_headers(response.headers))


def _proxy_request(request, json_data=None, query_params=[],
                   accept_header=None):
    params = {}
    defaults = query_params if isinstance(query_params, dict) else {}
    for param in query_params:
        params[param] = request.args.get(param) or defaults.get(param)

    headers = dict(request.headers)

    url = _get_api_url(request.path)
    return _whelk_request(url, request.method, headers, json_data=json_data,
                          query_params=params, accept_header=accept_header)


def _get_api_url(path):
    return '%s%s' % (app.config.get('WHELK_REST_API_URL'), path)


def _whelk_request(url, method, headers, json_data=None,
                   query_params=[], accept_header=None):
    json_data = json.dumps(json_data)

    if accept_header:
        headers['Accept'] = accept_header

    auth_token = _get_authorization_token()
    if auth_token:
        headers['Authorization'] = auth_token

    # Proxy the request to rest api
    app.logger.debug('Sending proxy %s request to : %s with:\n %s' % (method,
                                                                      url,
                                                                      json_data))
    r = requests.request(method, url, data=json_data, headers=headers,
                         params=query_params)

    if r.status_code < 400:
        return _map_response(r)
    else:
        return abort(r.status_code)


def _get_authorization_token():
    oauth_token = None

    if 'oauth_token' in session:
        oauth_token = session['oauth_token']

    if oauth_token:
        token = oauth_token['access_token']
        token_type = oauth_token['token_type']
        # FIXME handle different tokens (or verify that we only
        # ever see Bearer)
        return "{0} {1}".format(token_type, token)
    else:
        return None


def _write_data(request, item=None, query_params=[]):
    json_data = request.get_json(force=True)
    return _proxy_request(request, json_data, query_params)


##
# Setup vocab view

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

@app.route('/vocab/', methods=R_METHODS)
@app.route('/vocab/data.<suffix>', methods=R_METHODS)
def vocabview(suffix=None):
    voc = things.get_vocab_util()

    def link(obj):
        if ':' in obj.qname() and not any(obj.objects(None)):
            return obj.identifier
        return '#' + obj.qname()

    def listclass(o):
        return 'ext' if ':' in o.qname() else 'loc'

    if suffix:
        mimetype, render = negotiator.negotiate(request, suffix)
    else:
        mimetype = request.accept_mimetypes.best_match(MIMETYPE_FORMATS)
    if mimetype in RDF_MIMETYPES:
        return Response(voc.graph.serialize(format=
                'json-ld' if mimetype == JSONLD_MIMETYPE else mimetype,
                #context_id=CONTEXT_PATH,
                context=things.jsonld_context_data[CONTEXT]), content_type='%s; charset=UTF-8' % mimetype)

    return render_template('vocab.html',
            URIRef=URIRef, **vars())

#@app.route('/vocab/<term>')
#def vocab_term(term):
#    return redirect('/vocab/#' + term, 303)


##
# Setup marcframe view

mfview = MarcFrameView(
        app.config['MARCFRAME_SOURCE'], app.config['CACHE_DIR'])

@app.route('/marcframe/')
def marcframeview():
    return render_template('marcframeview.html',
            mf=mfview,
            pretty_json=pretty_json)
