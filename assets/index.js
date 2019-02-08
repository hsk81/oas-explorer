const { join } = require('path');

const icon = (path_to, h, w) => ({
    icns: join(
        __dirname, `${path_to}/img/${h || 128}x${w || 128}.icns`),
    ico: join(
        __dirname, `${path_to}/img/${h || 128}x${w || 128}.ico`),
    png: join(
        __dirname, `${path_to}/img/${h || 128}x${w || 128}.png`),
    svg: join(
        __dirname, `${path_to}/svg/icon.svg`)
});

module.exports = {
    icon: icon('icons/api-2#016eaa4f7069c01b91bd21b68170d84e')
};
