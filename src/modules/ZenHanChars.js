export const name = 'ZenHanChars'

export function ZenToHan (str) {
  let stringargument = str.toString()

  stringargument = stringargument
    .replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  return stringargument
}

export function ZenToHanNumbers (str) {
  let stringargument = str.toString()

  stringargument = stringargument
    .replace(/[^0-9０-９]/g, '')
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  return stringargument
}
