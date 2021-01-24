export function parseCSV (loadeddocument) {
  // 改行コードを確認して切り出し
  const newline = (loadeddocument.indexOf('\r\n') < 0) ? (loadeddocument.indexOf('\r') < 0 ? '\n' : '\r') : '\r\n'
  const lines = loadeddocument.split(newline)

  // CSVのパース
  const rows = []
  const columncounts = {}
  for (const line of lines) {
    const row = []
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
    // 空白行は無視する
    if (row.length > 0) {
      rows.push(row)
      columncounts[row.length] = null
    }
  }
  if (Object.keys(columncounts).length > 1) {
    throw new Error('ファイルのレコード数が不定です.不正なCSVファイルです.')
  }
  return (rows)
}

export function phraseTitledCSV (loadeddocument) {
  const doc = parseCSV(loadeddocument)

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
