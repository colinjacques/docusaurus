#!/usr/bin/env node

/**
 * Script to fix broken module imports by creating missing index files
 * or correcting import paths
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

// Paths that are being imported but don't exist
const MISSING_PATHS = [
  'cg-and-graphics/xpression/application-notes/xpression-go',
  'cg-and-graphics/xpression/quick-install---hardware/go',
  'cg-and-graphics/xpression/quick-install---hardware/go2',
];

// Actual paths that exist
const ACTUAL_PATHS = {
  'cg-and-graphics/xpression/application-notes/xpression-go': null, // No such file exists
  'cg-and-graphics/xpression/quick-install---hardware/go': 'cg-and-graphics/xpression/quick-install---hardware/go!',
  'cg-and-graphics/xpression/quick-install---hardware/go2': 'cg-and-graphics/xpression/quick-install---hardware/go2!',
};

function createRedirectFile(missingPath, actualPath) {
  const fullPath = path.join(DOCS_DIR, missingPath);
  const dir = path.dirname(fullPath);
  const filename = path.basename(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create index.md that redirects to the actual path
  const indexFile = path.join(dir, filename + '.md');
  
  if (actualPath) {
    // Calculate relative path
    const relativePath = path.relative(dir, path.join(DOCS_DIR, actualPath));
    const redirectContent = `---
title: Redirect
---

This page has been moved. Please see the [${filename} documentation](${relativePath}/).
`;
    
    fs.writeFileSync(indexFile, redirectContent);
    console.log(`✅ Created redirect: ${indexFile} -> ${actualPath}`);
  } else {
    // Create a placeholder file to prevent build errors
    const placeholderContent = `---
title: ${filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
---

This documentation is being updated. Please check back soon.
`;
    
    fs.writeFileSync(indexFile, placeholderContent);
    console.log(`✅ Created placeholder: ${indexFile}`);
  }
}

function main() {
  console.log('🔧 Fixing broken import paths...\n');
  
  for (const missingPath of MISSING_PATHS) {
    const actualPath = ACTUAL_PATHS[missingPath];
    createRedirectFile(missingPath, actualPath);
  }
  
  console.log('\n✅ Done! Broken import paths have been fixed.');
}

if (require.main === module) {
  main();
}

module.exports = { fixBrokenImports: main };

