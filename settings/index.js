const { readdirSync } = require('fs');
const { unlinkSync } = require('fs');
const { writeFile } = require('fs');

const { merge } = require('lodash');
const { join } = require('path');

const process = () => {
    try {
        const { remote } = require('electron');
        if (remote) {
            return remote.process;
        }
        return require('process');
    } catch (ex) {
        return require('process');
    }
};

const { argv } = process();
console.assert(argv);
const { env } = process();
console.assert(env);

const yargs = require('yargs')
    .array('auth0.scopes')
    .array('oas.servers')
    .config('json');

const args = yargs.parse(argv.slice(1));
console.assert(args);

const apx_config_del = JSON.parse(env['APX_CONFIG_DEL'] || '0');
const apx_config_set = JSON.parse(env['APX_CONFIG_SET'] || '0');
const apx_config_tpl = /^([0-9]{3})-(\w+)\.json$/;
const apx_config_999 = '999-custom.json';

if (apx_config_set || apx_config_del) {
    const path_to = join(__dirname, apx_config_999);
    try { unlinkSync(path_to); } catch (ex) { }
}

const json_list = readdirSync(__dirname).filter((name) => {
    return apx_config_tpl.test(name);
}).map((name) => {
    const arr = (a) => a instanceof Array;
    const obj = (o) => o instanceof Object;
    const key = (p, k) => (p
        ? `${p}_${k}` : k).toUpperCase();
    const value = (p, v) => env[p] !== undefined
        ? JSON.parse(env[p]) : v;
    const resolve = (json, p = 'APX') => {
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
    return resolve(
        require(`./${name}`)
    );
});

if (apx_config_set) {
    const data = new Uint8Array(Buffer.from(
        JSON.stringify(merge(...json_list, args), null, 4)
    ));
    writeFile(join(__dirname, apx_config_999), data, (e) => {
        if (e) { console.error(e); }
    });
}

module.exports = merge(...json_list, args);
