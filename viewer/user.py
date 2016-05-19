#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask_login import UserMixin
import json
import requests

class User(UserMixin):
    def __init__(self, username, active = True, authorization = None, token = None):
        self.username = unicode(username)
        self.active = active
        self.authorization = authorization
        self.token = token

    def __repr__(self):
        return '<User %r>' % (self.username)

    def get(self):
        return { "username": self.username, "authorization": self.authorization }

    def get_id(self):
        return self.username

    def get_username(self):
        return self.get_id()

    def get_authorization(self):
        return self.authorization

    def get_authorization_json(self):
        return json.dumps(self.authorization)

    def is_active(self):
        return self.active

    def get_token(self):
        return self.token

    def get_access_token(self):
        if 'access_token' in self.token:
            return self.token['access_token']
        else:
            return None