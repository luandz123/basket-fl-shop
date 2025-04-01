
const { execSync } = require('child_process');
const fs = require('fs');

// Kiểm tra và tạo tsconfig.build.json nếu không tồn tại
if (!fs.existsSync('tsconfig.build.json')) {
  console.log('Creating tsconfig.build.json...');
  fs.writeFileSync(
    'tsconfig.build.json',
    JSON.stringify({
      extends: './tsconfig.json',
      exclude: ['node_modules', 'test', 'dist', '**/*spec.ts']
    }, null, 2)
  );
}

// Chạy build
console.log('Building project...');
try {
  execSync('nest build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
