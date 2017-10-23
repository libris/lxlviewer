#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json, hashlib
from flask import Blueprint, current_app as app, request, render_template, session, redirect
from flask_login import LoginManager, UserMixin
from flask_login import login_required, login_user, current_user, logout_user
from requests_oauthlib import OAuth2Session


admin_app = Blueprint('admin_app', __name__)

login_manager = LoginManager()


@admin_app.record_once
def on_load(state):
    login_manager.setup_app(state.app)


class User(UserMixin):
    def __init__(self, username, active = True, authorization = None, token = None):
        self.username = unicode(username)
        self.active = active
        self.authorization = authorization
        self.token = token
        self.email = '' # TODO: Insert user email

    def __repr__(self):
        return '<User %r>' % (self.username)

    def get(self):
        return { "username": self.username, "authorization": self.authorization, "access_token": self.get_access_token() }

    def get_as_json(self):
        return json.dumps(self.get())

    def get_id(self):
        return self.username

    def get_username(self):
        return self.get_id()

    def get_gravatar_url(self, size=32):
        hashed_email = hashlib.md5(str(self.email).lower().encode()).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=mm&s={}'.format(hashed_email, size)

    def get_authorization(self):
        return self.authorization

    def is_active(self):
        return self.active

    def get_token(self):
        return self.token

    def get_access_token(self):
        if self.token and 'access_token' in self.token:
            return self.token['access_token']
        else:
            return None


@login_manager.user_loader
def _load_user(uid):
    if not 'authorization' in session:
        return None
    return User(uid, authorization=session.get('authorization'), token=_get_token())


@login_manager.unauthorized_handler
def _handle_unauthorized():
    if _fake_login():
        return redirect(_next_route())
    else:
        return redirect('/login?next=' + request.path)


# Login page
@admin_app.route("/login")
def login():
    session['next'] = request.args.get('next');
    return _render_login()


# Route to redirect to oauth endpiont
@admin_app.route('/login/authorize')
def login_authorize():
    try:
        requests_oauth = _get_requests_oauth()
        authorization_url, state =  requests_oauth.authorization_url(app.config['OAUTH_AUTHORIZATION_URL'], approval_prompt='auto')
        app.logger.info('[%s] Trying to authorize user, redirecting to %s ', request.remote_addr, authorization_url)
        # Redirect to oauth authorization
        return redirect(authorization_url)
    except Exception, e:
        app.logger.error('Failed to create authorization url,  %s ', str(e))
        return _render_login(str(e))


# Route called on oauth callback
@admin_app.route('/login/authorized')
def authorized():
    app.logger.debug('Got authorized redirect')
    try:
        # Get access token
        try:
            token_url = app.config['OAUTH_TOKEN_URL']
            app.logger.info('[%s] Trying to get access token from %s', request.remote_addr, token_url)
            requests_oauth = _get_requests_oauth()
            # On authorized fetch token
            session['oauth_token'] = requests_oauth.fetch_token(token_url, client_secret=app.config['OAUTH_CLIENT_SECRET'], authorization_response=request.url)
            app.logger.debug('OAuth token received %s ', json.dumps(_get_token()))
        except Exception, e:
            raise Exception('Failed to get token, %s response: %s. Try login again' % (token_url, str(e)))

        # Get user from verify
        try:
            varify_url = app.config['OAUTH_VERIFY_URL']
            verify_response = requests_oauth.get(varify_url).json()
            verified_user = verify_response.get('user')
            app.logger.info('[%s] User received from verify %s, %s', request.remote_addr, verified_user.get('username'), json.dumps(verified_user))

        except Exception, e:
            raise Exception('Failed to verify user. %s response: %s ' % (varify_url, str(e)))

        if _login_user(verified_user):
            return redirect(_next_route())
        else:
            raise Exception('Failed to login.')

    except Exception, e:
        msg = str(e)
        app.logger.error(msg)
        return _render_login(msg)


# Logout user and session
# !TODO inform user or signout user in oauth endpoint
@admin_app.route('/logout')
def logout():
    app.logger.info('[%s] Trying to sign out.', request.remote_addr)
    logout_user()
    session.pop('authorization', None)
    session.pop('oauth_token', None)
    return render_template('logout.html')


# User settings
@admin_app.route("/usersettings")
def usersettings():
    return render_template('usersettings.html')


def _render_login(msg = None):
    return render_template('login.html', msg = msg)


def _get_token():
    if 'oauth_token' in session:
        return session['oauth_token']
    return None


# Run on access token refreshed
def _token_updater(token):
    app.logger.info('Token expired updated to be %s ', json.dumps(token))
    session['oauth_token'] = token


def _get_requests_oauth():
    # Create new oAuth 2 session
    requests_oauth = OAuth2Session(app.config['OAUTH_CLIENT_ID'],
               redirect_uri=app.config['OAUTH_REDIRECT_URI'],
               auto_refresh_kwargs={ 'client_id': app.config['OAUTH_CLIENT_ID'], 'client_secret': app.config['OAUTH_CLIENT_SECRET'] },
               auto_refresh_url=app.config['OAUTH_TOKEN_URL'],
               token = _get_token(),
               token_updater=_token_updater
               )
    return requests_oauth


def refresh_token():
    """Refresh access token.

    Raises InvalidGrantError if refresh token not recognized by provider.
    """
    extra = {
        'client_id': app.config['OAUTH_CLIENT_ID'],
        'client_secret': app.config['OAUTH_CLIENT_SECRET']
    }

    app.logger.debug("Refreshing OAuth2 token")
    requests_oauth = OAuth2Session(app.config['OAUTH_CLIENT_ID'],
                                   token=_get_token())
    token = requests_oauth.refresh_token(
        app.config['OAUTH_TOKEN_URL'],
        **extra)
    _token_updater(token)


def _fake_login():
    fake_user_login = app.config.get('FAKE_LOGIN')
    if app.config.get('FAKE_LOGIN'):
        user = User(fake_user_login.get('name'), authorization=fake_user_login.get('authorization'))
        app.logger.debug("Faking login %s %s", user.get_id(), json.dumps(user.get_authorization()))
        login_user(user, True)
        session['authorization'] = user.authorization
        return True
    else:
        return False


def _filter_authorization(authorization, authorization_roles):
    if not authorization or not authorization_roles:
        return []
    def f(auth):
        # filter out auth without specified roles
        return filter(lambda role: auth.get(role), authorization_roles)

    return list(filter(f, authorization))


def _login_user(verified_user):
    authorization = verified_user.get('authorization')
    username = verified_user.get('username')
    if authorization and username:
        # For debugging, allow force xlreg rights
        if(app.config.get('ALWAYS_ALLOW_XLREG')):
            for auth in authorization:
                auth['xlreg'] = True;

        # Filter authorization to make sure user got correct role rights
        authorization = _filter_authorization(authorization, app.config.get('AUTHORIZED_ROLES'))
        if not authorization:
            raise Exception('You insufficient rights to access this service. Contact support to gain access.')

        # Create Flask user
        user = User(username, authorization=authorization, token=_get_token())
        session['authorization'] = authorization
        return login_user(user, True)
    return False


def _next_route():
    next = session['next']
    session.pop('next')
    return next or '/'
