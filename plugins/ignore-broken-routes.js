/**
 * Docusaurus plugin to prevent route generation for problematic paths
 * and ensure index.js files exist for module resolution
 * Also removes problematic .js files that cause import issues
 * This plugin runs early to configure module resolution before routes are generated
 */
const path = require('path');
const fs = require('fs');

function ignoreBrokenRoutes(context, options) {
  return {
    name: 'ignore-broken-routes',
    configureWebpack(config, isServer, utils) {
      const siteDir = context.siteDir;
      
      // Remove problematic .js files that cause Docusaurus to try importing directories
      const problematicJsFiles = [
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go.js'),
      ];
      
      for (const filePath of problematicJsFiles) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[ignore-broken-routes] Removed problematic .js file: ${path.relative(siteDir, filePath)}`);
        }
      }
      
      // Ensure required index.js files exist
      const requiredPaths = [
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go2', 'index.js'),
      ];

      for (const filePath of requiredPaths) {
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '// Empty module to satisfy Docusaurus directory imports\nexport default null;\n', 'utf8');
          console.log(`[ignore-broken-routes] Created required index.js: ${path.relative(siteDir, filePath)}`);
        }
      }
      
      // Configure webpack to resolve @site imports for these directories
      const webpack = require('webpack');
      const existingAlias = config.resolve?.alias || {};
      
      return {
        resolve: {
          ...config.resolve,
          alias: {
            ...existingAlias,
            // Alias directory imports to their index.js files
            '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go': requiredPaths[0],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go': requiredPaths[1],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2': requiredPaths[2],
          },
        },
      };
    },
    async contentLoaded({content, actions}) {
      // This runs after content is loaded - ensure files still exist
      const siteDir = context.siteDir;
      const requiredPaths = [
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go2', 'index.js'),
      ];

      for (const filePath of requiredPaths) {
        if (!fs.existsSync(filePath)) {
          const dirPath = path.dirname(filePath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          fs.writeFileSync(filePath, '// Empty module to satisfy Docusaurus directory imports\nexport default null;\n', 'utf8');
        }
      }
    },
  };
}

module.exports = ignoreBrokenRoutes;
