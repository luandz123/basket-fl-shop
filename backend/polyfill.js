// Không cần dùng file này nữa vì đã cập nhật start:prod
// Nếu vẫn muốn giữ lại, nội dung như sau:
const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
}

console.log('Crypto polyfill loaded');