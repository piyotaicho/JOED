const copyright = '2020-2025 P4mohnet and 日本産科婦人科内視鏡学会'

module.exports = async () => (
  {
    appId: 'jp.jsgoe.joed5',
    productName: 'JOED5',
    copyright: ['Copyright', '(C)', copyright].join(' '),
    directories: {
      output: 'dist-electron'
    },
    files: [
      // 'dist-electron/*.js',
      // 'dist-electron/*.cjs',
      // 'dist-electron/icon.png',
      // 'dist-electron/AppIcon32.ico',
      'dist/**',
      'dist/**/assets/**',
      // '!dist/**/*-unpacked',
      // '!dist-electron/**/*-unpacked',
      // '!dist-electron/*.dmg',
      // '!dist-electron/*.exe',
      // '!dist-electron/*.yaml',
      // '!dist-electron/*.yml',
      // '!dist-electron/*.blockmap',
    ],
    extraMetadata: {
      main: 'dist/background.js'
    },
    afterPack: './unlinkUnusedFiles.cjs',
    mac: {
      target: [
        {
          target: 'dmg',
          arch: ['universal']
        }
      ],
      category: 'public.app-category.medical',
      entitlements: 'build/entitlements.mac.plist',
      entitlementsInherit: 'build/entitlements.mac.inherit.plist',
      notarize: false,
      hardenedRuntime: true,     
      mergeASARs: true,
      icon: 'icon.icns',
      singleArchFiles: '*'
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
