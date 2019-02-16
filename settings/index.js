const { walk } = require('./walk');

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

const settings_dbg = JSON.parse(env['SETTINGS_DBG'] || '0');
const settings_del = JSON.parse(env['SETTINGS_DEL'] || '0');
const settings_set = JSON.parse(env['SETTINGS_SET'] || '0');
const settings_tpl = /^([0-9]{3})-(\w+)\.json$/;
const settings_999 = '999-custom.json';

if (settings_set || settings_del) {
    const path_to = join(__dirname, settings_999);
    try { unlinkSync(path_to); } catch (ex) { }
}
const json_list = readdirSync(__dirname).filter((name) => {
    return settings_tpl.test(name);
}).map((name) => {
    return walk(require(`./${name}`), 'APX')({
        key: (p, k) => `${p}_${k}`.toUpperCase(),
        value: (p, v) => env[p] !== undefined
            ? JSON.parse(env[p]) : v
    });
});
if (settings_set) {
    const data = new Uint8Array(Buffer.from(
        JSON.stringify(merge(...json_list, args), null, 4)
    ));
    writeFile(join(__dirname, settings_999), data, (e) => {
        if (e) { console.error(e); }
    });
}
const settings = merge(...json_list, args);
if (settings_dbg) {
    walk(settings, 'APX')({
        key: (p, k) => `${p}_${k}`.toUpperCase(),
        value: (p, k) => console.debug(`${p}=${k}`)
    });
}
module.exports = settings;
