// elementダイアログ
import { MessageBox } from 'element-ui'

export default class Popups {
  static alert (message) {
    MessageBox.alert(message, {
      iconClass: 'el-icon-message-solid',
      showClose: false
    })
  }

  static error (message) {
    MessageBox.alert(message, {
      iconClass: 'el-icon-error',
      showClose: false
    })
  }

  static information (message) {
    MessageBox.alert(message, {
      title: '通知',
      iconClass: 'el-icon-info',
      closeOnClickModal: false,
      showClose: false
    })
  }

  static async confirm (message) {
    try {
      await MessageBox.confirm(message, {
        title: '確認',
        iconClass: 'el-icon-question',
        showClose: false
      })
      return true
    } catch (_) {
      return false
    }
  }

  static async confirmYesNo (message) {
    try {
      await MessageBox.confirm(message, {
        title: '確認',
        iconClass: 'el-icon-question',
        showClose: false,
        cancelButtonText: 'いいえ',
        confirmButtonText: 'はい'
      })
      return true
    } catch (_) {
      return false
    }
  }
}
