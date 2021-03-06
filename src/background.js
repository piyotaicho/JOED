// eslint-disable-next-line no-unused-vars
/* global __static */
'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import HHX from 'xxhashjs'

const isDevelopment = process.env.NODE_ENV !== 'production'

const path = require('path')
const fs = require('fs')

const ElectronStore = require('electron-store')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// 重複起動の抑制
const instanceLock = app.requestSingleInstanceLock()
if (!instanceLock) {
  app.quit()
} else {
  if (win) {
    if (win.isMinimized()) {
      win.restore()
    }
    win.focus()
  }
}

// CreateBrowserWindow
function createWindow () {
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
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      spellcheck: false,
      enableWebSQL: false,
      webgl: false,
      devTools: isDevelopment
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      .then(_ => {
        if (!process.env.IS_TEST) win.webContents.openDevTools()
      })
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    // macosでウインドウが閉じるときにメニューは「JOED5について」しか利用出来ない.
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
// app イベントの処理
//
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

// window-all-closed : Windowsではここで終了処理を行う
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  removeLockfile()
})

// アプリケーションの起動
app.on('ready', async () => {
  parseCommandlineoptions()

  app.ConfigStore = new ElectronStore(app.configSetting)
  app.DatabaseInstance = createDatabaseInstance()

  // ウインドウの作成
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// macosではdockから再度ウインドウを開くことが出来る.
if (process.platform === 'darwin') {
  app.on('activate-with-no-open-windows', _ => createWindow())
}

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      console.error('二重起動はできません.')
      app.quit()
    })
  }
}

//
// コマンドラインオプションの処理
//
function parseCommandlineoptions () {
  // --datadir : データの保存ディレクトリの設定
  app.enableLocking = false
  if (app.commandLine.hasSwitch('datadir')) {
    try {
      const datadirarg = app.commandLine.getSwitchValue('datadir')
      if (fs.statSync(datadirarg).isDirectory()) {
        // 指定のフォルダがなければ例外
        app.setPath('documents', datadirarg)
        app.enableLocking = true
      } else {
        // 指定ファイルがディレクトリで無い場合も例外
        throw new Error()
      }
    } catch {
      dialog.showMessageBoxSync({ title: 'JOED5', message: 'データ保存先として指定されたパスが不正です.' })
      app.exit(-1)
    }
  } else {
    // デフォルト path の documents を userData でオーバーライド
    app.setPath('documents', app.getPath('userData'))
  }

  // --config : 設定の保存ファイル/ディレクトリを指定
  app.configSetting = {}
  if (app.commandLine.hasSwitch('config')) {
    const configarg = app.commandLine.getSwitchValue('config')
    const configpath = path.parse(configarg)
    if (configpath.ext[0] === '.') {
      configpath.ext = configpath.ext.substr(1)
    }

    try {
      if (fs.statSync(configpath.dir).isDirectory()) {
        // 指定パスの1つ上の階層が存在する 存在しなければ例外
        if (fs.existsSync(configarg)) {
          // 指定パスが存在する
          if (fs.statSync(configarg).isDirectory()) {
            // 指定パスはディレクトリ
            app.configSetting.cwd = configarg
            // 以下は electron-store のデフォルト
            // configSetting.name = 'config'
            // configSetting.fileExtension = 'json'
          } else {
            // 指定パスはファイル
            app.configSetting.cwd = configpath.dir
            app.configSetting.name = configpath.name
            app.configSetting.fileExtension = configpath.ext
          }
        } else {
          // 指定パス自体は存在しないので新規ファイルとして扱う
          app.configSetting.cwd = configpath.dir
          app.configSetting.name = configpath.name
          app.configSetting.fileExtension = configpath.ext
        }
      }
    } catch {
      dialog.showMessageBoxSync({ title: 'JOED5', message: '設定ファイルに指定されたパスが不正です.' })
      app.exit(-1)
    }
  }

  // drop-database : データベースファイルの削除 (=all でバックアップも削除, =lock で消し忘れたロックファイルのみ削除)
  if (app.commandLine.hasSwitch('drop-database')) {
    const DBfilename = path.join(app.getPath('documents'), 'joed.nedb')
    if (app.commandLine.getSwitchValue('drop-database').toLowerCase() === 'lock') {
      removeLockfile()
    } else {
      try {
        fs.unlinkSync(DBfilename)
      } catch {}
    }

    try {
      if (app.commandLine.getSwitchValue('drop-database').toLowerCase() === 'all') {
        fs.unlinkSync(DBfilename + '.3')
        fs.unlinkSync(DBfilename + '.2')
        fs.unlinkSync(DBfilename + '.1')
      }
    } catch {}

    dialog.showMessageBoxSync({ title: 'JOED5', message: 'ファイルを削除しました.' })
    app.exit()
  }
}

//
// メニューの設定
//
const MenuTemplate = [
  // アプリケーションメニュー
  ...(
    process.platform === 'darwin'
      ? [{
          label: app.getName(),
          submenu: [
            { label: app.getName() + 'について', role: 'about' },
            { type: 'separator' },
            { label: '設定', id: 'setup', enabled: false, accelerator: 'Command+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
            { type: 'separator' },
            { label: 'サービス', role: 'services', submenu: [] },
            { type: 'separator' },
            { label: app.getName() + 'を隠す', accelerator: 'Command+H', role: 'hide' },
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
      { type: 'separator' },
      { label: 'データの読み込み', id: 'list-import', enabled: false, click: (item, focusedWindow) => RendererRoute('import', focusedWindow) },
      { label: 'データの書き出し', id: 'list-export', enabled: false, click: (item, focusedWindow) => RendererRoute('export', focusedWindow) },
      ...(process.platform === 'darwin'
        ? []
        : [
            { type: 'separator' },
            { label: '設定', id: 'setup', enabled: false, accelerator: 'Ctrl+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
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
            { label: app.getName() + 'について', role: 'about' }
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

app.setAboutPanelOptions({
  applicationName: app.getName(),
  applicationVersion: process.env.VUE_APP_VERSION,
  copyright: 'Copyright 2020-2021 @piyotaicho and JSGOE',
  credits: '@piyotaicho https://github.com/piyotaicho/JOED/',
  iconPath: '../public/icon.png'
})

//
// IPCハンドリング
//

// main -> renderer : メニューからrouterの切り替え要求 (App.vueで処理)
function RendererRoute (routename, targetwindow) {
  targetwindow.webContents.send('RendererRoute', { Name: routename })
}

// route毎のメニュー操作
ipcMain.on('menuroute', (event, payload) => {
  const menu = Menu.getApplicationMenu()
  switch (payload) {
    case 'login':
    case 'edit':
    case 'diagnosis':
    case 'procedure':
    case 'AE':
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-import').enabled = false
      menu.getMenuItemById('list-export').enabled = false
      menu.getMenuItemById('setup').enabled = false
      break
    case 'list':
      menu.getMenuItemById('list-new').enabled = true
      menu.getMenuItemById('list-import').enabled = true
      menu.getMenuItemById('list-export').enabled = true
      menu.getMenuItemById('setup').enabled = true
      break
    case 'utility':
    case 'setup':
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-import').enabled = true
      menu.getMenuItemById('list-export').enabled = true
      menu.getMenuItemById('setup').enabled = true
      break
    default:
      menu.getMenuItemById('list-new').enabled = false
      menu.getMenuItemById('list-import').enabled = false
      menu.getMenuItemById('list-export').enabled = false
      menu.getMenuItemById('setup').enabled = false
  }
})

//
// ロックファイル制御
//
function createLockfile () {
  if (app.enableLocking) {
    const fd = fs.openSync(path.join(app.getPath('documents'), 'joed.nedb.lock'), 'wx')
    fs.closeSync(fd)
  }
}

function removeLockfile () {
  if (app.enableLocking) {
    try {
      fs.unlinkSync(path.join(app.getPath('documents'), 'joed.nedb.lock'))
    } catch {}
  }
}

//
// データベースの設定
//
const DB = require('nedb')

// createDatabaseInstance
//
function createDatabaseInstance () {
  // appPath documents はデフォルトでは app.on ready で userData にオーバーライドされている.
  const DBfilename = path.join(app.getPath('documents'), 'joed.nedb')

  // データベースファイルのバックアップを作る(３世代まで)
  // 原則としてバックアップ作成に関わるエラーは全て無視.
  try {
    fs.copyFileSync(DBfilename + '.2', DBfilename + '.3')
  } catch {}

  try {
    fs.copyFileSync(DBfilename + '.1', DBfilename + '.2')
  } catch {}

  try {
    fs.copyFileSync(DBfilename, DBfilename + '.1')
  } catch {}

  try {
    createLockfile()
  } catch (error) {
    dialog.showMessageBoxSync({ title: 'JOED5', message: '他のユーザがデータベースファイルを使用中のため起動を中止します.' })
    app.quit()
  }

  try {
    return new DB({
      filename: DBfilename,
      autoload: true
    })
  } catch (error) {
    // 致命的エラーなのでダイアログを出して終了する
    isDevelopment && console.log(error)
    dialog.showMessageBoxSync(win, {
      title: 'JOED5',
      type: 'error',
      buttons: ['OK'],
      message: 'データベースファイルの操作に失敗しました, アプリケーションを起動できません.\n以下の情報を添えて学会までお問い合わせください.\n\n' + error.message
    })
    app.quit(-1)
    return undefined
  }
}

//
// IPCとデータベースのAPIラッパー
//

// Insert
// @Object.Document : Object
ipcMain.handle('Insert', (_, payload) => {
  return new Promise((resolve, reject) => {
    app.DatabaseInstance
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
    const query = payload.Query ? payload.Query : {}
    const projection = payload.Projection ? payload.Projection : {}
    const sort = payload.Sort ? payload.Sort : {}
    const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0
    const limit = payload.Limit ? Number.parseInt(payload.Limit) : 0

    app.DatabaseInstance
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
    const query = payload.Query ? payload.Query : {}
    const projection = payload.Projection ? payload.Projection : {}
    const sort = payload.Sort ? payload.Sort : {}
    const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0

    app.DatabaseInstance
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
  const HHX64 = HHX.h64(payload.SALT)
  return new Promise((resolve, reject) => {
    app.DatabaseInstance
      .findOne({
        $where: function () {
          delete this._id
          const hash = HHX64.update(JSON.stringify(this)).digest().toString(36)
          return payload.Hash === hash
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
    const query = payload.Query ? payload.Query : {}
    app.DatabaseInstance
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
    const query = payload.Query ? payload.Query : {}
    const update = payload.Update ? payload.Update : {}
    const options = payload.Options ? payload.Options : {}
    app.DatabaseInstance
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
    const query = payload.Query ? payload.Query : {}
    const options = payload.Options ? payload.Options : {}
    app.DatabaseInstance
      .remove(query, options, (error, numrows) => {
        if (error) {
          reject(error)
        } else {
          resolve(numrows)
        }
      })
  })
})

//
// アプリケーション設定 electron-store
//

// LoadConfig
// @Object.Key : String
// @Object.DefaultConfig : Object
ipcMain.handle('LoadConfig', (_, payload) =>
  app.ConfigStore.get(payload.Key, payload.DefaultConfig)
)

// SaveConfig
// @Object.Key : String
// @Object.Config : Object
ipcMain.handle('SaveConfig', (_, payload) =>
  app.ConfigStore.set(payload.Key, payload.Config)
)
