/* eslint-disable @typescript-eslint/no-require-imports */



// node18 workaroung taken from https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/1885#issuecomment-1316735840
const crypto = require('crypto')

/**
 * md4 algorithm is not available anymore in NodeJS 17+ (because of lib SSL 3).
 * In that case, silently replace md4 by md5 algorithm.
 */
try {
  crypto.createHash('md4')
} catch {
  console.warn('Crypto "md4" is not supported anymore by this Node version')
  const origCreateHash = crypto.createHash
  crypto.createHash = (alg, opts) => {
    return origCreateHash(alg === 'md4' ? 'md5' : alg, opts)
  }
}

// ---
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_COPYRIGHT = (description =>
  description.includes('(C)')
    ? description.substring(description.indexOf('(C)') + 3).trim()
    : '2020- P4mohnet and JSGOE'
)(require('./package.json').description)

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'production'
      ? false
      : 'source-map',
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
        // nedbとconfigの実装を対象環境により切り替える大切なalias
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
        afterPack: './unlinkUnusedFiles.js',
        mac: {
          target: 'dmg',
          category: 'public.app-category.medical',
          hardenedRuntime: true,
          icon: 'icon.icns'
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
