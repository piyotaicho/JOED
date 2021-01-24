// elementダイアログ
import { MessageBox } from 'element-ui'

export function alert (message) {
  MessageBox.alert(message, {
    iconClass: 'el-icon-message-solid',
    showClose: false
  })
}

export function error (message) {
  MessageBox.alert(message, {
    iconClass: 'el-icon-error',
    showClose: false
  })
}

export function information (message) {
  MessageBox.alert(message, {
    title: '通知',
    iconClass: 'el-icon-info',
    closeOnClickModal: false,
    showClose: false
  })
}

export async function confirm (message) {
  return await MessageBox.confirm(message, {
    title: '確認',
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: true
  }).then(_ => true, _ => false)
}

export async function confirmYesNo (message) {
  return await MessageBox.confirm(message, {
    title: '確認',
    iconClass: 'el-icon-question',
    showClose: false,
    closeOnPressEscape: false,
    cancelButtonText: 'いいえ',
    confirmButtonText: 'はい'
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
