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
    def __init__(self, username, active = True, permissions = None, token = None, email = ''):
        self.username = unicode(username)
        self.short_name = unicode(username).split()[0]
        self.active = active
        self.permissions = permissions
        self.token = token
        self.email = email

    def __repr__(self):
        return '<User %r>' % (self.username)

    def get(self):
        return {"full_name": self.username,
                "short_name": self.short_name,
                "email": self.email,
                "permissions": self.permissions,
                "access_token": self.get_access_token(),
                "email_hash": self.get_email_hash()}

    def get_as_json(self):
        return json.dumps(self.get())

    def get_id(self):
        return self.username

    def get_username(self):
        return self.get_id()

    def get_short_name(self):
        return self.short_name

    def get_email_hash(self):
        return hashlib.md5(str(self.email).lower().encode()).hexdigest()

    def get_gravatar_url(self, size=32):
        hashed_email = hashlib.md5(str(self.email).lower().encode()).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=mm&s={}'.format(self.get_email_hash(), size)

    def get_permissions(self):
        return self.permissions

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
    if not 'permissions' in session:
        return None
    return User(uid, permissions=session.get('permissions'),
                token=_get_token(), email=session.get('user_email'))


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
            session['oauth_token'] = requests_oauth.fetch_token(token_url,
                                                                client_secret=app.config['OAUTH_CLIENT_SECRET'],
                                                                authorization_response=request.url)
            app.logger.debug('OAuth token received %s ', json.dumps(_get_token()))
        except Exception, e:
            raise Exception('Failed to get token, %s response: %s. Try login again' % (token_url, str(e)))

        # Get user from verify
        try:
            verify_url = app.config['OAUTH_VERIFY_URL']
            verify_response = requests_oauth.get(verify_url).json()
            verified_user = verify_response.get('user')
            app.logger.info('[%s] User received from verify %s, %s', request.remote_addr, verified_user.get('username'), json.dumps(verified_user))

        except Exception, e:
            raise Exception('Failed to verify user. %s response: %s ' % (verify_url, str(e)))

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
    session.pop('permissions', None)
    session.pop('user_email', None)
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
    requests_oauth = _get_requests_oauth()
    token = requests_oauth.refresh_token(
        app.config['OAUTH_TOKEN_URL'],
        **extra)
    _token_updater(token)


def _fake_login():
    fake_user_login = app.config.get('FAKE_LOGIN')
    if app.config.get('FAKE_LOGIN'):
        user = User(fake_user_login.get('name'), permissions=fake_user_login.get('permissions'))
        app.logger.debug("Faking login %s %s", user.get_id(), json.dumps(user.get_permissions()))
        login_user(user, True)
        session['permissions'] = user.permissions
        return True
    else:
        return False


def _filter_permissions(permissions, permission_roles):
    if not permissions or not permission_roles:
        return []
    def f(auth):
        # filter out auth without specified roles
        return filter(lambda role: auth.get(role), permission_roles)

    return list(filter(f, permissions))


def _login_user(verified_user):
    permissions = verified_user.get('permissions')
    username = verified_user.get('full_name')
    email = verified_user.get('email')
    if permissions and username:
        # For debugging, allow force registrant rights
        if(app.config.get('ALWAYS_ALLOW_XLREG')):
            for auth in permissions:
                auth['registrant'] = True;

        # Filter permissions to make sure user got correct role rights
        permissions = _filter_permissions(permissions, app.config.get('AUTHORIZED_ROLES'))
        if not permissions:
            raise Exception('You insufficient rights to access this service. Contact support to gain access.')

        # Create Flask user
        user = User(username, permissions=permissions, token=_get_token(), email=email)
        session['permissions'] = permissions
        session['user_email'] = email
        return login_user(user, True)
    return False


def _next_route():
    if 'next' in session:
        next = session['next']
        session.pop('next')
        return next
    else:
        return '/'
