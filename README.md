# API Explorer

A user interface to explore [OpenApi specifications][0] (OAS) with support for OAUTH2 via [Auth0.com][1].

## Installation

```sh
npm install
```

## Configuration

In `settings/01-custom.json` replace all configuration values starting with `${MY_...}` — to fully understand each field please consult [auth0.com/docs/api/authentication#authorize-application][2].

### Auth0: authentication & authorization

```javascript
"auth0": {
```
> your unique ID of the target API you want to access:
```javascript
    "api_identifier": "${MY_AUTH0_AUDIENCE}", // e.g. "https://api.custom.tld/"
```
> your application's ID:
```javascript
    "client_id": "${MY_AUTH0_CLIENT_ID}", // e.g. "00000000...00000000"
```
> your Auth0 domain:
```javascript
    "domain": "${MY_AUTH0_DOMAIN}", // e.g. "custom.auth0.com"
```
> silent (`none`) or explicit (`login`) authentication:
```javascript
    "prompt": "login",
```
> scopes which you want to request authorization for:
```javascript
    "scopes": [
        // e.g. "a:scope", "another:scope", "yet-another:scope"
        "openid", "profile", "offline_access", "${MY_API_SCOPE(s)}"
    ],
```
> URL to which Auth0 will redirect to:
```javascript
    "redirect_uri": "file:///callback"
```
```javascript
}
```

### OAS: OpenApi specification

```javascript
"oas": {
```
> list of allowed API servers (with regex support):
```javascript
    "servers": [
        "${MY_API_SERVER(s)}", // e.g. "^https://(.+)\\.custom\\.tld"
        "^http(s?)://localhost:8000"
    ],
```
> URL to fetch the default OpenApi specification from:
```javascript
    // e.g. "https://api.custom.tld/oas/openapi@latest.yaml"
    "url": "${MY_DEFAULT_OAS_URL}"
```
```javascript
}
```

## Execution

#### debugging:

```sh
npm start
```

#### production:

```sh
./api-explorer
```

## CLI Arguments

It's also possible to provide a configuration file and/or arguments via the command line interface:

#### debugging:

```sh
npm run -- start -- --json ./settings/01-custom.json
```

#### production:

```sh
./api-explorer --json ./resources/app/settings/01-custom.json
```

where the location of the `*.json` configuration file can be anywhere, and is not just restricted to the path shown above, and further where each (even nested) configuration entry can be separately defined as well, for example:

#### debugging:

```sh
npm run -- start -- --json ./settings/01-custom.json \
    --auth0.scopes=get:my-scope post:my-scope \
    --oas.servers="^https://(.+).custom.tld" \
    --oas.servers="^http://localhost:8000"
```

#### production:

```sh
./api-explorer --json ./resources/app/settings/01-custom.json \
    --auth0.scopes=get:my-scope post:my-scope \
    --oas.servers="^https://(.+).custom.tld" \
    --oas.servers="^http://localhost:8000"
```

[0]: https://www.openapis.org
[1]: https://auth0.com
[2]: https://auth0.com/docs/api/authentication#authorize-application
