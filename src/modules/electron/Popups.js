// electron用のダイアログ
import { ipcRenderer } from 'electron'

export default class Popups {
  static alert (message) {
    ipcRenderer.sendSync('messagebox',
      {
        type: 'warning',
        buttons: ['OK'],
        message: message
      })
  }

  static information (message) {
    ipcRenderer.sendSync('messagebox',
      {
        type: 'info',
        buttons: ['OK'],
        message: message
      })
  }

  static confirm (message) {
    return ipcRenderer.sendSync('messagebox',
      {
        type: 'none',
        buttons: ['キャンセル', 'OK'],
        cancelId: 0,
        message: message
      }) !== 0
  }

  static confirmYesNo (message) {
    return ipcRenderer.sendSync('messagebox',
      {
        type: 'none',
        buttons: ['はい', 'いいえ'],
        cancelId: 1,
        message: message
      }) !== 0
  }
}
