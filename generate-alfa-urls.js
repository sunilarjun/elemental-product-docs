// generate-alfa-urls.js

const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Adjust these to match your Antora Playbook and GitHub Action setup
const DOCS_OUTPUT_DIR = 'build/site'; 
const LOCAL_SERVER_PORT = 8080;
const OUTPUT_URLS_FILE = 'alfa-urls.txt';
const BASE_URL = `http://localhost:${LOCAL_SERVER_PORT}`;

// Function to recursively find all HTML files
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Avoid scanning asset folders unnecessarily
      if (!['images', 'css', 'js', '_'].includes(file)) {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

try {
  const htmlFiles = getHtmlFiles(DOCS_OUTPUT_DIR);

  if (htmlFiles.length === 0) {
    console.warn(`No HTML files found in ${DOCS_OUTPUT_DIR}. Creating an empty list.`);
  }

  // Convert local paths to server URLs
  const urls = htmlFiles.map(filePath => {
    // 1. Remove the output directory prefix (e.g., 'public/')
    // 2. Normalize the path separators to slashes for a URL
    const relativePath = filePath.substring(DOCS_OUTPUT_DIR.length); 
    return `${BASE_URL}${relativePath.replace(/\\/g, '/')}`;
  });

  // Write the list of URLs, one per line, to a temporary file
  fs.writeFileSync(OUTPUT_URLS_FILE, urls.join(' '));

  console.log(`Generated list of ${urls.length} URLs in ${OUTPUT_URLS_FILE}`);

} catch (error) {
  console.error('Error generating Alfa URL list:', error.message);
  process.exit(1);
}