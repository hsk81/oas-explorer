const jwt_decode = require('jwt-decode');
const req = require('request');
const url = require('url');

const { auth0 } = require('../../settings');
const { Storage } = require('./storage');
const { userInfo } = require('os');

// @see: https://auth0.com/docs/api/authentication#regular-web-app-login-flow
const authorization_url = (new function () {
    this.prompt = new Storage(
        auth0.domain, userInfo().username, 'prompt');

    this.get = async () => `https://${auth0.domain}/authorize` +
        `?audience=${auth0.api_identifier}` +
        `&client_id=${auth0.client_id}` +
        `&prompt=${await this.prompt.get() || auth0.prompt}` +
        `&redirect_uri=${auth0.redirect_uri}` +
        `&response_type=code` +
        `&scope=${auth0.scopes.join(' ')}`;

    this.set = async ({ prompt }) => {
        await this.prompt.set(prompt);
    };
}());

// @see: https://auth0.com/docs/api/authentication#logout
const logout_url = (new function () {
    this.get = () => `https://${auth0.domain}/v2/logout` +
        `?client_id=${auth0.client_id}&federated`;
}());

const profile = new Storage(
    auth0.domain, userInfo().username, 'profile');
const access_token = new Storage(
    auth0.domain, userInfo().username, 'access-token');
const refresh_token = new Storage(
    auth0.domain, userInfo().username, 'refresh-token');

async function requestTokens(callback_url) {
    const url_parts = url.parse(callback_url, true);
    const query = url_parts.query;
    const options = {
        method: 'POST',
        url: `https://${auth0.domain}/oauth/token`,
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            'grant_type': 'authorization_code',
            'client_id': auth0.client_id,
            'code': query.code,
            'redirect_uri': auth0.redirect_uri
        })
    };
    return new Promise((resolve) => {
        req(options, async (e, res, body) => {
            if (e || body.error) {
                console.error('[auth:request-token]', e || body.error);
            }
            if (e || body.error) {
                await refresh_token.del();
                await access_token.del();
                await profile.del();
                resolve(false);
            } else try {
                const res_body = JSON.parse(body);
                await refresh_token.set(
                    res_body.refresh_token
                );
                await access_token.set(
                    res_body.access_token
                );
                await profile.set(JSON.stringify(jwt_decode(
                    res_body.id_token
                )));
                resolve(true);
            } catch (ex) {
                console.error('[auth:request-token]', ex);
                await refresh_token.del();
                await access_token.del();
                await profile.del();
                resolve(false);
            }
        });
    });
}
async function refreshTokens() {
    const refresh_tok = await refresh_token.get();
    if (!refresh_tok) {
        return false;
    }
    const options = {
        method: 'POST',
        url: `https://${auth0.domain}/oauth/token`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            client_id: auth0.client_id,
            grant_type: 'refresh_token',
            refresh_token: refresh_tok,
        },
        json: true
    };
    return new Promise((resolve) => {
        req(options, async (e, res, body) => {
            if (e || body.error) {
                console.error('[auth:refresh-token]', e || body.error);
            }
            if (e || body.error) {
                await refresh_token.del();
                resolve(false);
            } else try {
                await access_token.set(
                    body.access_token
                );
                await profile.set(JSON.stringify(jwt_decode(
                    body.id_token
                )));
                resolve(true);
            } catch (ex) {
                console.error('[auth:refresh-token]', ex);
                await refresh_token.del();
                resolve(false);
            }
        });
    });
}
async function logout() {
    await Promise.all([
        access_token.del(),
        profile.del()
    ]);
    const options = {
        url: logout_url.get()
    };
    return new Promise((resolve) => {
        req(options, (e, res, body) => {
            if (e || body.error) {
                console.error('[auth:logout]', e || body.error);
            }
            if (e || body.error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    })
}
module.exports = {
    getProfile: () => profile.get(),
    getAccessToken: () => access_token.get(),
    getAuthorizationUrl: () => authorization_url.get(),
    setAuthorizationUrl: (...args) => authorization_url.set(...args),
    requestTokens,
    refreshTokens,
    logout
};
