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
    function (context, options) {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer) {
          const webpack = require('webpack');
          
          // List of broken import paths to ignore
          const brokenPaths = [
            '@site/docs/cg-and-graphics/xpression/application-notes/xpression-go',
            '@site/docs/cg-and-graphics/xpression/quick-install---hardware/go',
            '@site/docs/cg-and-graphics/xpression/quick-install---hardware/go2',
          ];
          
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
              alias: brokenPaths.reduce((acc, brokenPath) => {
                // Create alias to an empty module
                acc[brokenPath] = path.join(__dirname, 'src', 'empty-module.js');
                return acc;
              }, {}),
            },
            plugins: [
              // Provide empty modules for broken imports
              new webpack.NormalModuleReplacementPlugin(
                /^@site\/docs\/cg-and-graphics\/xpression\/(application-notes\/xpression-go|quick-install---hardware\/(go|go2))$/,
                path.join(__dirname, 'src', 'empty-module.js')
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
