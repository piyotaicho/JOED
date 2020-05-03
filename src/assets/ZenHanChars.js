export const name = 'ZenHanChars'

export function ZenToHan (str) {
  let stringargument = str.toString()

  stringargument = stringargument
    .replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  return stringargument
}
