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
          
          // Merge with existing config - spread operator ensures proper merging
          const existingAlias = config.resolve?.alias || {};
          const existingPlugins = config.plugins || [];
          
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
            },
            plugins: [
              ...existingPlugins,
              // Use NormalModuleReplacementPlugin to catch any variation of these paths
              // This runs before the alias resolution, so it can intercept the imports
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
