import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Ross Documentation',
  tagline: 'PDF Documentation Portal - POC for Markdown Migration',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://staging.d3sa559c55yywa.amplifyapp.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          // Exclude empty placeholder directories that cause import errors
          // Exclude both the directory itself and all contents
          // Only exclude single-dash paths (triple-dash should not exist after toKebabCase fix)
          exclude: [
            '**/cg-and-graphics/xpression/application-notes/xpression-go/**',
            '**/cg-and-graphics/xpression/application-notes/xpression-go',
            '**/cg-and-graphics/xpression/quick-install-hardware/go/**',
            '**/cg-and-graphics/xpression/quick-install-hardware/go',
            '**/cg-and-graphics/xpression/quick-install-hardware/go2/**',
            '**/cg-and-graphics/xpression/quick-install-hardware/go2',
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],


  stylesheets: [
    'https://use.typekit.net/uav1rla.css',
    'https://cdn.jsdelivr.net/npm/meilisearch-docsearch@latest/dist/index.css',
  ],
  scripts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/meilisearch-docsearch@latest/dist/index.global.js',
      async: true,
    },
  ],

  plugins: [
    path.join(__dirname, 'plugins', 'ignore-broken-routes.js'),
    function (context, options) {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer) {
          const webpack = require('webpack');
          
          // Get the actual paths to the index.js files we created
          // Only single-dash paths (triple-dash should not exist after toKebabCase fix)
          const xpressionGoPath = path.resolve(__dirname, 'docs', 'cg-and-graphics', 'xpression', 'application-notes', 'xpression-go', 'index.js');
          const goPath = path.resolve(__dirname, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go', 'index.js');
          const go2Path = path.resolve(__dirname, 'docs', 'cg-and-graphics', 'xpression', 'quick-install-hardware', 'go2', 'index.js');
          
          // Create a webpack plugin that intercepts module requests and fixes broken imports
          // This runs during compilation, before module resolution
          class FixBrokenImportsPlugin {
            apply(compiler) {
              compiler.hooks.normalModuleFactory.tap('FixBrokenImportsPlugin', (nmf) => {
                // Hook into the beforeResolve phase to fix broken imports
                nmf.hooks.beforeResolve.tap('FixBrokenImportsPlugin', (data) => {
                  if (!data || !data.request) return;
                  
                  const request = data.request;
                  // Fix broken directory imports by replacing with actual file paths
                  if (request === '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go') {
                    data.request = xpressionGoPath;
                    return; // Return early to use the fixed path
                  } else if (request === '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go') {
                    data.request = goPath;
                    return;
                  } else if (request === '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2') {
                    data.request = go2Path;
                    return;
                  }
                });
                
                // Also hook into the resolve phase as a fallback
                nmf.hooks.resolve.tapAsync('FixBrokenImportsPlugin', (data, callback) => {
                  if (!data || !data.request) return callback();
                  
                  const request = data.request;
                  if (request === '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go') {
                    data.request = xpressionGoPath;
                  } else if (request === '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go') {
                    data.request = goPath;
                  } else if (request === '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2') {
                    data.request = go2Path;
                  }
                  
                  callback();
                });
              });
            }
          }
          
          // Merge with existing config
          const existingAlias = config.resolve?.alias || {};
          const existingPlugins = config.plugins || [];
          const existingResolvePlugins = config.resolve?.plugins || [];
          
          return {
            module: {
              rules: [
                {
                  test: /\.pdf$/,
                  type: 'asset/resource',
                },
              ],
            },
            resolve: {
              ...config.resolve,
              alias: {
                ...existingAlias,
                // Alias broken import paths to actual index.js files
                // These aliases will be merged with Docusaurus's existing @site alias configuration
                // Only single-dash paths (triple-dash should not exist after toKebabCase fix)
                '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go': xpressionGoPath,
                '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go': goPath,
                '@site/docs/cg-and-graphics/xpression/quick-install-hardware/go2': go2Path,
              },
              // Ensure directory imports resolve to index.js
              mainFiles: ['index', '...'],
              plugins: [
                ...existingResolvePlugins,
              ],
            },
            plugins: [
              ...existingPlugins,
              // Use a custom plugin to fix broken imports during compilation
              new FixBrokenImportsPlugin(),
              // Use NormalModuleReplacementPlugin as a fallback
              new webpack.NormalModuleReplacementPlugin(
                /^@site\/docs\/cg-and-graphics\/xpression\/application-notes\/xpression-go(\/.*)?$/,
                xpressionGoPath
              ),
              new webpack.NormalModuleReplacementPlugin(
                /^@site\/docs\/cg-and-graphics\/xpression\/quick-install-hardware\/go(\/.*)?$/,
                goPath
              ),
              new webpack.NormalModuleReplacementPlugin(
                /^@site\/docs\/cg-and-graphics\/xpression\/quick-install-hardware\/go2(\/.*)?$/,
                go2Path
              ),
            ],
          };
        },
      };
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Ross Video',
        src: 'img/ross-video-logo.svg',
        height: 56,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Get Started',
              to: '/docs/intro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ross Documentation Portal. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
