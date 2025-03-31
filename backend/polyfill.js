const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
}

console.log('Crypto polyfill loaded');