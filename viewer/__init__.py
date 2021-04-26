# -*- coding: UTF-8 -*-
from __future__ import absolute_import, unicode_literals, print_function
if bytes is not str:
    unicode = str

import json
import operator
import functools
import os
import random
import re
import string
import time
import requests
try:
    from urllib.parse import urlparse, urljoin
except ImportError:
    from urlparse import urlparse, urljoin
from datetime import datetime, timedelta

from flask import Flask, Response
from flask import g, request, session, render_template, url_for, redirect, abort
from flask.helpers import NotFound
from flask_cors import CORS
from werkzeug.urls import url_quote
from werkzeug.datastructures import MultiDict

from rdflib import ConjunctiveGraph

from .util import as_iterable
from .dataaccess import CONTEXT, GRAPH, ID, TYPE, REVERSE, DataAccess, IDKBSE, LIBRIS
from .marcframeview import MarcFrameView, pretty_json
from . import conneg


R_METHODS = ['GET', 'HEAD', 'OPTIONS']
HTTP_METHODS = R_METHODS + ['PUT', 'POST', 'DELETE']


JSONLD_MIMETYPE = 'application/ld+json'

KEEP_HEADERS = ['ETag', 'Location', 'Content-Location', 'Expires', 'Document',
                'Link', 'Server-Start-Time', 'Cache-Control', 'Vary']

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

app = MyFlask(__name__,
    static_folder=os.path.join(
        os.path.dirname(__file__), 'client', 'static'),
        instance_relative_config=True)

app.config.from_object('viewer.configdefaults')
app.config.from_envvar('DEFVIEW_SETTINGS', silent=True)
app.config.from_pyfile('config.cfg', silent=True)

CORS(app, methods=HTTP_METHODS, expose_headers=['ETag', 'Location'])


try:
    import builtins
except ImportError:
    import __builtin__ as builtins

for name, obj in vars(builtins).items():
    if callable(obj):
        app.add_template_global(obj, name)

for func in [operator.itemgetter]:
    app.add_template_global(func, func.__name__)

app.add_template_global(unicode, 'unicode')

@app.template_global()
def union(*args):
    return functools.reduce(lambda a, b: a | b, args)

@app.template_global()
def format_number(n):
    return '{:,}'.format(n).replace(',', ' ')

@app.template_global()
def first(value):
    for v in as_iterable(value):
        return v

##
# About XL
@app.route("/about")
def show_about():
    return render_template('about.html')

# Help page
@app.route("/help")
def show_help():
    return render_template('help.html')

##
# Setup Github rss
@app.route('/releasefeed', methods=['GET'])
def get_release_feed():
    return requests.get('https://github.com/libris/lxlviewer/releases.atom').content

# Setup proxy for analytics "active users"
@app.route('/activeusers', methods=['GET'])
def get_active_users():
    return requests.get('https://analytics.kb.se/index.php?module=API&method=Live.getCounters&idSite=65&lastMinutes={lastMinutes}&format=json&token_auth={token}'.format(lastMinutes=5, token=app.config.get('MATOMO_READ_TOKEN'))).content

# Setup news feed
@app.route('/newsfeed', methods=['GET'])
def get_blog_feed():
    return requests.get('https://www.kb.se/rest-api/RSS%20Genererare/news-rss?keywords=Libris').content



##
# Setup basic views

@app.route('/assets/<path:path>.<suffix>')
def static_assets(subdir=None, path=None, suffix=None):
    return app.send_static_file('%s.%s' % (path, suffix))

@app.route('/favicon.ico')
def favicon():
    abort(404)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('4XX.html', status_code=404), 404

@app.errorhandler(410)
def page_not_found(e):
    return render_template('4XX.html', status_code=410), 410


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
    # we need to do this to handle e.g. gmgpc//swe, since flask is a bit heavy
    # handed when it comes to slashes in paths
    # TODO: https://jira.kb.se/browse/LXL-1469
    path = re.sub(r"([^:])//", r"\1%2F%2F", path)
    mapped_base = daccess.urimap.to_canonical_uri(url_base)

    # NOTE: Needed since some proxies lose one slash from paths that represent
    # full URIs (through seemingly incorrect path normalization).
    if re.match(r'^https?:/[^/]', path):
        path = path.replace(':/', '://', 1)
    return urljoin(mapped_base, path)


##
# Setup data-access

daccess = DataAccess(app.config)

app.jinja_env.globals.update({
        'ID': ID,'TYPE': TYPE, 'REVERSE': REVERSE,
        'view_url': lambda uri: daccess.urimap.to_view_url(request.url_root, uri)
     })

@app.before_request
def default_context():
    g.vocab = daccess.vocab
    g.ui = daccess.ui_defs
    g.lang = daccess.vocab.lang
    g.page_limit = 50

@app.before_request
def handle_base():
    canonical_site_id = daccess.urimap.to_canonical_uri(request.url_root)
    g.site = daccess.get_site(canonical_site_id) or daccess.get_site(LIBRIS) or daccess.get_site(IDKBSE)

@app.route(CONTEXT_PATH)
def jsonld_context():
    return Response(json.dumps(daccess.jsonld_context_data),
            mimetype='application/ld+json; charset=UTF-8')


##
# Setup data-driven views

@app.route('/<path:path>', methods=['DELETE'])
def handle_delete(path):
    response = _proxy_request(request, session)
    return response


@app.route('/<path:path>', methods=['PUT'])
def handle_put(path):
    response = _write_data(request, query_params=MultiDict([]))
    return response


@app.route('/<path:path>', methods=R_METHODS)
#@app.route('/<path:path>.<suffix>', methods=R_METHODS)
#@app.route('/<path:path>/data', methods=R_METHODS)
@app.route('/<path:path>/data.<suffix>', methods=R_METHODS)
#@app.route('/<path:path>/data-view', methods=R_METHODS)
#@app.route('/<path:path>/data-view.<suffix>', methods=R_METHODS)
def thingview(path, suffix=None):
    #if not suffix and '.' in path:
    #    path, suffix = path.rsplit('.')

    whelk_accept_header = _get_view_data_accept_header(request, suffix)
    query_params = _filter_query_params(request.args)
    resource_id = _get_served_uri(request.url_root, path)

    if g.site.get('applyInverseOf', False):
        query_params['_applyInverseOf'] = 'true'

    resp = _proxy_request(request, session, accept_header=whelk_accept_header,
            url_path=resource_id, query_params=query_params)

    if resp.status_code > 200:
        return resp

    return rendered_response(path, suffix, resp)


# FIXME make this less sketcy
def _get_view_data_accept_header(request, suffix):
    mimetype, _ = negotiator.negotiate(request, suffix)
    if mimetype and mimetype in ('application/json'):
        return 'application/json'
    elif mimetype and mimetype in ('text/html', 'application/xhtml+xml'):
        return 'application/json'
    else:
        return None


def _filter_query_params(request_args):
    params = MultiDict([])

    for p in ['version', 'embellished', 'framed', 'lens']:
        value = request_args.get(p)
        if value:
            params.add(p, value)

    return params


@app.route('/find', methods=R_METHODS)
@app.route('/find.<suffix>', methods=R_METHODS)
def find(suffix=None):
    arguments = request.args.copy()

    if not arguments.get('_statsrepr') and g.site.get('statsfind'):
        arguments.add('_statsrepr', g.site['statsfind'])
    if not arguments.get('_boost') and g.site.get('boost'):
        arguments.add('_boost', g.site['boost'])
    if g.site['title'] == 'id.kb.se':
        arguments.add('_site_base_uri', 'https://id.kb.se')
    response = _proxy_request(request, session,
                              url_path='/find',
                              query_params=arguments)
    return rendered_response('/find', suffix, response)


@app.route('/', methods=R_METHODS)
@app.route('/data', methods=R_METHODS)
@app.route('/data.<suffix>', methods=R_METHODS)
def dataindexview(suffix=None):
    statsrepr = request.args.get('statsrepr') or g.site['statsindex']
    results = dict(g.site)
    results['statistics'] = daccess.get_index_stats(statsrepr)
    return rendered_response('/', suffix, results)


def rendered_response(path, suffix, data, mimetype=None):

    if isinstance(data, Response):
        resp = data
        data = json.loads(resp.get_data())
    else:
        resp = None

    if mimetype:
        render = negotiator.get_renderer(mimetype)
    else:
        mimetype, render = negotiator.negotiate(request, suffix)

    if not render:
        return abort(406)

    result = render(path, data)

    charset = 'charset=UTF-8' # technically redundant, but for e.g. JSONView

    # return if result is a rendered page
    # we might want to add (some) headers here in the future
    # (e.g. Content-Location, Document, and Link)
    if isinstance(result, unicode):
        return result

    new_resp = Response(result, mimetype=mimetype +'; '+ charset)

    if resp:
        for header in KEEP_HEADERS:
            value = resp.headers.get(header)
            if value:
                new_resp.headers.add(header, value)

    if mimetype == 'application/json':
        context_link = '<%s>; rel="http://www.w3.org/ns/json-ld#context"' % CONTEXT_PATH
        new_resp.headers.add('Link', context_link)

    return new_resp


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

@negotiator.add(JSONLD_MIMETYPE, 'jsonld', group='RDF')
def render_jsonld(path, data):
    data[CONTEXT] = CONTEXT_PATH
    return _to_json(data)

@negotiator.add('text/turtle', 'ttl', group='RDF')
def render_ttl(path, data):
    return _to_graph(data).serialize(format='turtle')

@negotiator.add('text/n3', 'n3', group='RDF')
@negotiator.add('text/rdf+n3', 'n3', group='RDF')
@negotiator.add('application/n3', 'n3', group='RDF')
def render_ttl(path, data):
    return _to_graph(data).serialize(format='n3')

@negotiator.add('text/trig', 'trig', group='RDF')
def render_trig(path, data):
    return _to_graph(data).serialize(format='trig')

@negotiator.add('application/rdf+xml', 'rdf', group='RDF')
@negotiator.add('text/xml', 'xml')
def render_xml(path, data):
    return _to_graph(data).serialize(format='pretty-xml')

def _to_json(data):
    return json.dumps(data, indent=2, sort_keys=True,
            separators=(',', ': '), ensure_ascii=False).encode('utf-8')

def _to_graph(data, base=None):
    cg = ConjunctiveGraph()
    cg.parse(data=json.dumps(data), base=base or IDKBSE,
                format='json-ld', context=daccess.jsonld_context_data)
    return cg

def _get_template_for(data):
    if GRAPH in data:
        type_key = data.get(GRAPH)[1].get(TYPE)
    elif 'mainEntity' in data:
        type_key = data['mainEntity'].get(TYPE)
    else:
        type_key = data.get(TYPE)

    for rtype in as_iterable(type_key):
        template = TYPE_TEMPLATES.get(rtype)
        if template:
            return template
    return 'thing.html'


##
# Admin
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = unicode(app.config.get('OAUTHLIB_INSECURE_TRANSPORT') or '0')
app.secret_key = app.config.get('SESSION_SECRET_KEY') or ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(10))
app.remember_cookie_duration = timedelta(days=app.config.get('SESSION_COOKIE_LIFETIME') or 31)
app.permanent_session_lifetime = timedelta(days=app.config.get('SESSION_COOKIE_LIFETIME') or 31)


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


# !TODO this is stupid and should be solved a less dangerous way
# So rethink the flow for new records
# or maybe its not that stupid after all?
@app.route('/edit', methods=['POST'])
def thingnewp():
    record = json.loads(request.form['data'])
    app.logger.debug('Posting data to editor:\n %s',
                     record)
    return render_template('edit.html', thing=record, model={})

@app.route('/maintenance.html')
def maintenance():
    return render_template('maintenance.html')

@app.route('/_compilemarc')
def _compilemarc():
    return _proxy_request(request, session, query_params=['id', 'library'])

@app.route('/_findhold')
def _findhold():
    return _proxy_request(request, session, query_params=['id', 'library'])

@app.route('/_dependencies')
def _dependencies():
    return _proxy_request(request, session, query_params=['id', 'relation', 'reverse', "return"])


@app.route('/', methods=['POST'])
@app.route('/data', methods=['POST'])
def create():
    request.path = '/'
    return _write_data(request, query_params=MultiDict([]))


@app.route('/_merge', methods=['GET','POST'])
def _merge():
    return _proxy_request(request, session, query_params=['id1', 'id2', 'promote_id2'])


@app.route('/_convert', methods=['GET','POST'])
def convert():
    return _write_data(request, query_params={'to': 'application/x-marc-json'})


@app.route('/_remotesearch')
def _remotesearch():
    return _proxy_request(request, session,
                          query_params=['q', 'databases', 'n', 'start'])


def _proxy_request(request, session, json_data=None, query_params=[],
                   accept_header=None, url_path=None):
    params = MultiDict([])
    if isinstance(query_params, MultiDict):
        defaults = query_params
    else:
        defaults = MultiDict([])
    for param in query_params:
        vals = request.args.getlist(param) or defaults.getlist(param)
        for val in vals:
            params.add(param, val)

    url_path = url_path or request.path

    headers = dict(request.headers)
    accept_header = accept_header or headers.get('Accept')
    adjusted_accept_header = _adjust_accept_header(accept_header)
    if adjusted_accept_header:
        headers['Accept'] = adjusted_accept_header

    app.logger.debug('Sending proxy %s request to: %s with headers:\n%r\nand body:\n %s',
                     request.method, url_path, headers, json_data)

    response = daccess.api_request(url_path, request.method, headers,
                                   json_data=json_data,
                                   query_params=params)

    mapped_response = _map_response(response)

    # If the accept was for something other than JSON-LD, we need to adjust the
    # content location accordingly (since the backend API only serves the
    # JSON-LD location).
    response_data_suffix = negotiator.get_suffix(accept_header)
    if response_data_suffix:
        content_location = mapped_response.headers.get('Content-Location')
        if content_location:
            content_location = content_location.replace('data.jsonld',
                    'data.{}'.format(response_data_suffix))
            mapped_response.headers['Content-Location'] = content_location

    return mapped_response


def _adjust_accept_header(accept_header):
    # For RDF, the backend API only deals with JSON-LD. Thus, we add
    # negotiation for that if missing, and then serialize to preferred
    # requested format here.
    if accept_header and accept_header != JSONLD_MIMETYPE and any(
            ah.strip() in negotiator.mimetype_groups['RDF']
            for ah in accept_header.split(',')):
        return ', ' + JSONLD_MIMETYPE
    else:
        return accept_header


def _map_response(response):
    """
    Map from a Requests response to a Flask response.
    """
    def _map_headers(headers):
        _headers = {}
        for header in KEEP_HEADERS:
            value = headers.get(header)
            if value:
                _headers[header] = value
        return _headers

    resp = Response(response.text,
                    status=response.status_code,
                    mimetype=response.headers.get('content-type'),
                    headers=_map_headers(response.headers))

    if resp.status_code < 400:
        return resp
    elif resp.status_code < 500:
        abort(resp)
    else:
        abort(resp.status_code)


def _write_data(request, query_params=[]):
    json_data = request.get_json(force=True)
    return _proxy_request(request, session, json_data, query_params)


##
# Setup vocab view

from rdflib import URIRef, BNode, RDF, RDFS, OWL, Namespace
from rdflib.namespace import SKOS, DCTERMS

RDFNS = {
    'RDF': RDF,
    'RDFS': RDFS,
    'OWL': OWL,
    'SKOS': SKOS,
    'DCTERMS': DCTERMS,
    'VANN': Namespace("http://purl.org/vocab/vann/"),
    'VS': Namespace("http://www.w3.org/2003/06/sw-vocab-status/ns#"),
    'SCHEMA': Namespace("http://schema.org/"),
}

app.context_processor(lambda: RDFNS)

@app.route('/vocab/', methods=R_METHODS)
@app.route('/vocab/data.<suffix>', methods=R_METHODS)
def vocabview(suffix=None):
    voc = daccess.vocab.get_util()

    etag = request.headers.get('if-none-match', default = '').replace('-gzip', '')
    if etag == daccess.vocab.vocab_etag:
        return Response(status=304)

    def link(obj):
        if ':' in obj.qname() and not any(obj.objects(None)):
            return obj.identifier
        return '#' + obj.qname()

    def listclass(o):
        return 'ext' if ':' in o.qname() else 'loc'

    def no_bnodes(coll):
        for o in coll:
            if not isinstance(o.identifier, BNode):
                yield o

    mimetype, render = negotiator.negotiate(request, suffix)

    resp = None
    if mimetype == JSONLD_MIMETYPE:
        vocab_data = {
            CONTEXT: CONTEXT_PATH,
            GRAPH: daccess.vocab.vocab_data[GRAPH]
        }
        resp = Response(json.dumps(vocab_data),
                content_type='%s; charset=UTF-8' % mimetype)

    elif mimetype in negotiator.mimetype_groups['RDF']:
        resp = Response(voc.graph.serialize(format=
                'json-ld' if mimetype == JSONLD_MIMETYPE else mimetype,
                #context_id=CONTEXT_PATH,
                context=daccess.jsonld_context_data[CONTEXT]), content_type='%s; charset=UTF-8' % mimetype)

    if resp:
        resp.headers['ETag'] = daccess.vocab.vocab_etag
        return resp

    return render_template('vocab.html',
            URIRef=URIRef, **vars())


# TODO: This could be done by backend (it does not properly 303 to record for
# contained id:s) Also, doing it here would overshadow non-contained resources
# (importantly, context and display)
#@app.route('/vocab/<term>')
#def vocab_term(term):
#    return redirect('/vocab/#' + term, 303)


##
# Setup marcframe view

@app.route('/marcframe/')
def marcframeview():
    mfview = MarcFrameView(
            daccess.api_request(app.config['MARCFRAME_SOURCE']).json())
    return render_template('marcframeview.html',
            mf=mfview,
            pretty_json=pretty_json)
