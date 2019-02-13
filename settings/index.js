const { readdirSync: readdir } = require('fs');
const { merge } = require('lodash');

const { remote } = require('electron');
console.assert(remote || !remote);
const { argv } = remote ? remote.process : process;
console.assert(argv);
const { env } = remote ? remote.process : process;
console.assert(env);

const yargs = require('yargs')
    .array('auth0.scopes')
    .array('oas.servers')
    .config('json');

const args = yargs.parse(argv.slice(1));
console.assert(args);

const json_list = readdir(__dirname).filter((name) => {
    return name.match(/^([0-9]+)-(\w+)\.json$/);
}).map((name) => {
    const arr = (a) => a instanceof Array;
    const obj = (o) => o instanceof Object;
    const key = (p, k) => (p
        ? `${p}_${k}` : k).toUpperCase();
    const value = (p, v) => env[p] !== undefined
        ? JSON.parse(env[p]) : v;
    const resolve = (json, p = "") => {
        if (p && value(p) !== undefined) {
            return value(p);
        }
        if (obj(json)) {
            return Object.entries(json)
                .map(([k, v]) =>
                    [k, resolve(v, key(p, k))])
                .reduce((acc, [k, v]) => {
                    acc[k] = v; return acc;
                }, arr(json) ? [] : {});
        }
        return value(p, json);
    }
    return resolve(require(`./${name}`));
});
module.exports = merge(...json_list, args);
