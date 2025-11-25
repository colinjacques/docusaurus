#!/bin/bash

# Script to create a zip file for AWS Amplify deployment
# This excludes node_modules and build folder (Amplify will handle these)

ZIP_NAME="docusaurus-amplify-deploy.zip"
TEMP_DIR="amplify-deploy-temp"

# Clean up any existing temp directory or zip
rm -rf "$TEMP_DIR" "$ZIP_NAME"

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Copy necessary files and directories
echo "Copying files for deployment..."

# Copy source files
cp -r src "$TEMP_DIR/"
cp -r docs "$TEMP_DIR/"
cp -r blog "$TEMP_DIR/"
cp -r static "$TEMP_DIR/"

# Copy configuration files
cp docusaurus.config.ts "$TEMP_DIR/"
cp sidebars.ts "$TEMP_DIR/"
cp tsconfig.json "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp amplify.yml "$TEMP_DIR/"

# Create the zip file
echo "Creating zip file: $ZIP_NAME"
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✅ Zip file created: $ZIP_NAME"
echo "📦 Ready to upload to AWS Amplify Console"
echo ""
echo "To deploy:"
echo "1. Go to AWS Amplify Console"
echo "2. Select your app (d3sa559c55yywa)"
echo "3. Click 'Deploy without Git provider' or 'Deploy' > 'Deploy without Git'"
echo "4. Upload the $ZIP_NAME file"

