/**
 * Docusaurus plugin to prevent route generation for problematic paths
 * and ensure index.js files exist for module resolution
 * Also removes problematic .js files that cause import issues
 */
const path = require('path');
const fs = require('fs');

function ignoreBrokenRoutes(context, options) {
  return {
    name: 'ignore-broken-routes',
    async contentLoaded({content, actions}) {
      const siteDir = context.siteDir;
      
      // Remove problematic .js files that cause Docusaurus to try importing directories
      const problematicJsFiles = [
        path.join(siteDir, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go.js'),
      ];
      
      for (const filePath of problematicJsFiles) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Removed problematic .js file: ${path.relative(siteDir, filePath)}`);
        }
      }
      
      // Ensure required index.js files exist before route generation
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
        }
      }
    },
  };
}

module.exports = ignoreBrokenRoutes;
