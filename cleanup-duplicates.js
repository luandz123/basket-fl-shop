const fs = require('fs');
const path = require('path');

const filesToDelete = [
  path.join(__dirname, 'src', 'pages', 'favicon.ico.tsx'),
  path.join(__dirname, 'src', 'pages', 'api', 'images', '[...path].ts'),
  path.join(__dirname, 'src', 'app', 'favicon.ico'),
  path.join(__dirname, 'next.config.ts')
];

console.log('Cleaning up duplicate files...');

filesToDelete.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error);
  }
});

console.log('Cleanup complete!');
