/* eslint-disable no-unused-vars */
const { Renderer } = require('electron')
const path = require('path')

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map',
    target: process.env.VUE_APP_MODE === 'electron' ? 'electron-renderer' : 'web',
    optimization: {
      splitChunks: {
        maxSize: 512000
      }
    },
    resolve: {
      alias: {
        depmodules: path.resolve(__dirname, process.env.VUE_APP_DEPENDENT_MODULE_PATH)
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      appId: process.env.VUP_APP_ID,
      productName: 'JOED',
      copyright: 'Copyright (C) 2020 @piyotaicho, JSGOE',
      // preload: 'src/electron-builder-preload.js',
      nodeIntegration: true, //
      // nodeModulesPath: ['./node_modules'],
      buildResources: 'build/*',
      nsis: {
        oneClick: false,
        perMachine: false,
        installerLanguage: 'ja_JP',
        menuCategory: '日本産科婦人科内視鏡学会',
        license: 'build/license.txt'
      },
      win: {
        icon: 'build/Windows.ico'
      },
      mac: {
        target: 'dmg',
        category: 'public.app-category.medical',
        icon: 'build/macos.icns'
      }
    }
  }
}
