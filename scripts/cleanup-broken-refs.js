#!/usr/bin/env node

/**
 * Script to clean up broken references and missing files in markdown documentation
 * Removes files that reference non-existent modules or have broken imports
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

// Patterns that indicate broken module references
const BROKEN_PATTERNS = [
  /@site\/docs\/[^'"]*xpression-go[^!-'"]/g,
  /@site\/docs\/[^'"]*quick-install[^'"]*\/go[^!'"]/g,
];

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }

}

// Check if a directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

// Resolve @site paths to actual file paths
function resolveSitePath(sitePath) {
  // Remove @site prefix
  const relativePath = sitePath.replace(/^@site\//, '');
  const fullPath = path.join(__dirname, '..', relativePath);
  
  // Try with .md extension
  if (fileExists(fullPath + '.md')) {
    return fullPath + '.md';
  }
  
  // Try as directory with index.md
  if (dirExists(fullPath)) {
    const indexPath = path.join(fullPath, 'index.md');
    if (fileExists(indexPath)) {
      return indexPath;
    }
  }
  
  // Try without extension (already has it)
  if (fileExists(fullPath)) {
    return fullPath;
  }
  
  return null;
}

// Check if a markdown file has broken references
function hasBrokenReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for broken import patterns
    for (const pattern of BROKEN_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Extract the path
          const sitePath = match.replace(/['"]/g, '');
          if (!resolveSitePath(sitePath)) {
            return true;
          }
        }
      }
    }
    
    // Check for import statements with @site paths
    const importMatches = content.match(/import\s+.*from\s+['"](@site\/docs\/[^'"]+)['"]/g);
    if (importMatches) {
      for (const importMatch of importMatches) {
        const sitePath = importMatch.match(/['"](@site\/docs\/[^'"]+)['"]/)[1];
        if (!resolveSitePath(sitePath)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (err) {
    console.error(`Error checking ${filePath}:`, err.message);
    return false;
  }
}

// Recursively find all markdown files
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Main cleanup function
function cleanup() {
  console.log('🧹 Cleaning up broken references...\n');
  
  const markdownFiles = findMarkdownFiles(DOCS_DIR);
  let removedCount = 0;
  let checkedCount = 0;
  
  for (const filePath of markdownFiles) {
    checkedCount++;
    
    if (hasBrokenReferences(filePath)) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`❌ Removing file with broken references: ${relativePath}`);
      
      try {
        fs.unlinkSync(filePath);
        removedCount++;
      } catch (err) {
        console.error(`  ⚠️  Failed to remove: ${err.message}`);
      }
    }
  }
  
  console.log(`\n✅ Cleanup complete:`);
  console.log(`   - Checked: ${checkedCount} files`);
  console.log(`   - Removed: ${removedCount} files with broken references`);
  
  return removedCount;
}

// Run if called directly
if (require.main === module) {
  const removed = cleanup();
  process.exit(removed > 0 ? 0 : 0); // Always exit 0, just log what was done
}

module.exports = { cleanup, hasBrokenReferences };

