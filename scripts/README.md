# Documentation Sync Scripts

These scripts automatically sync documentation from the SharePoint mapping JSON to generate markdown files for Docusaurus.

## Scripts Overview

### `sync-pages.js` (Recommended)

The comprehensive sync script that:
1. Fetches the SharePoint mapping JSON from `https://documentation.rossvideo.com/sharepoint_mapping.json`
2. Processes **all file types** (PDFs, documents, etc.) in the `Manuals/` folder
3. Generates markdown files with appropriate components (PDFViewer for PDFs, generic links for others)
4. **Removes obsolete files** that are no longer in the JSON mapping
5. Maps SharePoint folder structure to Docusaurus docs structure

### `sync-pdfs.js` (Legacy)

The original script that only syncs PDF files. Use `sync-pages.js` instead for comprehensive syncing.

## Usage

### Manual Run

```bash
# Sync all pages (recommended)
npm run sync-pages

# Sync only PDFs (legacy)
npm run sync-pdfs
```

### Automated Updates

The sync runs automatically in multiple scenarios:

1. **GitHub Actions**: Scheduled daily at 2 AM UTC (see `.github/workflows/daily-sync-and-build.yml`)
   - Fetches latest mapping JSON
   - Syncs all pages
   - Commits and pushes changes if any
   - Builds the site
   
2. **AWS Amplify Build**: Runs `sync-pages` before each build to ensure latest content is included

## Folder Mapping

The script maps SharePoint folder names to Docusaurus docs folders:

- `CG and Graphics` → `cg-and-graphics`
- `Enterprise Control Systems` → `enterprise-control-systems`
- `Terminal Equipment` → `terminal-equipment`
- And more... (see `FOLDER_MAPPING` in `sync-pdfs.js`)

Subfolders are automatically converted to kebab-case (e.g., "User Guides" → "user-guides").

## Generated Markdown Format

### PDF Files

Each PDF generates a markdown file with:
- Frontmatter with title
- PDFViewer component import and usage
- Document metadata (filename, size, last modified, category)
- External download link

### Other File Types

Non-PDF files generate markdown files with:
- Frontmatter with title
- Document metadata (filename, file type, size, last modified, category)
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
2. Select "Daily Sync and Build"
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## File Cleanup

The `sync-pages.js` script automatically removes markdown files that are no longer present in the SharePoint mapping JSON. This ensures your documentation stays in sync with the source. Files that are protected (like `intro.md` and `_category_.json` files) are never removed.



