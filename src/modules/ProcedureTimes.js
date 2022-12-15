const breaks = [
  30, 60, 90, 120, 150, 180, 210,
  240, 270, 300, 330, 360, 420,
  450, 480, 540, 600, 660, 720
]

const rawTimeFormat = /^((?<hours>\d+):)?(?<minutes>\d+)$/
const procedureTimeFormatMin = /(?<time>\d+)分(?<vector>未満|以上)/

export const procedureTimeFormat = /^\d+0分(以上|未満)( － \d+0分未満)?$/

export default () => ProcedureTimeSelections()

export function ProcedureTimeSelections () {
  const temporaryArray = []
  temporaryArray.push(breaks[0].toString() + '分未満')

  for (let i = 0; i < breaks.length - 1; i++) {
    temporaryArray.push(
      breaks[i].toString() + '分以上 － ' +
      breaks[i + 1].toString() + '分未満'
    )
  }
  temporaryArray.push(breaks.slice(-1).toString() + '分以上')

  return temporaryArray
}

export function encodeProcedureTime (minutes = 0) {
  if (minutes < breaks[0]) return breaks[0] + '分未満'
  for (let i = 0; i < breaks.length - 1; i++) {
    if (minutes >= breaks[i] && minutes < breaks[i + 1]) return breaks[i] + '分以上 － ' + breaks[i + 1] + '分未満'
  }

  return breaks[breaks.length - 1] + '分以上'
}

export function parseProcedureTime (selection = '') {
  // 選択枝フォーマット
  const parsed = selection.match(procedureTimeFormatMin)
  if (parsed) {
    return parsed.groups.vector === '未満'
      ? Number(parsed.groups.time) - 1
      : Number(parsed.groups.time)
  } else {
    // 実時間入力
    return parseRawTime(selection)
  }
}

export function parseRawTime (string = '') {
  const rawTime = string.match(rawTimeFormat)
  if (rawTime) {
    return Number(rawTime.groups.hours || '0') * 60 +
      Number(rawTime.groups.minutes)
  } else {
    return -1
  }
}
