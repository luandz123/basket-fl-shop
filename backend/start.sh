echo "Checking for main.js..."
if [ -f "dist/main.js" ]; then
  echo "Found main.js in dist directory"
  node dist/main.js
elif [ -f "dist/src/main.js" ]; then
  echo "Found main.js in dist/src directory"
  node dist/src/main.js
else
  echo "Looking for main.js..."
  find / -name main.js | grep dist
  
  # Default path
  node dist/main.js
fi