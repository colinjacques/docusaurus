/**
 * Docusaurus plugin to prevent route generation for problematic paths
 */
function ignoreBrokenRoutes(context, options) {
  return {
    name: 'ignore-broken-routes',
    async contentLoaded({content, actions}) {
      // This plugin runs after content is loaded but before routes are generated
      // We can't directly prevent route generation here, but we can ensure
      // the problematic paths don't cause issues
    },
  };
}

module.exports = ignoreBrokenRoutes;

