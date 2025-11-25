#!/usr/bin/env node

/**
 * Script to sync PDF documentation from SharePoint mapping JSON
 * Fetches the mapping JSON and generates/updates markdown files
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

// Map subfolder names (e.g., "User Guides" -> "user-guides")
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
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

// Generate markdown content
function generateMarkdown(pdfInfo) {
  const { title, file, filename, size, lastModified, category } = pdfInfo;
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

// Get file path from folder path
function getFilePath(folderPath, cleanName) {
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
  if (item.type !== 'file' || item.fileType !== 'pdf') {
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

  // Use folderPath for category if available
  const categoryPath = item.folderPath || category || relativePath;

  const pdfInfo = {
    title: item.cleanName,
    file: item.externalUrl,
    filename: item.name,
    size: item.size || 0,
    lastModified: item.lastModified,
    category: categoryPath,
  };

  const markdown = generateMarkdown(pdfInfo);
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
  console.log('🔄 Syncing PDFs from SharePoint mapping...\n');

  try {
    // Fetch mapping JSON
    console.log(`📥 Fetching mapping from ${MAPPING_URL}...`);
    const mapping = await fetchJSON(MAPPING_URL);
    console.log('✓ Mapping fetched successfully\n');

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

    console.log('\n✅ PDF sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Error syncing PDFs:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

