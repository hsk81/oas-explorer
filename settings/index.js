const { readdirSync: readdir } = require('fs');
const { merge } = require('lodash');

const { remote } = require('electron');
console.assert(remote || !remote);
const { argv } = remote ? remote.process : process;
console.assert(argv);

const yargs = require('yargs')
    .array('auth0.scopes')
    .array('oas.servers')
    .config('json');

const args = yargs.parse(argv.slice(1));
console.assert(args);

const json_list = readdir(__dirname).filter((name) => {
    return name.match(/^([0-9]+)-(\w+)\.json$/);
}).map((name) => {
    return require(`./${name}`);
});

module.exports = merge(...json_list, args);
