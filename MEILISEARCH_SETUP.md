# Meilisearch Setup Guide

This guide explains how to configure Meilisearch API key for the Docusaurus site.

## Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Meilisearch API key:
   ```
   MEILISEARCH_API_KEY=your_api_key_here
   MEILISEARCH_HOST=https://search.rossvideo.app
   MEILISEARCH_INDEX_UID=docs
   ```

3. The `.env` file is already in `.gitignore`, so it won't be committed.

## AWS Amplify Configuration

To set the API key in AWS Amplify:

1. Go to your AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Add the following environment variables:
   - `MEILISEARCH_API_KEY` = `27024c8e7b24757d95f85b9803044818911d64928f68fcaf2d01bb95e48d5317`
   - `MEILISEARCH_HOST` = `https://search.rossvideo.app` (optional, this is the default)
   - `MEILISEARCH_INDEX_UID` = `docs` (optional, this is the default)

5. Save and redeploy your app

## GitHub Actions (if needed)

If you need to set the API key in GitHub Actions:

1. Go to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Add a new secret:
   - Name: `MEILISEARCH_API_KEY`
   - Value: `27024c8e7b24757d95f85b9803044818911d64928f68fcaf2d01bb95e48d5317`

4. Update `.github/workflows/daily-sync-and-build.yml` to use the secret:
   ```yaml
   - name: Build Docusaurus
     env:
       MEILISEARCH_API_KEY: ${{ secrets.MEILISEARCH_API_KEY }}
     run: npm run build
   ```

## Verification

After setting up the API key:

1. Build the site: `npm run build`
2. Start the dev server: `npm run start`
3. Open the search bar in the navbar
4. Try searching - it should connect to your Meilisearch instance

## Security Notes

- **Never commit** the `.env` file or API keys to git
- The API key is used client-side, so use a **search-only** API key (not the master key)
- The API key should have minimal permissions (only search access)

