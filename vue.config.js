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
        maxSize: 5000000
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
      productName: 'JOED',
      copyright: 'Copyright (C) 2020 @piyotaicho, JSGOE',
      // preload: 'src/electron-builder-preload.js',
      nodeIntegration: true // ,
      // nodeModulesPath: ['./node_modules']
    }
  }
}
