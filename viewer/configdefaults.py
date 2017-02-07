from __future__ import unicode_literals
from os import path as P

DEBUG=False

ENVIRONMENT = 'UNKNOWN'
VERSION = 'UNKNOWN'

DBHOST='127.0.0.1'
DBNAME='definitions'
DBUSER=None
DBPASSWORD=None

ESHOST='127.0.0.1'
ES_INDEX = DBNAME
ES_SNIFF_ON_START=True

VOCAB_IRI = "https://id.kb.se/vocab/"
CONTEXT_IRI = "https://id.kb.se/vocab/context"
DISPLAY_IRI = "https://id.kb.se/vocab/display"
LANG = "sv"

BASE_URI_ALIAS = {}

MARCFRAME_SOURCE = '/sys/marcframe.json'
