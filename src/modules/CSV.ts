export function parseCSV (container) {
  // 改行コードを確認して切り出し
  const newline = (container.indexOf('\r\n') < 0) ? (container.indexOf('\r') < 0 ? '\n' : '\r') : '\r\n'
  const lines = container.split(newline)

  // CSVのパース
  const rows = []
  const columncounts = {}
  for (const line of lines) {
    const row = []
    if (line.length === 0) {
      continue
    }

    for (let start = 0; start < line.length; start++) {
      let end
      // 各フィールド毎に切り出してゆく
      if (line.charAt(start) === '"') {
        // ダブルクォートでのクオートあり閉じをさがす
        for (end = start + 1; end < line.length; end++) {
          end = ((end = line.indexOf('"', end)) < 0) ? line.length : end
          if (line.charAt(++end) !== '"') {
            // クオートのエスケープでなければ切り出しへ
            break
          }
        }
        row.push(line.substring(start + 1, end - 1).replace(/""/g, '"').trim())
      } else {
        // クオート無し カンマを探す
        end = (end = line.indexOf(',', start)) < 0 ? line.length : end
        row.push(line.substring(start, end).trim())
      }
      start = end
    }

    if (line.charAt(line.length - 1) === ',') {
      // Broken CSVに対応
      row.push('')
    }

    rows.push(row)
    columncounts[row.length] = null
  }
  if (Object.keys(columncounts).length > 1) {
    throw new Error('ファイルのレコード中のフィールド数が一定ではありません.不正なCSVファイルです.')
  }
  return (rows)
}

export function parseTitledCSV (container) {
  const doc = parseCSV(container)

  const header = doc.slice(0, 1).flat()

  return doc.slice(1).map(line => {
    const record = {}
    for (const index in line) {
      // 余りに半角スペースだけのフィールドが目立つのでここで処理
      record[header[index]] = line[index].trim()
    }
    return record
  })
}

export function generateCSV (rows) {
  const lines = []
  for (const row of rows) {
    const fields = []
    for (const field of row) {
      if (field.indexOf(',') >= 0 || field.indexOf('"') >= 0 || field.indexOf('\n') >= 0 || field.indexOf('\r') >= 0) {
        // クオートが必要
        fields.push('"' + field.replace(/"/g, '""') + '"')
      } else {
        fields.push(field)
      }
    }
    lines.push(fields.join(','))
  }
  return lines.join('\r\n')
}

export function generateCSVFromObjects (objects, columns) {
  const rows = []
  // ヘッダー行
  rows.push(columns.map(col => col.header))

  // データ行
  for (const object of objects) {
    const row = []
    for (const col of columns) {
      row.push(object[col.key] !== undefined ? String(object[col.key]) : '')
    }
    rows.push(row)
  }
  return generateCSV(rows)
}
