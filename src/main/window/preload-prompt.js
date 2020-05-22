const { storage } = require('./preload-storage');
const { oas } = require('../../../settings');

window.prompt = (function monkey(prompt) {
  return () => storage.get('oas-url', oas.url);
}(prompt));

window.OAS_URL = oas.url;
