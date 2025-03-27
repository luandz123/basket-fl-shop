const fs = require('fs');
const path = require('path');

// Path to the conflicting Pages Router file
const pagesApiPath = path.join(__dirname, 'src', 'pages', 'api', 'images', '[...path].ts');

console.log('Checking for conflicting routes...');

try {
  // Check if the file exists
  if (fs.existsSync(pagesApiPath)) {
    console.log(`Found conflicting file at: ${pagesApiPath}`);
    
    // Delete the file
    fs.unlinkSync(pagesApiPath);
    console.log('Successfully deleted the conflicting file.');
  } else {
    console.log('No conflict found in the expected location.');
    
    // Check if the directory exists
    const dirPath = path.join(__dirname, 'src', 'pages', 'api', 'images');
    if (fs.existsSync(dirPath)) {
      // List files in the directory to check for potential variations
      const files = fs.readdirSync(dirPath);
      console.log(`Files in ${dirPath}:`, files);
      
      // Delete any file that might be causing conflicts
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      });
    }
  }
  
  console.log('Cleanup complete!');
  console.log('Next steps:');
  console.log('1. Delete the .next folder: rm -rf .next');
  console.log('2. Restart your Next.js server: npm run dev');
} catch (error) {
  console.error('Error during cleanup:', error);
}
