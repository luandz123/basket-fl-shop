const fs = require('fs');
const path = require('path');

// Files to delete
const filesToDelete = [
  'src/pages/favicon.ico.tsx',
  'src/app/favicon.ico',
  'src/app/favicon.ico.tsx',
  'src/app/favicon.ico.mjs',
];

// Check if file exists and delete it
function deleteFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted: ${filePath}`);
    } else {
      console.log(`⚠️ Not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message);
  }
}

// Delete all conflicting files
console.log('🧹 Cleaning up conflicting files...');
filesToDelete.forEach(deleteFile);

// Make sure public/favicon.ico exists
const faviconPath = path.join(__dirname, 'public/favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('⚠️ No favicon.ico found in public directory!');
  console.log('Please create or download a favicon.ico file and place it in the public directory.');
} else {
  console.log('✅ favicon.ico exists in public directory');
}

console.log('\nNext steps:');
console.log('1. Delete the .next folder: rm -rf .next');
console.log('2. Restart your Next.js server: npm run dev');
