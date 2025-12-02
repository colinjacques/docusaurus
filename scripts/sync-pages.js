#!/usr/bin/env node

/**
 * Script to sync all documentation pages from SharePoint mapping JSON
 * Fetches the mapping JSON and generates/updates/removes markdown files
 * This script handles all file types, not just PDFs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MAPPING_URL = 'https://documentation.rossvideo.com/sharepoint_mapping.json';
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const MANUALS_PREFIX = 'Manuals/';

// Mapping from SharePoint folder names to docs folder names
const FOLDER_MAPPING = {
  'CG and Graphics': 'cg-and-graphics',
  'Enterprise Control Systems': 'enterprise-control-systems',
  'Terminal Equipment': 'terminal-equipment',
  'Production Switchers': 'production-switchers',
  'Video Servers': 'video-servers',
  'Signal Processing': 'signal-processing',
  'Robotic Camera Systems': 'robotic-camera-systems',
  'Master Control': 'master-control',
  'Media Asset Management': 'media-asset-management',
  'Replay Systems': 'replay-systems',
  'Routers': 'routers',
  'Tally Systems': 'tally-systems',
  'KVM': 'kvm',
  'Live Event Management': 'live-event-management',
  'All In One Production Systems': 'all-in-one-production-systems',
  'Cameras': 'cameras',
  'Third Party Products': 'third-party-products',
  'Virtual Production': 'virtual-production',
  'Robotics': 'robotics',
  'Automated Production Control': 'automated-production-control',
};

// Track all expected file paths
const expectedFiles = new Set();

// Map subfolder names (e.g., "User Guides" -> "user-guides")
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-') // Replace multiple consecutive dashes with single dash
    .toLowerCase();
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  return new Date(dateString).toISOString().split('T')[0];
}

// Generate markdown content for PDF files
function generatePDFMarkdown(fileInfo) {
  const { title, file, filename, size, lastModified, category } = fileInfo;
  const fileSize = formatFileSize(size);
  const modifiedDate = formatDate(lastModified);

  return `---
title: "${title}"
---

import PDFViewer from '@site/src/components/PDFViewer';

# ${title}

<PDFViewer file="${file}" title="${title}" />

---

**Document Information:**
- **Original filename:** \`${filename}\`
- **File size:** ${fileSize}
- **Last modified:** ${modifiedDate}
- **Category:** ${category}

---

**External Link:** [${filename}](${file})
`;
}

// Generate markdown content for non-PDF files
function generateGenericMarkdown(fileInfo) {
  const { title, file, filename, size, lastModified, category, fileType } = fileInfo;
  const fileSize = formatFileSize(size);
  const modifiedDate = formatDate(lastModified);

  return `---
title: "${title}"
---

# ${title}

**Document Information:**
- **Original filename:** \`${filename}\`
- **File type:** ${fileType || 'Unknown'}
- **File size:** ${fileSize}
- **Last modified:** ${modifiedDate}
- **Category:** ${category}

---

**External Link:** [${filename}](${file})
`;
}

// Get file path from folder path
function getFilePath(folderPath, cleanName, fileType = 'md') {
  const parts = folderPath.split('/').filter(Boolean);
  
  // Skip "Manuals" prefix
  if (parts[0] === 'Manuals') {
    parts.shift();
  }
  
  // Map top-level folder
  if (parts.length > 0 && FOLDER_MAPPING[parts[0]]) {
    parts[0] = FOLDER_MAPPING[parts[0]];
  }
  
  // Convert all parts to kebab-case
  const kebabParts = parts.map(part => toKebabCase(part));
  
  // Generate filename
  const filename = toKebabCase(cleanName) + '.md';
  
  return path.join(DOCS_DIR, ...kebabParts, filename);
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Process a file item
function processFile(item, folderPath, category) {
  if (item.type !== 'file') {
    return;
  }

  // Use folderPath from item if available, otherwise use folderPath parameter
  let fileFolderPath = item.folderPath || folderPath;
  
  // Only process files in Manuals folder
  if (!fileFolderPath.startsWith(MANUALS_PREFIX) && !fileFolderPath.startsWith('Manuals/')) {
    return;
  }

  // Normalize folder path
  if (!fileFolderPath.startsWith(MANUALS_PREFIX)) {
    fileFolderPath = fileFolderPath.replace(/^Manuals\//, MANUALS_PREFIX);
  }

  const relativePath = fileFolderPath.replace(MANUALS_PREFIX, '');
  const filePath = getFilePath(relativePath, item.cleanName);
  const dirPath = path.dirname(filePath);

  ensureDir(dirPath);

  // Track this file as expected
  expectedFiles.add(filePath);

  // Use folderPath for category if available
  const categoryPath = item.folderPath || category || relativePath;

  const fileInfo = {
    title: item.cleanName,
    file: item.externalUrl,
    filename: item.name,
    size: item.size || 0,
    lastModified: item.lastModified,
    category: categoryPath,
    fileType: item.fileType,
  };

  // Generate markdown based on file type
  let markdown;
  if (item.fileType === 'pdf') {
    markdown = generatePDFMarkdown(fileInfo);
  } else {
    markdown = generateGenericMarkdown(fileInfo);
  }

  fs.writeFileSync(filePath, markdown, 'utf8');
  console.log(`✓ Generated: ${path.relative(process.cwd(), filePath)}`);
}

// Recursively process items
function processItems(items, folderPath = '', category = '') {
  if (!items || !Array.isArray(items)) {
    return;
  }

  for (const item of items) {
    if (item.type === 'file') {
      processFile(item, folderPath, category);
    } else if (item.type === 'folder') {
      const newFolderPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      const newCategory = category ? `${category}/${item.cleanName}` : item.cleanName;
      processItems(item.items, newFolderPath, newCategory);
    }
  }
}

// Get all markdown files in docs directory (excluding _category_.json and intro.md)
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-doc directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md') && file !== 'intro.md' && !file.startsWith('_')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Paths that should always have index.js files to satisfy Docusaurus imports
// Only single-dash paths (triple-dash paths should not exist after toKebabCase fix)
const REQUIRED_INDEX_PATHS = [
  'docs/cg-and-graphics/xpression/application-notes/xpression-go/index.js',
  'docs/cg-and-graphics/xpression/quick-install-hardware/go/index.js',
  'docs/cg-and-graphics/xpression/quick-install-hardware/go2/index.js',
];

// Ensure required index.js files exist
function ensureRequiredIndexFiles() {
  for (const filePath of REQUIRED_INDEX_PATHS) {
    const fullPath = path.join(__dirname, '..', filePath);
    const dirPath = path.dirname(fullPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create index.js if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, '// Empty module to satisfy Docusaurus directory imports\nexport default null;\n', 'utf8');
      console.log(`✓ Created required index.js: ${filePath}`);
    }
  }
}

// Remove files that are no longer in the JSON
function removeObsoleteFiles() {
  const allMarkdownFiles = getAllMarkdownFiles(DOCS_DIR);
  const filesToRemove = allMarkdownFiles.filter(file => !expectedFiles.has(file));

  // Also remove problematic .js files that cause Docusaurus import issues
  const problematicJsFiles = [
    path.join(DOCS_DIR, 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go.js'),
  ];
  
  for (const jsFile of problematicJsFiles) {
    if (fs.existsSync(jsFile)) {
      try {
        fs.unlinkSync(jsFile);
        console.log(`  ✗ Removed problematic .js file: ${path.relative(process.cwd(), jsFile)}`);
      } catch (error) {
        console.error(`  ⚠ Failed to remove ${jsFile}: ${error.message}`);
      }
    }
  }

  if (filesToRemove.length === 0) {
    console.log('\n✓ No obsolete files to remove');
    return;
  }

  console.log(`\n🗑️  Removing ${filesToRemove.length} obsolete file(s):`);
  for (const file of filesToRemove) {
    try {
      fs.unlinkSync(file);
      console.log(`  ✗ Removed: ${path.relative(process.cwd(), file)}`);
    } catch (error) {
      console.error(`  ⚠ Failed to remove ${file}: ${error.message}`);
    }
  }
}

// Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Failed to fetch JSON: ${err.message}`));
    });
  });
}

// Main function
async function main() {
  console.log('🔄 Syncing pages from SharePoint mapping...\n');

  try {
    // Fetch mapping JSON
    console.log(`📥 Fetching mapping from ${MAPPING_URL}...`);
    const mapping = await fetchJSON(MAPPING_URL);
    console.log('✓ Mapping fetched successfully\n');

    // Clear expected files set
    expectedFiles.clear();

    // Process drives
    if (mapping.drives && Array.isArray(mapping.drives)) {
      for (const drive of mapping.drives) {
        if (drive.items && Array.isArray(drive.items)) {
          for (const rootItem of drive.items) {
            if (rootItem.name === 'rossvideo.com' && rootItem.items) {
              // Find Manuals folder
              const manualsFolder = rootItem.items.find(
                item => item.type === 'folder' && item.name === 'Manuals'
              );

              if (manualsFolder && manualsFolder.items) {
                console.log('📚 Processing Manuals folder...\n');
                processItems(manualsFolder.items, MANUALS_PREFIX);
              }
            }
          }
        }
      }
    }

    // Remove obsolete files
    console.log('\n🧹 Cleaning up obsolete files...');
    removeObsoleteFiles();

    // Ensure required index.js files exist for Docusaurus module resolution
    console.log('\n📦 Ensuring required index.js files exist...');
    ensureRequiredIndexFiles();

    console.log('\n✅ Page sync completed successfully!');
    console.log(`   Total pages synced: ${expectedFiles.size}`);
  } catch (error) {
    console.error('\n❌ Error syncing pages:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };


