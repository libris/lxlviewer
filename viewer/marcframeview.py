import re
import json

import requests


MARC_CATEGORIES = 'bib', 'auth', 'hold'


class MarcFrameView:

    def __init__(self, marcframe):
        self.marcframe = marcframe

    def marc_categories(self):
        for cat in MARC_CATEGORIES:
            yield cat, self.marcframe[cat]

    def fields(self, catdfn):
        for tag, dfn in sorted(catdfn.items()):
            if tag.isdigit() and dfn:
                kind = ('fixed' if any(k for k in dfn if k[0] == '[' and ':' in k)
                        else 'field' if any(k for k in dfn if k[0] == '$')
                        else 'control')
                yield tag, kind, dfn

    def codes(self, dfn):
        for code, subdfn in sorted(dfn.items()):
            if code.startswith('$') and subdfn:
                yield code, subdfn


def pretty_json(data):
    s = json.dumps(data, sort_keys=True, ensure_ascii=False, indent=2,
            separators=(',', ': '))
    return re.sub(r'{\s+(\S+: "[^"]*")\s+}', r'{\1}', s)
