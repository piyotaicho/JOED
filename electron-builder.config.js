import { description } from './package.json' assert { type: 'json' }

process.env.VITE_APP_COPYRIGHT = description.indexOf('(C)') !== -1
  ? description.substring(description.indexOf('(C)') + 3).trim()
  : '2020- P4mohnet and JSGOE'

module.exports = {
  electronBuilder: {
    appId: process.env.VITE_APP_ID,
    productName: 'JOED',
    copyright: ['Copyright', '(C)', process.env.VITE_APP_COPYRIGHT].join(' '),
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
