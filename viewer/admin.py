#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Blueprint, current_app as app, request, redirect
from oauthlib.oauth2 import MobileApplicationClient
from requests_oauthlib import OAuth2Session

admin_app = Blueprint('admin_app', __name__)

@admin_app.route('/login/authorize')
def login_authorize():
    try:
        requests_oauth = _get_requests_oauth()
        authorization_url, state =  requests_oauth.authorization_url(app.config['OAUTH_AUTHORIZATION_URL'], approval_prompt='auto')
        app.logger.info('[%s] Trying to authorize user, redirecting to %s ', request.remote_addr, authorization_url)
        # Redirect to oauth authorization
        return redirect(authorization_url)
    except Exception as e:
        app.logger.error('Failed to create authorization url,  %s ', str(e))
        return


def _get_requests_oauth():
    # Create new oAuth 2 session
    client_id = app.config['OAUTH_CLIENT_ID']
    scopes = app.config['OAUTH_SCOPES']
    mobile_client = MobileApplicationClient(client_id=client_id)
    requests_oauth = OAuth2Session(client=mobile_client, scope=scopes)
    return requests_oauth