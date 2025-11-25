# PDF Sync Script

This script automatically syncs PDF documentation from the SharePoint mapping JSON to generate markdown files for Docusaurus.

## Overview

The script:
1. Fetches the SharePoint mapping JSON from `https://documentation.rossvideo.com/sharepoint_mapping.json`
2. Processes all PDF files in the `Manuals/` folder
3. Generates markdown files with the PDFViewer component
4. Maps SharePoint folder structure to Docusaurus docs structure

## Usage

### Manual Run

```bash
npm run sync-pdfs
```

### Automated Updates

The script runs automatically in two scenarios:

1. **GitHub Actions**: Scheduled daily at 2 AM UTC (configurable in `.github/workflows/sync-pdfs.yml`)
2. **AWS Amplify Build**: Runs before each build to ensure latest PDFs are included

## Folder Mapping

The script maps SharePoint folder names to Docusaurus docs folders:

- `CG and Graphics` → `cg-and-graphics`
- `Enterprise Control Systems` → `enterprise-control-systems`
- `Terminal Equipment` → `terminal-equipment`
- And more... (see `FOLDER_MAPPING` in `sync-pdfs.js`)

Subfolders are automatically converted to kebab-case (e.g., "User Guides" → "user-guides").

## Generated Markdown Format

Each PDF generates a markdown file with:

- Frontmatter with title
- PDFViewer component import and usage
- Document metadata (filename, size, last modified, category)
- External download link

## Troubleshooting

### Script fails to fetch JSON
- Check network connectivity
- Verify the mapping URL is accessible
- Check if the JSON structure has changed

### Files not generated
- Ensure PDFs are in the `Manuals/` folder in SharePoint
- Check folder mapping matches your docs structure
- Verify file permissions for writing to `docs/` directory

### GitHub Actions not running
- Check workflow file syntax
- Verify GitHub Actions are enabled for the repository
- Check workflow permissions in repository settings

## Manual Workflow Trigger

You can manually trigger the GitHub Actions workflow:

1. Go to the "Actions" tab in GitHub
2. Select "Sync PDFs from SharePoint"
3. Click "Run workflow"
4. Select the branch and click "Run workflow"


