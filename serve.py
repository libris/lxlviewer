#!/usr/bin/env python
import sys
import logging
import argparse
import warnings
from viewer import app

log = logging.getLogger()
log.addHandler(logging.StreamHandler(stream=sys.stdout))
log.setLevel(logging.DEBUG if app.debug else logging.INFO)

argp = argparse.ArgumentParser()
argp.add_argument('--port', '-p', type=int)
args = argp.parse_args()

# Warning from rdfxml that should be ignored
warnings.filterwarnings('ignore', message = 'Assertions on rdflib.term.BNode')

app.run(port=args.port,host='0.0.0.0',threaded=True)
