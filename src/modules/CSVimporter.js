import ProcedureTimeSelections from '@/modules/ProcedureTimes'

const RecordError = new Error('レコードの様式が不適合です.')

function phraseCSV (loadeddocument) {
  const rows = []

  // 改行コードを確認して切り出し
  const rs = (loadeddocument.indexOf('\r\n') < 0) ? (loadeddocument.indexOf('\r') < 0 ? '\n' : '\r') : '\r\n'
  const lines = loadeddocument.split(rs)

  for (let i = 0; i < lines.length; i++) {
    const len = lines[i].length
    const row = []
    for (let j = 0; j < len; j++) {
      let k
      // 各フィールド毎に切り出してゆく
      if (lines[i].charAt(j) === '"') {
        // ダブルクォートでのクオートあり閉じをさがす
        for (k = j + 1; k < len; k++) {
          k = ((k = lines[i].indexOf('"', k)) < 0) ? len : k
          if (lines[i].charAt(++k) !== '"') {
            // クオートのエスケープでなければ切り出しへ
            break
          }
        }
        row.push(lines[i].substring(j + 1, k - 1).replace(/""/g, '"'))
      } else {
        // クオート無し カンマを探す
        k = (k = lines[i].indexOf(',', j)) < 0 ? len : k
        row.push(lines[i].substring(j, k))
      }
      j = k
    }
    // 空白行は無視する
    if (row.length > 0) {
      rows.push(row)
    }
  }
  return (rows)
}

export function phraseTitledCSV (loadeddocument) {
  const doc = phraseCSV(loadeddocument)

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

export function CreateDocument (record) {
  // インポートデータのフラグとメッセージ
  const CaseData = {
    Imported: true,
    Notification: '外部から変換・読み込まれたデータです.確認と保存が必要です.\n'
  }

  DateOfProcedure(record, CaseData)
  BasicInformation(record, CaseData)
  ProcedureTime(record, CaseData)
  DiagnosesAndProceduresPrimary(record, CaseData)
  DiagnosesAndProceduresSecondary(record, CaseData)
  AEs(record, CaseData)

  Migrate2019to2020(CaseData)

  return CaseData
}

function DateOfProcedure (Record, CaseData) {
  if (Record['手術日']) {
    try {
      CaseData.DateOfProcedure = '20' +
      Record['手術日']
        .match(/^20([0-9]{2})[/-](0{0,1}[1-9]|1[0-2])[/-](0{0,1}[1-9]|[12][0-9]|3[01])$/)
        .splice(1, 3)
        .map(item => ('0' + item).substr(-2))
        .join('-')
      return
    } catch {}
  }
  if (Record['手術年']) {
    CaseData.DateOfProcedure = Record['手術年'] + '-01-01'
    return
  }
  throw new Error('手術日もしくは手術年がありません.')
}

function BasicInformation (Record, CaseData) {
  // 非必須フィールドの設定
  if (Record['氏名']) { CaseData.Name = Record['氏名'] }
  if (Record['年齢']) { CaseData.Age = Record['年齢'] }
  if (Record['症例別腫瘍登録番号']) { CaseData.JSOGId = Record['症例別腫瘍登録番号'] }

  // 患者IDを設定もしくは生成
  if (Record.ID) {
    CaseData.PatientId = Record.ID
    return
  }
  if (Record['内部ID']) {
    CaseData.PatientId = CaseData.DateOfProcedure.substr(0, 4) + Record['内部ID'].substr(5)
    return
  }
  CaseData.PatientId = 'I-' + Number(new Date()).toString().substr(-8)
}

function ProcedureTime (Record, CaseData) {
  if (Record['手術時間']) {
    const timestrmatches = Record['手術時間']
      .match(/\s*(\d+)(分{0,1}(以上|(未満|まで))){0,1}/)
    if (timestrmatches) {
      const timevalue = Number(timestrmatches[1]) - (timestrmatches[4] !== undefined ? 1 : 0)
      CaseData.ProcedureTime = ProcedureTimeSelections(timevalue)
      return
    }
  }
  throw new Error('手術時間の様式が不正です.')
}

function DiagnosesAndProceduresPrimary (Record, CaseData) {
  CaseData.Diagnoses = []
  CaseData.Procedures = []

  if ([
    Record['腹腔鏡術後診断'],
    Record['子宮鏡術後診断'],
    Record['卵管鏡術後診断']
  ].filter(item => item).length !== 1) throw RecordError
  if ([
    Record['腹腔鏡施行手術'],
    Record['子宮鏡施行手術'],
    Record['卵管鏡施行手術']
  ].filter(item => item).length !== 1) throw RecordError

  if (Record['腹腔鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      Record['良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
      Record['腹腔鏡術後診断'], Record['腹腔鏡術後診断その他'])
    )

    CaseData.Procedures.push(
      laparoProcedure(
        Record['腹腔鏡施行手術'], Record['腹腔鏡施行手術その他'],
        Record['良性悪性_病名'] === '良性' ? '' : '悪性',
        Record['リンパ節郭清'], Record['大網生検']
      )
    )
  }
  if (Record['子宮鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      '子宮鏡', Record['子宮鏡術後診断'], Record['子宮鏡術後診断その他']
    ))
    CaseData.Procedures.push(handleUserTyped(
      '子宮鏡', Record['子宮鏡施行手術'], Record['子宮鏡施行手術その他']
    ))
  }
  if (Record['卵管鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      '卵管鏡', Record['卵管鏡術後診断'], Record['卵管鏡術後診断その他']
    ))
    CaseData.Procedures.push(handleUserTyped(
      '卵管鏡', Record['卵管鏡施行手術'], Record['卵管鏡施行手術その他']
    ))
  }

  // 主たる術式からカテゴリを設定
  try {
    CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
  } catch (e) {
    throw RecordError
  }
}

function DiagnosesAndProceduresSecondary (Record, CaseData) {
  if (Record['腹腔鏡併施手術_術後診断1']) {
    if (Record['腹腔鏡併施手術_術後診断1'] !== Record['腹腔鏡術後診断'] || Record['腹腔鏡併施手術_術後診断1'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        Record['併施手術1_良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
        Record['腹腔鏡併施手術_術後診断1'], Record['腹腔鏡併施手術_術後診断1その他']
      ))
    }
  }
  if (Record['腹腔鏡併施手術_術後診断2']) {
    if (Record['腹腔鏡併施手術_術後診断2'] !== Record['腹腔鏡術後診断'] || Record['腹腔鏡併施手術_術後診断2'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        Record['併施手術2_良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
        Record['腹腔鏡併施手術_術後診断2'], Record['腹腔鏡併施手術_術後診断2その他']
      ))
    }
  }
  if (Record['子宮鏡併施手術_術後診断']) {
    if (Record['子宮鏡併施手術_術後診断'] !== Record['子宮鏡術後診断'] || Record['子宮鏡併施手術_術後診断'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        '子宮鏡', Record['子宮鏡併施手術_術後診断'], Record['子宮鏡併施手術_術後診断その他']
      ))
    }
  }

  if (Record['腹腔鏡併施手術_施行手術1']) {
    const item = laparoProcedure(
      Record['腹腔鏡併施手術_施行手術1'], Record['腹腔鏡併施手術_施行手術1その他'],
      Record['併施手術1_良性悪性_術式'] === '良性' ? '' : '悪性',
      Record['併施手術1_リンパ節郭清'], Record['併施手術1_大網生検']
    )
    if (item) CaseData.Procedures.push(item)
  }
  if (Record['腹腔鏡併施手術_施行手術2']) {
    const item = laparoProcedure(
      Record['腹腔鏡併施手術_施行手術2'], Record['腹腔鏡併施手術_施行手術2その他'],
      Record['併施手術2_良性悪性_術式'] === '良性' ? '' : '悪性',
      Record['併施手術2_リンパ節郭清'], Record['併施手術2_大網生検']
    )
    if (item) CaseData.Procedures.push(item)
  }
  if (Record['子宮鏡併施手術_施行手術']) {
    if (Record['子宮鏡併施手術_施行手術'] !== Record['子宮鏡施行手術'] || Record['子宮鏡併施手術_施行手術'] === 'その他') {
      CaseData.Procedures.push(handleUserTyped(
        '子宮鏡', Record['子宮鏡併施手術_施行手術'], Record['子宮鏡併施手術_施行手術その他']
      ))
    }
  }
}

function AEs (Record, CaseData) {
  if (Record['合併症有無'] !== undefined) {
    if (Record['合併症有無'] === 'なし') {
      CaseData.PresentAE = false
    } else {
      CaseData.PresentAE = true
      CaseData.Notification = (CaseData.Notification || '') + '合併症の再入力が必要です.\n'
    }
  } else {
    throw RecordError
  }
}
function CharacterReplacer (str = '') {
  const replaceTable = {
    '（': '(',
    '）': ')',
    '、': ',',
    '，': ','
  }
  return str.toString().replace(
    /[（）、，]/g,
    c => {
      return replaceTable[c] || c
    })
}

function laparoProcedure (procedure = '', typedprocedure = '', typeofselection = '', lymphadnectomy, omentectomy) {
  const category = procedure.includes('ロボット') ? 'ロボット' : '腹腔鏡'
  const translation = {
    lymph: {
      'なし（SN生検－）': 'なし(センチネル生検なし)$',
      'なし(SN生検-)': 'なし(センチネル生検なし)$', // 半角ダッシュ
      'なし(SN生検ｰ)': 'なし(センチネル生検なし)$', // 半確長音
      'なし（SN生検＋）': 'なし(センチネル生検あり)',
      'なし(SN生検+)': 'なし(センチネル生検あり)',
      PLN: 'PLN',
      PAN: 'PAN',
      'PLN＋PAN': 'PLN+PAN',
      'PLN+PAN': 'PLN+PAN'
    },
    omentum: {
      大網生検あり: '[大網切除・生検]あり',
      大網生検なし: '[大網切除・生検]なし'
    }
  }

  if (procedure) {
    const temporaryObject = {}
    temporaryObject.Chain = [category + typeofselection]
    if (procedure === 'その他') {
      temporaryObject.Text = typedprocedure
      temporaryObject.UserTyped = true
    } else {
      temporaryObject.Text = CharacterReplacer(procedure)
      const translatedlymph = translation.lymph[lymphadnectomy]
      if (lymphadnectomy) {
        if (translatedlymph && translatedlymph.substr(-1, 1) !== '$') {
          temporaryObject.AdditionalProcedure = {
            Text: category === 'ロボット' ? 'ロボット支援下リンパ節生検・郭清' : '腹腔鏡下リンパ節生検・郭清',
            Description: [translatedlymph]
          }
        }
      }
      if (omentectomy && translation.omentum[omentectomy]) {
        temporaryObject.Description = translation.omentum[omentectomy]
      }
    }
    return temporaryObject
  } else {
    return undefined
  }
}

function handleUserTyped (category, item, typeditem) {
  return item.substr(0, 3) !== 'その他'
    ? {
      Chain: [category],
      Text: CharacterReplacer(item)
    }
    : {
      Chain: [category],
      Text: typeditem,
      UserTyped: true
    }
}

function Migrate2019to2020 (CaseData) {
  if (CaseData.DateOfProcedure.substr(0, 4) > '2019') {
    // 術後診断の置換
    const DiagnosisReplacer = {
      '子宮内膜症(チョコレート嚢胞含む)': '子宮内膜症(子宮内膜症性嚢胞含む)',
      付属器癒着: '子宮付属器癒着',
      '異所性妊娠(子宮外妊娠)': '異所性妊娠',
      '卵管閉塞,卵管留水(血)症': '卵管閉塞・卵管留水(血)症',
      予防的内性器摘出術適応: '予防的内性器摘出術の適応',
      '卵巣癌(卵管癌・腹膜癌含む)': '卵巣癌(卵管癌,腹膜癌含む)',
      子宮体部前癌病変: '子宮内膜増殖症・異型増殖症',
      帝王切開瘢痕部症候群: '帝王切開瘢痕症候群'
    }
    for (let index = 0; index < CaseData.Diagnoses.length; index++) {
      if (CaseData.Diagnoses[index].UserTyped) {
        continue
      }
      if (DiagnosisReplacer[CaseData.Diagnoses[index].Text]) {
        CaseData.Diagnoses[index].Text = DiagnosisReplacer[CaseData.Diagnoses[index].Text]
      }
    }
    // 実施手術の置換
    const ProcedureReplacer = {
      '子宮付属器嚢胞摘出術(チョコレート嚢胞)': '子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)',
      '子宮付属器切除術(チョコレート嚢胞)': '子宮付属器切除術(子宮内膜症性嚢胞)',
      チョコレート嚢胞エタノール固定術: '卵巣嚢腫エタノール固定術(子宮内膜症性嚢胞含む)',
      '異所性(子宮外)妊娠手術(卵管摘出術)': '異所性妊娠手術(卵管摘出術)',
      '異所性(子宮外)妊娠手術(卵管線状切開術)': '異所性妊娠手術(卵管線状切開術)',
      '異所性(子宮外)妊娠手術(その他)': '異所性妊娠手術(その他)',
      '卵管鏡下卵管形成術(単独)': '卵管鏡下卵管形成術',
      '卵管鏡下卵管形成術(腹腔鏡併用)': '卵管鏡下卵管形成術'
    }
    for (let index = 0; index < CaseData.Procedures.length; index++) {
      if (CaseData.Procedures[index].UserTyped) {
        continue
      }
      if (ProcedureReplacer[CaseData.Procedures[index].Text]) {
        if (CaseData.Procedures[index].Text === '卵管鏡下卵管形成術(単独)') {
          CaseData.Procedures[index].Description = '卵管鏡単独'
        }
        if (CaseData.Procedures[index].Text === '卵管鏡下卵管形成術(腹腔鏡併用)') {
          CaseData.Procedures[index].Description = '腹腔鏡併用'
        }
        CaseData.Procedures[index].Text = ProcedureReplacer[CaseData.Procedures[index].Text]
      }
    }
  }
}
