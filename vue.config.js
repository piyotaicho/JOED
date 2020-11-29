/* eslint-disable no-unused-vars */
const { Renderer } = require('electron')
const path = require('path')

process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map',
    target: process.env.VUE_APP_ELECTRON ? 'electron-renderer' : 'web',
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
        )
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      appId: process.env.VUP_APP_ID,
      productName: 'JOED',
      copyright: 'Copyright (C) 2020 Yasuhiro Yamamoto @piyotaicho and 日本産科婦人科内視鏡学会',
      nodeIntegration: true,
      buildResources: 'build/*',
      win: {
        target: 'dir',
        icon: 'build/Windows.ico',
        legalTrademarks: 'Yasuhiro Yamamoto @piyotaicho and 日本産科婦人科内視鏡学会'
      },
      mac: {
        target: 'dmg',
        category: 'public.app-category.medical',
        hardenedRuntime: true,
        icon: 'build/macos.icns',
        // eslint-disable-next-line no-template-curly-in-string
        title: '症例登録システム ${version}'
      },
      nsis: {
        oneClick: false,
        perMachine: true,
        allowToChangeInstallationDirectory: true,
        installerLanguage: 'ja_JP',
        license: 'build/license(sjis).txt',
        installerIcon: 'build/Windows.ico',
        createStartMenuShortcut: true,
        menuCategory: '日本産科婦人科内視鏡学会',
        shortcutName: '症例登録システム '
      }
    }
  }
}
