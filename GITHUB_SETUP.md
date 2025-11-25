# GitHub + AWS Amplify Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `docusaurus-site`)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Your Code to GitHub

Run these commands in your terminal (from the project directory):

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## Step 3: Connect GitHub to AWS Amplify

1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify
2. Click **"New app"** → **"Host web app"**
3. Select **"GitHub"** as your source
4. Authorize AWS Amplify to access your GitHub account (if not already done)
5. Select your repository and branch (usually `main`)
6. AWS Amplify will automatically detect the `amplify.yml` file
7. Review the build settings (should be auto-detected):
   - Build command: `npm run build`
   - Output directory: `build`
8. Click **"Save and deploy"**

## Step 4: Configure App Settings (if needed)

If you're connecting to an existing app (ID: d3sa559c55yywa):

1. Go to your app in AWS Amplify Console
2. Click **"App settings"** → **"General"**
3. Click **"Edit"** next to "Connected branches"
4. Click **"Connect branch"**
5. Select **"GitHub"** and authorize if needed
6. Select your repository and branch
7. AWS Amplify will use your existing `amplify.yml` configuration

## What's Already Configured

✅ `amplify.yml` - Build configuration with redirects for client-side routing
✅ `docusaurus.config.ts` - Configured with your Amplify URL
✅ `static/_redirects` - Backup redirect file for SPA routing
✅ All source files and dependencies

## After Deployment

Your site will be available at:
- **Staging**: https://staging.d3sa559c55yywa.amplifyapp.com
- **Production**: (configured in Amplify Console)

Every push to your GitHub repository will automatically trigger a new deployment!

