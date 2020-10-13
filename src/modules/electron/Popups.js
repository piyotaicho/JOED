import { dialog } from 'electron'

export default class Popups {
  // electronとwebでの違いを吸収するダイアログのラッパー
  static alert (message) {
    dialog.showMessageBoxSync(null,
      {
        buttons: ['OK'],
        message: message
      })
  }

  static confirm (message) {
    return dialog.showMessageBoxSync(null,
      {
        type: 'question',
        buttons: ['キャンセル', 'OK'],
        cancelId: 0,
        message: message
      }) !== 0
  }

  static async timerwait (duration = 500) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration)
    })
  }
}
