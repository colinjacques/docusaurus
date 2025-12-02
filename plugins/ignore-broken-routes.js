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
    async loadContent() {
      // This runs before content is loaded - ensure index.js files exist early
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
      
      // Ensure required index.js files exist BEFORE route generation
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
    },
    configureWebpack(config, isServer) {
      // Configure webpack to resolve @site imports for these directories
      const siteDir = context.siteDir;
      const requiredPaths = [
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go', 'index.js'),
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go2', 'index.js'),
      ];
      
      const existingAlias = config.resolve?.alias || {};
      
      return {
        resolve: {
          ...config.resolve,
          alias: {
            ...existingAlias,
            // Alias directory imports to their index.js files
            // This must match exactly what Docusaurus generates in registry.js
            '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go': requiredPaths[0],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go': requiredPaths[1],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2': requiredPaths[2],
          },
        },
      };
    },
  };
}

module.exports = ignoreBrokenRoutes;
