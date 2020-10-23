/* global __static */
'use strict'

// eslint-disable-next-line no-unused-vars
import { app, protocol, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')

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

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 960,
    minWidth: 960,
    maxWidth: 960,
    height: 700,
    center: true,
    title: 'JOED',
    icon: path.join(__static, 'icon.png'),
    backgroundColor: '#dddddd',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
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
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })

  win.on('app-command', (_event, command) => {
    console.log('catch app-command ', command)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
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

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

//
// アプリケーションメニュー
//
function RendererRoute (routename, targetwindow) {
  targetwindow.webContents.send('RendererRoute', { Name: routename })
}

const MenuTemplate = [
  {
    label: 'ファイル',
    submenu: [
      { label: '新規症例の登録', accelerator: 'CmdORCtrl+N', click: (item, focusedWindow) => RendererRoute('new', focusedWindow) },
      { type: 'separator' },
      { label: 'データの読み込み', click: (item, focusedWindow) => RendererRoute('import', focusedWindow) },
      { label: 'データの書き出し', click: (item, focusedWindow) => RendererRoute('export', focusedWindow) },
      ...(process.platform === 'darwin'
        ? [{ type: 'separator' }]
        : [
          { type: 'separator' },
          { label: '設定', accelerator: 'CmdORCtrl+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
          { type: 'separator' }
        ]),
      {
        label: process.platform === 'darwin' ? 'ウインドウを閉じる' : '終了',
        accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Alt+F4',
        role: process.platform === 'darwin' ? 'close' : 'quit'
      }
    ]
  },
  {
    label: 'ヘルプ',
    submenu: [
      { label: app.getName() + 'について', role: 'about' }
    ]
  }
]

if (process.platform === 'darwin') {
  MenuTemplate.unshift({
    submenu: [
      // アプリケーションメニュー
      { label: app.getName() + 'について', role: 'about' },
      { type: 'separator' },
      { label: '設定', accelerator: 'Command+,', click: (item, focusedWindow) => RendererRoute('settings', focusedWindow) },
      { type: 'separator' },
      { label: 'サービス', role: 'services', submenu: [] },
      { type: 'separator' },
      { label: app.getName() + 'を隠す', accelerator: 'Command+H', role: 'hide' },
      { label: '他を隠す', accelerator: 'Command+Alt+H', role: 'hideothers' },
      { label: '全てを表示', role: 'unhide' },
      { type: 'separator' },
      { label: '終了', accelerator: 'Command+Q', role: 'quit' }
    ]
  })
}

Menu.setApplicationMenu(Menu.buildFromTemplate(MenuTemplate))

app.setAboutPanelOptions({
  applicationName: app.getName(),
  applicationVersion: process.env.VUE_APP_VERSION,
  copyright: 'Copyright 2020 JSGOE',
  credits: '@piyotaicho https://github.com/piyotaicho/JOED/',
  iconPath: '../public/icon.png'
})

//
// IPCハンドリング
//

// UI
ipcMain.on('messagebox', (event, payload) => {
  event.returnValue = dialog.showMessageBoxSync(win, Object.assign({ noLink: true }, payload))
})

// nedb データベースAPIラッパー
const DB = require('nedb')

function createDatabaseInstance () {
  const fs = require('fs')

  const DBfilename = path.join(app.getPath('userData'), 'joed.nedb')

  // データベースファイルのバックアップを作る(３世代まで)
  // 原則としてバックアップ作成に関わるエラーは全て無視.
  try {
    fs.copyFileSync(DBfilename + '.2', DBfilename + '.3')
  } catch (error) {
    isDevelopment && console.log(error)
  }
  try {
    fs.copyFileSync(DBfilename + '.1', DBfilename + '.2')
  } catch (error) {
    isDevelopment && console.log(error)
  }
  try {
    fs.copyFileSync(DBfilename, DBfilename + '.1')
  } catch (error) {
    isDevelopment && console.log(error)
  }

  isDevelopment && console.log('Handle database file ' + DBfilename)

  try {
    return new DB({
      filename: DBfilename,
      autoload: true
    })
  } catch (error) {
    // 致命的エラーなのでダイアログを出して終了する
    isDevelopment && console.log(error)
    dialog.showMessageBoxSync(win, {
      type: 'error',
      buttons: ['OK'],
      message: 'データベースファイルの操作に失敗しました, アプリケーションを起動できません.\nシステム管理者もしくは学会までお問い合わせください.'
    })
    app.quit()
    return undefined
  }
}

app.DatabaseInstance = createDatabaseInstance()

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

// データベースというかローカルjsonとしての Config

const ConfigStore = require('electron-store')

app.configstore = new ConfigStore()

ipcMain.handle('LoadConfig', (_, payload) =>
  app.configstore.get(payload.Key, payload.DefaultConfig)
)

ipcMain.handle('SaveConfig', (_, payload) =>
  app.configstore.set(payload.Key, payload.Config)
)
