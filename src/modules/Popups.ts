// elementダイアログ
import { ElMessageBox as MessageBox } from 'element-plus'

// messageに改行があったらelementを返す
function escapeMessage (message) {
  const matchRegexp = /['"&<> \n]/g
  const escapePatterns = {
    '\'': '&#39;',
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    ' ': '&nbsp;',
    '\n': '<BR>'
  }
  if (matchRegexp.test(message)) {
    return {
      text: message.replace(matchRegexp, (matchedChar) => escapePatterns[matchedChar]),
      dangerouslyUseHTMLString: true
    }
  } else {
    return {
      text: message,
      dangerouslyUseHTMLString: false
    }
  }
}

export function alert (message, title = undefined) {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return MessageBox.alert(text, {
    title: title,
    iconClass: 'el-icon-message-solid',
    showClose: false,
    dangerouslyUseHTMLString
  })
}

export function error (message, title = undefined) {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return MessageBox.alert(text, {
    title: title,
    iconClass: 'el-icon-error',
    showClose: false,
    dangerouslyUseHTMLString
  })
}

export function information (message, title = '通知') {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return MessageBox.alert(text, {
    title: title,
    iconClass: 'el-icon-info',
    closeOnClickModal: false,
    showClose: false,
    lockScroll: false,
    dangerouslyUseHTMLString
  })
}

export async function confirm (message, title = '確認') {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return await MessageBox.confirm(text, {
    title: title,
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: true,
    dangerouslyUseHTMLString
  }).then(() => true, () => false)
}

export async function confirmYesNo (message, title = '確認') {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return await MessageBox.confirm(text, {
    title: title,
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: false,
    cancelButtonText: 'いいえ',
    confirmButtonText: 'はい',
    dangerouslyUseHTMLString
  }).then(() => true, () => false)
}

export async function confirmAnyOk (message, anyText = 'cancel') {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  return await MessageBox.confirm(text, {
    iconClass: 'el-icon-message-solid',
    showClose: false,
    closeOnPressEscape: false,
    cancelButtonText: anyText,
    confirmButtonText: 'OK',
    dangerouslyUseHTMLString
  }).then(() => true, () => false)
}

export async function prompt (message, rule = undefined) {
  const { text, dangerouslyUseHTMLString } = escapeMessage(message)
  const options = {
    title: '入力',
    confirmButtonText: 'OK',
    cancelButtonText: 'キャンセル',
    dangerouslyUseHTMLString
  }

  if (rule !== undefined) {
    options.inputPattern = new RegExp(rule)
    options.inputErrorMessage = '入力規則に合致しません.'
  }

  return await MessageBox.prompt(text, options)
    .then(value => value.value, () => null)
}
