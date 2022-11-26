/* eslint-disable no-unused-vars */
const path = require('path')

process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map',
    target: 'web',
    optimization: {
      splitChunks: {
        maxSize: 512000
      }
    },
    resolve: {
      alias: {
        depmodules: path.resolve(__dirname,
          process.env.VUE_APP_ELECTRON
            ? 'src/modules/electron/'
            : 'src/modules/serve/'
        ),
        path: false
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      appId: process.env.VUE_APP_ID,
      productName: 'JOED',
      copyright: 'Copyright (C) 2020-2022 P4mohnet and 日本産科婦人科内視鏡学会',
      nodeIntegration: false,
      contextIsolation: true,
      // preload: 'src/preload.js',
      // buildResources: 'build/',
      builderOptions: {
        mac: {
          target: 'dmg',
          category: 'public.app-category.medical',
          hardenedRuntime: true,
          icon: 'macos.icns'
        },
        dmg: {
          // eslint-disable-next-line no-template-curly-in-string
          title: '症例登録システム ${version}'
        },
        win: {
          target: 'nsis',
          icon: 'Windows.ico',
          legalTrademarks: 'P4mohnet and 日本産科婦人科内視鏡学会'
        },
        nsis: {
          installerIcon: 'Windows.ico',
          installerLanguages: ['ja-JP'],
          // eslint-disable-next-line no-template-curly-in-string
          artifactName: '${productName}-${version}-${arch}-installer.${ext}',
          include: 'installer.nsh',
          script: 'installer.nsi'
        }
      }
    }
  }
}
