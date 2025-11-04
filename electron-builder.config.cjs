const copyright = '2020-2025 P4mohnet and 日本産科婦人科内視鏡学会'

module.exports = async () => (
  {
    appId: 'jp.jsgoe.joed5',
    productName: 'JOED',
    copyright: ['Copyright', '(C)', copyright].join(' '),
    files: [
      'src/background.js',
      'src/preload.js',
      'dist/**',
      'dist/**/assets/**',
      '!dist/**/*-unpacked'
    ],
    afterPack: './unlinkUnusedFiles.cjs',
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
      artifactName: '${productName}-${version}-installer.${ext}',
      script: 'build/installer.nsi',
      warningsAsErrors: false,
      oneClick: false,
      runAfterFinish: false
    }
  }
)
