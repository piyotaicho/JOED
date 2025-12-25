
'use strict'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron'

import ElectronStore from 'electron-store'
import DB from '@seald-io/nedb'
import xxhash from 'xxhashjs'

// Viteのdefineで置き換えられる定数
const version = __APP_VERSION__
const description = __APP_DESCRIPTION__

// 重複起動の抑制
const instanceLock = app.requestSingleInstanceLock()
if (!instanceLock) {
  app.quit()
}

// バックエンドの変数
const backupGeneration = 5

// VITEで置換される
const isDevelopment = import.meta.env?.MODE === 'development' || false

let win = null
let session = null
const appConfig = {
  electronStore: undefined,
  storeConfig: {
    // cwd ?:,
    // name ?:
    // fileExtension ?:
  },
  databaseInstance: undefined,
  enableLocking: false
}
let enableAdvancedSettings = undefined

// 初期設定
// デフォルト path の documents を userData でオーバーライド
app.setPath('documents', app.getPath('userData'))

// コマンドラインオプションの解析と設定の反映
parseCommandLineOptions()

// 初期設定をファイルから取得
appConfig.electronStore = new ElectronStore(appConfig.storeConfig)

// 起動
registerAppEvents()
registerIPChandlers()
registerMenu()

async function createWindow() {
  win = new BrowserWindow({
    width: 960,
    minWidth: 960,
    maxWidth: 960,
    height: 700,
    fullscreen: false,
    center: true,
    title: app.getName(),
    icon: './build/Windows.ico',
    backgroundColor: '#dddddd',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      enableWebSQL: false,
      webgl: false,
      devTools: isDevelopment,
      preload: path.join(app.getAppPath(), 'dist', 'preload.cjs')
    }
  })

  // 開発環境での適切なindex.htmlのロード方法を決定
  if (isDevelopment && process.env?.VITE_DEV_SERVER_URL) {
    // electron-viteが設定する開発サーバーURL
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    console.info('[DEV] Loading from dev server:', devServerUrl)
    await win.loadURL(devServerUrl)
  } else {
    // Production build - load packaged files
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    await win.loadFile(indexPath)
  }

  session = win.webContents.session

  win.on('closed', () => {
    // macosでウインドウが閉じた後には、アプリケーションメニューを「JOED5について」しか利用出来ないようにする.
    // windowsではウインドウが閉じる = 終了となる
    if (process.platform === 'darwin') {
      const menu = Menu.getApplicationMenu()
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-import').enabled = false
      menu.getMenuItemById('list-export').enabled = false
      menu.getMenuItemById('setup').enabled = false
    }
    win = null
  })
}

//
// イベントの登録
//
function registerAppEvents() {
  // ready: reateWindow
  app.on('ready', async () => {
    if (instanceLock) {
      // コマンドラインディレクティブの実行
      parseCommandLineDirectives()

      // データベースインスタンスの作成
      appConfig.databaseInstance = createDatabaseInstance()

      // ウインドウの作成
      await createWindow()
    } else {
      app.quit()
    }
  })

  // activate : macos ドックアイコンをクリック
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

  // window-all-closed : Windowsではウインドウを閉じる = 終了.
  app.on('window-all-closed', () => {
    if (process.platform === 'win32') {
      // 処理を統一するため終了イベントを発行
      app.quit()
    }
  })

  // quit : macosでの 終了 イベント.
  app.on('quit', async () => {
    removeLockfile()
    if (session) {
      await session.clearCache()
    }
  })

  // second-instance : 重複起動チェック(app.requestSingleInstanceLock)からのイベント インスタンスを前面に出す.
  app.on('second-instance', () => {
    if (win !== null) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })

  // activate-with-no-open-windows: macosではdockに残ったアイコンからウインドウを開く.
  if (process.platform === 'darwin') {
    app.on('activate-with-no-open-windows', () => createWindow())
  }

  // 強制終了(windows: graceful-exit, macos: SIGTERM)への対応.
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => app.quit())
  }
}

//
// コマンドラインオプションの処理
//
function parseCommandLineOptions() {
  // --datadir : データの保存ディレクトリの設定 setPath(documents)の指定
  if (app.commandLine.hasSwitch('datadir')) {
    const datadirarg = app.commandLine.getSwitchValue('datadir')
    try {
      if (!path.isAbsolute(datadirarg)) {
        throw new Error()
      }
      if (fs.statSync(datadirarg).isDirectory()) {
        // 指定のフォルダがなければ例外
        app.setPath('documents', datadirarg)
        appConfig.enableLocking = true
      } else {
        // 指定ファイルがディレクトリで無い場合も例外
        throw new Error()
      }
    } catch {
      dialog.showErrorBox('JOED5', `データ保存先として指定されたパス(${datadirarg})が不正です.`)
      app.exit(-1)
    }
  }

  // --config : 設定の保存ファイル/ディレクトリを指定
  if (app.commandLine.hasSwitch('config')) {
    const configarg = app.commandLine.getSwitchValue('config')
    const configpath = path.parse(configarg)
    if (configpath.ext[0] === '.') {
      configpath.ext = configpath.ext.substring(1)
    }

    try {
      if (fs.statSync(configpath.dir).isDirectory()) {
        // 指定パスの1つ上の階層が存在する 存在しなければ例外
        if (fs.existsSync(configarg)) {
          // 指定パスが存在する
          if (fs.statSync(configarg).isDirectory()) {
            // 指定パスはディレクトリ ファイル名はデフォルト値
            appConfig.storeConfig.cwd = configarg
          } else {
            // 指定パスはファイル
            appConfig.storeConfig.cwd = configpath.dir
            appConfig.storeConfig.name = configpath.name
            appConfig.storeConfig.fileExtension = configpath.ext
          }
        } else {
          // 指定パス自体は存在しないので新規ファイルとして扱う
          appConfig.storeConfig.cwd = configpath.dir
          appConfig.storeConfig.name = configpath.name
          appConfig.storeConfig.fileExtension = configpath.ext
        }
      }
    } catch {
      dialog.showErrorBox('JOED5', '設定ファイルに指定されたパスが不正です.')
      app.exit(-1)
    }
  }

  // enable/disable-advanced-settings : 高度な設定の利用可否を設定する (これはconfigで保存される)
  if (app.commandLine.hasSwitch('disable-advanced-settings') ||
      app.commandLine.hasSwitch('enable-advanced-settings')) {
    enableAdvancedSettings = app.commandLine.hasSwitch('disable-advanced-settings') ? false : true
  }

  // refresh : ワークディレクトリをリフレッシュする
  if (app.commandLine.hasSwitch('refresh')) {
    const libdir = app.getPath('userData')
    const chromiumDataItems = [
      'Cache', 'Code Cache', 'DawnCache', 'GPUCache',
      'blob_storage', 'Local Storage', 'Network', 'Session Storage',
      'Dictionaries', 'extensions',
      'Local state', 'Preferences'
    ]

    try {
      if (fs.existsSync(libdir)) {
        for (const entry of chromiumDataItems) {
          const removeTarget = path.join(libdir, entry)
          if (fs.existsSync(removeTarget)) {
            fs.rmSync(removeTarget, { recursive: true })
          }
        }
      }
      app.exit(0)
    } catch {
      dialog.showErrorBox('JOED5', '作業領域のリフレッシュ中にエラーが発生しました.\n作業が不十分な可能性があります.')
      app.exit(-1)
    }
  }
}

function parseCommandLineDirectives() {
  // drop-database : データベースファイルの削除 (=all でバックアップも削除, =lock で消し忘れたロックファイルのみ削除)
  if (app.commandLine.hasSwitch('drop-database')) {
    const DBfilename = path.join(app.getPath('documents'), 'joed.nedb')
    if (app.commandLine.getSwitchValue('drop-database').toLowerCase() === 'lock') {
      removeLockfile()
    } else {
      try {
        fs.unlinkSync(DBfilename)
      } catch { }
    }

    try {
      if (app.commandLine.getSwitchValue('drop-database').toLowerCase() === 'all') {
        for (let i = 1; i <= backupGeneration; i++) {
          fs.unlinkSync(DBfilename + `.${i}`)
        }
      }
    } catch { }

    dialog.showMessageBoxSync({ title: 'JOED5', message: 'ファイルを削除しました.' })
    app.exit(0)
  }

  // unlock : 共有により影響を受けたロックファイルを削除する
  if (app.commandLine.hasSwitch('unlock')) {
    removeLockfile()
    dialog.showMessageBoxSync({ title: 'JOED5', message: 'ロックを解除しました.' })
    app.exit(0)
  }
}

//
// メニューの設定
//
function registerMenu() {
  const MenuTemplate = [
    // アプリケーションメニュー
    ...(
      process.platform === 'darwin'
        ? [{
          label: 'JOED5',
          submenu: [
            { label: 'JOED5について', role: 'about' },
            { type: 'separator' },
            { label: '設定', id: 'setup', enabled: false, accelerator: 'Command+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
            { type: 'separator' },
            { label: 'サービス', role: 'services', submenu: [] },
            { type: 'separator' },
            { label: 'JOED5を隠す', accelerator: 'Command+H', role: 'hide' },
            { label: '他を隠す', accelerator: 'Command+Alt+H', role: 'hideothers' },
            { label: '全てを表示', role: 'unhide' },
            { type: 'separator' },
            { label: '終了', accelerator: 'Command+Q', role: 'quit' }
          ]
        }]
        : []
    ),
    // 通常のメニュー
    {
      label: 'ファイル',
      submenu: [
        { label: '新規症例の登録', id: 'list-new', enabled: false, accelerator: 'CmdORCtrl+N', click: (item, focusedWindow) => RendererRoute('new', focusedWindow) },
        { label: '症例の削除', id: 'list-delete', enabled: false, accelerator: 'CmdORCtrl+X', click: (item, focusedWindow) => RendererRoute('list.delete', focusedWindow) },
        { type: 'separator' },
        { label: 'データの読み込み', id: 'list-import', enabled: false, click: (item, focusedWindow) => RendererRoute('import', focusedWindow) },
        { label: 'データの書き出し', id: 'list-export', enabled: false, click: (item, focusedWindow) => RendererRoute('export', focusedWindow) },
        ...(process.platform === 'darwin'
          ? [
            { type: 'separator' },
            { label: 'リスト表示の設定', id: 'list-settings', enabled: false, click: (item, focusedWindow) => RendererRoute('list.drawer', focusedWindow) },
          ]
          : [
            { type: 'separator' },
            { label: '設定', id: 'setup', enabled: false, accelerator: 'Ctrl+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
            { label: 'リスト表示の設定', id: 'list-settings', enabled: false, click: (item, focusedWindow) => RendererRoute('list.drawer', focusedWindow) },
            { label: '終了', accelerator: 'Alt+F4', role: 'quit' }
          ])
      ]
    },
    // macosでは編集メニューがないとコピーアンドペーストができない
    ...(
      process.platform === 'darwin'
        ? [
          {
            label: '編集',
            submenu: [
              { label: '取り消す', role: 'undo', accelerator: 'Command+Z' },
              { label: 'やり直す', role: 'redo', accelerator: 'Command+Shift+Z' },
              { type: 'separator' },
              { label: 'カット', role: 'cut', accelerator: 'Command+X' },
              { label: 'コピー', role: 'copy', accelerator: 'Command+C' },
              { label: 'ペースト', role: 'paste', accelerator: 'Command+V' },
              { label: 'すべてを選択', role: 'selectALL', accelerator: 'Command+A' }
            ]
          }
        ]
        : []
    ),
    ...(
      process.platform === 'win32'
        ? [{
          label: 'ヘルプ',
          submenu: [
            { label: 'JOED5について', role: 'about' }
          ]
        }]
        : []
    ),
    ...(
      isDevelopment
        ? [{
          label: '開発支援',
          submenu: [
            {
              label: 'リロード',
              accelerator: '',
              click: (item, focusedWindow) => { focusedWindow.webContents.onbeforeunload = null; focusedWindow.reload() }
            },
            {
              label: '開発者ツール',
              accelerator: (process.platform === 'darwin') ? 'Alt+Command+I' : 'Ctrl+Shift+I',
              click: (item, focusedWindow) => focusedWindow.webContents.toggleDevTools()
            }
          ]
        }]
        : []
    )
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(MenuTemplate))

  // メニューと言えばメニューなのでAboutメニューのダイアログ

  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: version,
    copyright: description.includes('(C)')
      ? description.substring(description.indexOf('(C)') + 3).trim()
      : '2020- P4mohnet and JSGOE',
    credits: '@piyotaicho https://github.com/piyotaicho/JOED/',
    iconPath: '../public/icon.png'
  })
}

//
// IPCハンドリング
//

// main -> renderer : メニューからrouterの切り替え要求 (App.vueで処理)
function RendererRoute(routename, targetwindow) {
  targetwindow.webContents.send('update-router', routename)
}

// router毎のメニュー操作
function switchMenu(payload) {
  const menu = Menu.getApplicationMenu()
  switch (payload) {
    case 'login':
    case 'edit':
    case 'diagnosis':
    case 'procedure':
    case 'AE':
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-delete').enabled = false
      menu.getMenuItemById('list-import').enabled = false
      menu.getMenuItemById('list-export').enabled = false
      menu.getMenuItemById('setup').enabled = false
      menu.getMenuItemById('list-settings').enabled = false
      break
    case 'list':
      menu.getMenuItemById('list-new').enabled = true
      menu.getMenuItemById('list-delete').enabled = true
      menu.getMenuItemById('list-import').enabled = true
      menu.getMenuItemById('list-export').enabled = true
      menu.getMenuItemById('setup').enabled = true
      menu.getMenuItemById('list-settings').enabled = true
      break
    case 'utility':
    case 'setup':
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-delete').enabled = false
      menu.getMenuItemById('list-import').enabled = true
      menu.getMenuItemById('list-export').enabled = true
      menu.getMenuItemById('setup').enabled = true
      menu.getMenuItemById('list-settings').enabled = false
      break
    default:
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-delete').enabled = false
      menu.getMenuItemById('list-import').enabled = false
      menu.getMenuItemById('list-export').enabled = false
      menu.getMenuItemById('setup').enabled = false
      menu.getMenuItemById('list-settings').enabled = false
  }
}

//
// データベースの設定
//

// データベースロックファイル制御
//
function createLockfile() {
  if (appConfig.enableLocking) {
    const fd = fs.openSync(path.join(app.getPath('documents'), 'joed.nedb.lock'), 'wx')
    fs.closeSync(fd)
  }
}

function removeLockfile() {
  if (appConfig.enableLocking) {
    try {
      fs.unlinkSync(path.join(app.getPath('documents'), 'joed.nedb.lock'))
    } catch { }
  }
}

// データベースインスタンスの作成
//
function createDatabaseInstance() {
  // appPath documents はデフォルトで userData にオーバーライドされている.
  const DBfilename = path.join(app.getPath('documents'), 'joed.nedb')

  // ロックの確認
  try {
    createLockfile()
  } catch {
    dialog.showMessageBoxSync({ title: 'JOED5', type: 'info', message: '他のユーザがデータベースファイルを使用中のため起動を中止します.' })
    app.exit(-1)
  }

  // データベースファイルのバックアップを作る
  // 原則としてバックアップ作成に関わるエラーは全て無視する.
  for (let i = (backupGeneration - 1); i > 0; i--) {
    try {
      fs.copyFileSync(DBfilename + `.${i}`, DBfilename + `.${i + 1}`)
    } catch { }
  }
  try {
    fs.copyFileSync(DBfilename, DBfilename + '.1')
  } catch { }

  // データベースの作成
  try {
    return new DB({
      filename: DBfilename,
      autoload: true
    })
  } catch (error) {
    // データベースファイルが作成できないのは致命的エラーなのでダイアログを出して終了する
    if (isDevelopment) {
      console.warn('[DEV] Unable to create database file: ' + error?.message)
    }
    dialog.showMessageBoxSync({
      title: 'JOED5',
      type: 'error',
      buttons: ['OK'],
      message: 'データベースファイルの操作に失敗しました, アプリケーションを起動できません.\n以下の情報を添えて学会までお問い合わせください.\n\n' + error.message
    })
    removeLockfile()
    app.exit(-1)
    return undefined
  }
}

/**
 * クエリ中の $regex を RexExpオブジェクトでの呼び出しに変換する
 * @param {*} obj
 */
function unescapeRegexInObject(obj) {
  // $regex: string の指定があるかチェック なければそのまま返す
  if (!JSON.stringify(obj).includes('"$regex":"/')) {
    return obj
  }

  if (obj === null && typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(item => unescapeRegexInObject(item))
  }
  if (typeof obj === 'object') {
    const newobj = {}
    for (const key in obj) {
      if (key === '$regex' && typeof obj[key] === 'string') {
        // 文字列からRegExpオブジェクトに変換
        const regexBody = obj[key].substring(1, obj[key].lastIndexOf('/'))
        const regexFlags = obj[key].substring(obj[key].lastIndexOf('/') + 1)
        newobj[key] = new RegExp(regexBody, regexFlags)
      } else {
        newobj[key] = unescapeRegexInObject(obj[key])
      }
    }
    return newobj
  }
  return obj
}
//
// IPCとデータベースのAPIラッパー
//
function registerIPChandlers() {
  // Insert
  // @Object.Document : Object
  ipcMain.handle('Insert', (_, payload) => {
    return new Promise((resolve, reject) => {
      appConfig.databaseInstance
        .insert(payload.Document, (error, newdocument) => {
          if (error) {
            reject(error)
          } else {
            resolve(newdocument)
          }
        })
    })
  })

  // Find
  // @Object.Query : Object
  // @Object.Projection : Object
  // @Object.Sort : Object
  // @Object.Skip : String, Number
  // @Object.Limit : String, Number
  ipcMain.handle('Find', (_, payload) => {
    return new Promise((resolve, reject) => {
      const query = payload.Query ? unescapeRegexInObject(payload.Query) : {}
      const projection = payload.Projection ? payload.Projection : {}
      const sort = payload.Sort ? payload.Sort : {}
      const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0
      const limit = payload.Limit ? Number.parseInt(payload.Limit) : 0

      appConfig.databaseInstance
        .find(query)
        .projection(projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec((error, founddocuments) => {
          if (error) {
            reject(error)
          } else {
            resolve(founddocuments)
          }
        })
    })
  })

  // FindOne
  // @Object.Query : Object
  // @Object.Projection : Object
  // @Object.Sort : Object
  // @Object.Skip : String, Number
  ipcMain.handle('FindOne', (_, payload) => {
    return new Promise((resolve, reject) => {
      const query = payload.Query ? unescapeRegexInObject(payload.Query) : {}
      const projection = payload.Projection ? payload.Projection : {}
      const sort = payload.Sort ? payload.Sort : {}
      const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0

      appConfig.databaseInstance
        .findOne(query)
        .projection(projection)
        .sort(sort)
        .skip(skip)
        .exec((error, founddocument) => {
          if (error) {
            reject(error)
          } else {
            resolve(founddocument)
          }
        })
    })
  })

  // FindOneByHash
  // @Object.Hash : String
  // @Object.SALT : Integer
  ipcMain.handle('FineOneByHash', (_, payload) => {
    const Encoder = new TextEncoder()
    return new Promise((resolve, reject) => {
      appConfig.databaseInstance
        .findOne({
          $where: function () {
            if (this.PatientId && this.DateOfProcedure) {
              // 2021より実装変更:
              // レコードのハッシュはユニークキー(PatientId, DateOfProcedure)から生成
              const recordKeys = {
                PatientId: this.PatientId,
                DateOfProcedure: this.DateOfProcedure
              }
              // 2022よりUint8Arrayと64bitのシードを与える
              const hash = (this.DateOfProcedure.substring(0, 4) >= '2022')
                ? xxhash.h64(
                  Encoder.encode(JSON.stringify(recordKeys)).buffer,
                  payload.SALT.toString()
                ).toString(36)
                : xxhash.h64(JSON.stringify(recordKeys), payload.SALT).toString(36)
              return payload.Hash === hash
            } else {
              return false
            }
          }
        })
        .projection({ DocumentId: 1 })
        .exec((error, founddocument) => {
          if (error) {
            reject(error)
          } else {
            resolve(founddocument !== null ? founddocument.DocumentId : undefined)
          }
        })
    })
  })

  // Count
  // @Object.Query : Object
  ipcMain.handle('Count', (_, payload) => {
    return new Promise((resolve, reject) => {
      const query = payload.Query ? unescapeRegexInObject(payload.Query) : {}
      appConfig.databaseInstance
        .count(query, (error, count) => {
          if (error) {
            reject(error)
          } else {
            resolve(count)
          }
        })
    })
  })

  // Update
  // @Object.Query : Object
  // @Object.Update : Object
  // @Object.Options : Object
  ipcMain.handle('Update', (_, payload) => {
    return new Promise((resolve, reject) => {
      const query = payload.Query ? unescapeRegexInObject(payload.Query) : {}
      const update = payload.Update ? payload.Update : {}
      const options = payload.Options ? payload.Options : {}
      appConfig.databaseInstance
        .update(query, update, options, (error, numrows) => {
          if (error) {
            reject(error)
          } else {
            resolve(numrows)
          }
        })
    })
  })

  // Remove
  // @Object.Query : Object
  // @Object.Options : Object
  ipcMain.handle('Remove', (_, payload) => {
    return new Promise((resolve, reject) => {
      const query = payload.Query ? unescapeRegexInObject(payload.Query) : {}
      const options = payload.Options ? payload.Options : {}
      appConfig.databaseInstance
        .remove(query, options, (error, numrows) => {
          if (error) {
            reject(error)
          } else {
            resolve(numrows)
          }
        })
    })
  })

  // Drop
  // @Boolean.RemoveBackupFiles : Boolean
  ipcMain.handle('DropDatabase', async (_, removeBackupFiles) => {
    // データベースを全削除する
    await appConfig.databaseInstance.dropDatabaseAsync()
    // バックアップファイルも削除する
    if (removeBackupFiles) {
      const DBfilename = path.join(app.getPath('documents'), 'joed.nedb')

      for (let i = 1; i <= backupGeneration; i++) {
        try {
          fs.unlinkSync(DBfilename + `.${i}`)
        } catch { }
      }
    }
  })

  //
  // アプリケーション設定 electron-store
  //

  // LoadConfig
  // @Object.Key : String
  // @Object.DefaultConfig : Object
  ipcMain.handle('LoadConfig', (_, payload) => {
    const config = appConfig.electronStore.get(payload.Key, payload.DefaultConfig)

    // Configを取得する場合、高度な設定の利用可否がコマンドラインオプションで与えられていた場合それを反映
    if (payload.Key === 'Config' && enableAdvancedSettings !== undefined) {
      if (config?.Settings === undefined) {
        config.Settings = {}
      }
      config.Settings.EnableAdvancedSettings = enableAdvancedSettings
    }
    return config
  })

  // SaveConfig
  // @Object.Key : String
  // @Object.Config : Object
  ipcMain.handle('SaveConfig', (_, payload) =>
    appConfig.electronStore.set(payload.Key, payload.Config)
  )

  // GetSystemInfo
  // @no params
  ipcMain.handle('GetSystemInfo', () => {
    const ostype = os.type()
    const osversion = os.release()
    const osarch = os.arch()

    return `${ostype} ${osversion} (${osarch})`
  })

  // Routerからのメニュー制御
  ipcMain.on('SwitchMenu', (_, payload) => switchMenu(payload))

  // Renderが指定する外部リンクをシステムで開く
  ipcMain.on('OpenURL', (_, target) => shell.openExternal(target))

  // 再起動
  ipcMain.on('RelaunchApp', () => {
    app.relaunch()
    app.exit(0)
  })
}
