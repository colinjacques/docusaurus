/**
 * Docusaurus plugin to prevent route generation for problematic paths
 * and ensure index.js files exist for module resolution
 */
const path = require('path');
const fs = require('fs');

function ignoreBrokenRoutes(context, options) {
  return {
    name: 'ignore-broken-routes',
    async contentLoaded({content, actions}) {
      // Ensure required index.js files exist before route generation
      const siteDir = context.siteDir;
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
