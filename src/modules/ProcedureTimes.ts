const breaks: number[] = [
  30, 60, 90, 120, 150, 180, 210,
  240, 270, 300, 330, 360, 420,
  450, 480, 540, 600, 660, 720
]

const rawTimeFormat: RegExp = /^((?<hours>\d+):)?(?<minutes>\d+)$/
const procedureTimeFormatMin: RegExp = /(?<time>\d+)分(?<vector>未満|以上)/

export const procedureTimeFormat = /^\d+0分(以上|未満)( － \d+0分未満)?$/

export default () => ProcedureTimeSelections()

export function ProcedureTimeSelections(): string[] {
  const temporaryArray: string[] = []
  const firstBreak = breaks[0] ?? 30
  temporaryArray.push(firstBreak.toString() + '分未満')

  for (let i = 0; i < breaks.length - 1; i++) {
    const current = breaks[i]
    const next = breaks[i + 1]
    if (current === undefined || next === undefined) {
      continue
    }
    temporaryArray.push(
      current.toString() + '分以上 － ' +
      next.toString() + '分未満'
    )
  }
  temporaryArray.push(String(breaks[breaks.length - 1] ?? firstBreak) + '分以上')

  return temporaryArray
}

export function encodeProcedureTime(minutes: number = 0): string {
  const firstBreak = breaks[0] ?? 30
  if (minutes < firstBreak) return firstBreak + '分未満'
  for (let i = 0; i < breaks.length - 1; i++) {
    const current = breaks[i]
    const next = breaks[i + 1]
    if (current === undefined || next === undefined) {
      continue
    }
    if (minutes >= current && minutes < next) return current + '分以上 － ' + next + '分未満'
  }

  return (breaks[breaks.length - 1] ?? firstBreak) + '分以上'
}

export function parseProcedureTime(selection: string = ''): number {
  // 選択枝フォーマット
  const parsed = selection.match(procedureTimeFormatMin)
  const groups = parsed?.groups as { time?: string; vector?: string } | undefined
  if (groups?.time && groups?.vector) {
    return groups.vector === '未満'
      ? Number(groups.time) - 1
      : Number(groups.time)
  } else {
    // 実時間入力
    return parseRawTime(selection)
  }
}

export function parseRawTime(string: string = ''): number {
  const rawTime = string.match(rawTimeFormat)
  const groups = rawTime?.groups as { hours?: string; minutes?: string } | undefined
  if (groups?.minutes) {
    return Number(groups.hours || '0') * 60 + Number(groups.minutes)
  } else {
    return -1
  }
}
