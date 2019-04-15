"""
Negotiator is a container of mime-type, suffix and function mappings which
selects a function by HTTP content negotiation, using the Flask (Werkzeug)
Request.accept_mimetypes utility.

Examples::

    >>> from werkzeug.test import create_environ
    >>> from werkzeug.wrappers import Request

    >>> negotiator = Negotiator()

    >>> @negotiator.add('text/html', 'html')
    ... def render_html():
    ...     pass

    >>> @negotiator.add('application/json', 'json')
    ... def render_json():
    ...     pass

    >>> print(negotiator.get_suffix('text/html'))
    html

    >>> negotiator.get_renderer('text/html') is render_html
    True

    >>> def check(mime_type, suffix=None):
    ...    request = Request(create_environ('/', headers={'Accept': mime_type}))
    ...    mtype, f = negotiator.negotiate(request, suffix)
    ...    print(mtype, f.__name__ if f else None)

    >>> check("text/html")
    text/html render_html

    >>> check("application/json")
    application/json render_json

    >>> check("*/*")
    text/html render_html

    >>> check("application/x-octet-stream")
    None None

    >>> check("*/*", 'json')
    application/json render_json

    >>> check("application/x-octet-stream", 'html')
    text/html render_html

    >>> check("text/html;q=0.8")
    text/html render_html

    >>> check("text/html, application/json;q=0.8")
    text/html render_html

    >>> check("text/html;q=0.1, application/json;q=0.8")
    application/json render_json

    >>> check("*/*")
    text/html render_html

    >>> check("*/*, text/html;q=0.9, application/json;q=0.8")
    text/html render_html

    >>> check("*/*, application/json;q=0.8, text/html")
    text/html render_html

    >>> check("*/*, application/json;q=0.8, text/html;q=0.9")
    text/html render_html
"""
from __future__ import unicode_literals, print_function
__metaclass__ = type


class Negotiator:

    def __init__(self):
        self._mimetype_renderer_map = {}
        self._suffix_mimetype_map = {}
        self._mimetype_suffix_map = {}
        self.mimetype_groups = {}
        self.preferred = None
        self.default = None

    def add(self, mimetype, *suffixes, **kwargs):
        group = kwargs.get('group')
        def decorate(f):
            self._mimetype_renderer_map[mimetype] = f
            for suffix in suffixes:
                self._suffix_mimetype_map[suffix] = mimetype
            if suffixes:
                self._mimetype_suffix_map[mimetype] = suffixes[0]
            if group:
                self.mimetype_groups.setdefault(group, []).append(mimetype)
            if not self.preferred:
                self.preferred = mimetype
                self.default = f
            return f
        return decorate

    def negotiate(self, request, suffix=None):
        if suffix:
            mimetype = self._suffix_mimetype_map.get(suffix)
            return mimetype, self.get_renderer(mimetype)
        else:
            accepts = request.accept_mimetypes
            mimetype = accepts.best_match(self._mimetype_renderer_map)
            pref_quality = accepts[self.preferred]
            if mimetype:
                if accepts[mimetype] > pref_quality:
                    return mimetype, self.get_renderer(mimetype)
                elif pref_quality:
                    return self.preferred, self.default
        return None, None

    def get_suffix(self, mimetype):
        return self._mimetype_suffix_map.get(mimetype)

    def get_renderer(self, mimetype):
        return self._mimetype_renderer_map.get(mimetype)


if __name__ == '__main__':
    import doctest
    doctest.testmod()
