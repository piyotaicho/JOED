/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-unused-vars */
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_COPYRIGHT = (description =>
  description.indexOf('(C)') !== -1
    ? description.slice(description.indexOf('(C)') + 3).trim()
    : '2020-2022 P4mohnet and JSGOE'
)(require('./package.json').description)

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map',
    target: 'web',
    output: {
      clean: {
        keep: /legacy-assets.*\.json$/
      }
    },
    performance: {
      maxAssetSize: 1024000,
      maxEntrypointSize: 1024000
    },
    optimization: {
      splitChunks: {
        maxSize: 512000
      },
      // minimize: true when NODE_ENV === 'production'
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              ecma: '2016',
              comments: false
            },
            output: {
              comments: false
            }
          },
          extractComments: 'all'
        })
      ]
    },
    resolve: {
      alias: {
        depmodules: path.resolve(__dirname,
          process.env.VUE_APP_ELECTRON
            ? 'src/modules/electron/'
            : 'src/modules/serve/'
        ),
        path: process.env.VUE_APP_ELECTRON
          ? false
          : 'path-browserify'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      appId: process.env.VUE_APP_ID,
      productName: 'JOED',
      copyright: ['Copyright', '(C)', process.env.VUE_APP_COPYRIGHT].join(' '),
      nodeIntegration: false,
      contextIsolation: true,
      preload: 'src/preload.js',
      customFileProtocol: './',
      chainWebpackMainProcess: (config) => config.output.filename(
        (file) => file.chunk.name === 'index' ? 'background.js' : '[name].js'
      ),
      builderOptions: {
        mac: {
          target: 'dmg',
          category: 'public.app-category.medical',
          hardenedRuntime: true,
          icon: 'macos.icns'
        },
        dmg: {
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
          artifactName: '${productName}-${version}-${arch}-installer.${ext}',
          include: 'installer.nsh',
          script: 'installer.nsi'
        }
      }
    }
  }
}
