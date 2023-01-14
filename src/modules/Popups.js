// elementダイアログ
import { MessageBox } from 'element-ui'

// messageに改行があったらelementを返す
function messageVNode (message, caller) {
  if (caller && message.includes('\n')) {
    // const elem = MessageBox.$createElement
    const lines = message.split('\n')
    const elements = []
    for (const line of lines) {
      if (line === '') {
        continue
      }
      elements.push(line)
      elements.push(caller.$createElement('br', null))
    }
    elements.pop(1)

    return caller.$createElement('p', null, elements)
  } else {
    return message
  }
}

export function alert (message, caller = null) {
  return MessageBox.alert(messageVNode(message, caller), {
    iconClass: 'el-icon-message-solid',
    showClose: false
  })
}

export function error (message, caller = null) {
  return MessageBox.alert(messageVNode(message, caller), {
    iconClass: 'el-icon-error',
    showClose: false
  })
}

export function information (message, caller = null) {
  return MessageBox.alert(messageVNode(message, caller), {
    title: '通知',
    iconClass: 'el-icon-info',
    closeOnClickModal: false,
    showClose: false
  })
}

export async function confirm (message, caller = null) {
  return await MessageBox.confirm(messageVNode(message, caller), {
    title: '確認',
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: true
  }).then(_ => true, _ => false)
}

export async function confirmYesNo (message) {
  return await MessageBox.confirm(messageVNode(message), {
    title: '確認',
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: false,
    cancelButtonText: 'いいえ',
    confirmButtonText: 'はい'
  }).then(_ => true, _ => false)
}

export async function confirmAnyOk (message, anyText = 'cancel') {
  return await MessageBox.confirm(messageVNode(message), {
    iconClass: 'el-icon-message-solid',
    showClose: false,
    closeOnPressEscape: false,
    cancelButtonText: anyText,
    confirmButtonText: 'OK'
  }).then(_ => true, _ => false)
}

export async function prompt (message, rule = undefined) {
  const options = {
    title: '入力',
    confirmButtonText: 'OK',
    cancelButtonText: 'キャンセル'
  }

  if (rule !== undefined) {
    options.inputPattern = new RegExp(rule)
    options.inputErrorMessage = '入力規則に合致しません.'
  }
  return await MessageBox.prompt(message, options)
    .then(value => value.value, _ => null)
}
