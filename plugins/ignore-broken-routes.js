/**
 * Docusaurus plugin to fix module resolution for problematic directory imports
 * The root cause: Docusaurus generates imports like @site/docs/.../xpression-go
 * but these directories need to resolve to their index.js files
 * 
 * This plugin:
 * 1. Ensures index.js files exist in problematic directories
 * 2. Fixes the generated registry.js file to append /index.js to broken imports
 * 3. Configures webpack to resolve these paths correctly
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
    async allContentLoaded({content, actions}) {
      // This runs after all content is loaded but before webpack compilation
      // Fix the registry.js file to append /index.js to broken directory imports
      const siteDir = context.siteDir;
      const registryPath = path.join(siteDir, '.docusaurus', 'registry.js');
      
      // Wait a bit for registry.js to be generated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (fs.existsSync(registryPath)) {
        let content = fs.readFileSync(registryPath, 'utf8');
        let modified = false;
        
        // Fix broken directory imports by appending /index.js
        // Match patterns like: '@site/docs/.../xpression-go'
        const brokenPatterns = [
          [/'@site\/docs\/cg-and-graphics\/xpression\/application-notes\/xpression-go'/g, "'@site/docs/cg-and-graphics/xpression/application-notes/xpression-go/index.js'"],
          [/'@site\/docs\/cg-and-graphics\/xpression\/quick-install-hardware\/go'/g, "'@site/docs/cg-and-graphics/xpression/quick-install-hardware/go/index.js'"],
          [/'@site\/docs\/cg-and-graphics\/xpression\/quick-install-hardware\/go2'/g, "'@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2/index.js'"],
        ];
        
        for (const [pattern, replacement] of brokenPatterns) {
          if (content.match(pattern)) {
            content = content.replace(pattern, replacement);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(registryPath, content, 'utf8');
          console.log('[ignore-broken-routes] Fixed broken directory imports in registry.js');
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
            // Alias directory imports to their index.js files (both with and without /index.js)
            '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go': requiredPaths[0],
            '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go/index.js': requiredPaths[0],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go': requiredPaths[1],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go/index.js': requiredPaths[1],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2': requiredPaths[2],
            '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2/index.js': requiredPaths[2],
          },
        },
      };
    },
  };
}

module.exports = ignoreBrokenRoutes;
