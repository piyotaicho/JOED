import { ProcedureTimeSelections } from '@/modules/ProcedureTimes'
import { CategoryTranslation } from '@/modules/CaseValidater'

// eslint-disable-next-line no-unused-vars
const MergeFields = [
  '内部ID',
  '手術日',
  '手術年',
  'ID',
  '氏名',
  '年齢',
  '合併症有無',
  '手術時間',
  '症例別腫瘍登録番号',
  '良性悪性',
  '良性悪性_病名',
  '良性悪性_術式',
  '腹腔鏡術後診断',
  '腹腔鏡術後診断その他',
  '腹腔鏡施行手術',
  '腹腔鏡施行手術その他',
  'リンパ節郭清',
  '大網生検',
  'リンパ節郭清_大網生検',
  '子宮鏡術後診断',
  '子宮鏡術後診断その他',
  '子宮鏡施行手術',
  '子宮鏡施行手術その他',
  '卵管鏡術後診断',
  '卵管鏡術後診断その他',
  '卵管鏡施行手術',
  '卵管鏡施行手術その他',
  '併施良性悪性',
  '腹腔鏡併施手術_術後診断1',
  '腹腔鏡併施手術_術後診断1その他',
  '腹腔鏡併施手術_施行手術1',
  '腹腔鏡併施手術_施行手術1その他',
  '併施手術1_リンパ節郭清',
  '併施手術1_大網生検',
  '腹腔鏡併施手術_術後診断2',
  '腹腔鏡併施手術_術後診断2その他',
  '腹腔鏡併施手術_施行手術2',
  '腹腔鏡併施手術_施行手術2その他',
  '併施手術2_リンパ節郭清',
  '併施手術2_大網生検',
  '子宮鏡併施手術_術後診断',
  '子宮鏡併施手術_術後診断その他',
  '子宮鏡併施手術_施行手術',
  '子宮鏡併施手術_施行手術その他',
  '腹腔鏡以外併施手術_術後診断2',
  '腹腔鏡以外併施手術_施行手術2'
]

const RecordError = new Error('レコードの様式が不適合です.')

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
async function CreateDocument (record) {
  const CaseData = {}

  return new Promise((resolve, reject) => {
    // 非必須フィールドの設定
    CaseData.Name = record['氏名'] || ''
    CaseData.Age = record['年齢'] || ''
    CaseData.JSOGId = record['症例別腫瘍登録番号'] || ''

    // 患者IDを生成
    if (record.ID) {
      CaseData.InstitutionalPatientId = record.ID
      resolve()
    }
    if (record['内部ID']) {
      CaseData.InstitutionalPatientId = record['内部ID']
      resolve()
    }
    reject(RecordError)
  })
    .then(_ => new Promise((resolve, reject) => {
      // 手術日を生成
      if (record['手術日']) {
        CaseData.DateOfProcedure = record['手術日'].replace(/\//g, '-')
        resolve()
      }
      if (record['手術年']) {
        CaseData.DateOfProcedure = record['手術年'] + '-01-01'
        resolve()
      }
      reject(RecordError)
    }))
    .then(_ => new Promise((resolve, reject) => {
      // 手術時間を生成
      // インポート特典として実時間入力にも対応
      if (record['手術時間']) {
        const proceduretime = Number(record['手術時間']) ||
          Number(record['手術時間'].replace(/([1-9]\d+)((分|')(まで|未満))$/, '$1')) - 1 ||
          Number(record['手術時間'].replace(/([1-9]\d+)((分|'){0,1}(以上))/, '$1'))
        if (proceduretime) {
          CaseData.ProcedureTime = ProcedureTimeSelections(proceduretime)
          resolve()
        }
      }
      reject(RecordError)
    }))
    .then(_ => new Promise((resolve, reject) => {
      // カテゴリを設定
      let category = ''
      if (record['腹腔鏡術後診断']) {
        category = record['良性悪性'] === '良性' ? '' : '悪性'
        if (record['腹腔鏡施行手術'].includes('ロボット')) {
          category = 'ロボット' + category
        }
      }
      if (record['子宮鏡術後診断']) {
        category = '子宮鏡'
      }
      if (record['卵管鏡術後診断']) {
        category = '卵管鏡'
      }
      if (category !== '') {
        CaseData.TypeOfProcedure = category
        resolve()
      }
      reject(RecordError)
    }))
    .then(_ => new Promise((resolve, reject) => {
      CaseData.Diagnoses = []
      CaseData.Procedres = []

      // 主たる診断・術式を設定
      if (record['腹腔鏡術後診断']) {
        const category = record['腹腔鏡施行手術'].includes('ロボット') ? 'ロボット' : '腹腔鏡'
        const subcategory = record['良性悪性'] === '良性' ? '' : '悪性'

        CaseData.Diagnoses.push({
          Chain: [CategoryTranslation[category + subcategory]],
          Text: record['腹腔鏡術後診断'] !== 'その他' ? record['腹腔鏡術後診断'] : record['腹腔鏡術後診断その他'],
          UserTyped: record['腹腔鏡術後診断'] === 'その他' ? true : undefined
        })

        const laparoProcedure = {
          Chain: [category + subcategory],
          Text: record['腹腔鏡施行手術'] !== 'その他' ? record['腹腔鏡施行手術'] : record['腹腔鏡施行手術その他'],
          UserTyped: record['腹腔鏡施行手術'] === 'その他' ? true : undefined
        }

        if (record['リンパ節郭清']) {
          if (!(record['リンパ節郭清'].includes('なし') && record['リンパ節郭清'].includes('－'))) {
            if (!record['腹腔鏡施行手術'].includes('リンパ節')) {
              laparoProcedure.Description = record['リンパ節郭清']
            } else {
              laparoProcedure.AdditionalProcedure = {
                Text: category === 'ロボット' ? 'ロボット支援下リンパ節生検・郭清' : '腹腔鏡下リンパ節生検・郭清',
                Description: record['リンパ節郭清']
              }
            }
          }
        }
        if (record['大網生検']) {
          laparoProcedure.Description = record['大網生検']
        }
        CaseData.Procedres.push(laparoProcedure)
      }
      if (record['子宮鏡術後診断']) {
        CaseData.Diagnoses.push({
          Chain: ['子宮鏡'],
          Text: record['子宮鏡術後診断'] !== 'その他' ? record['子宮鏡術後診断'] : record['子宮鏡術後診断その他']
        })
        CaseData.Procedures.push({
          Chain: ['子宮鏡'],
          Text: record['子宮鏡施行手術'] !== 'その他' ? record['子宮鏡施行手術'] : record['子宮鏡施行手術その他']
        })
      }
      if (record['卵管鏡術後診断']) {
        CaseData.Diagnoses.push({
          Chain: ['卵管鏡'],
          Text: record['卵管鏡術後診断'] !== 'その他' ? record['卵管鏡術後診断'] : record['卵管鏡術後診断その他']
        })
        CaseData.Procedures.push({
          Chain: ['卵管鏡'],
          Text: record['卵管鏡施行手術'] !== 'その他' ? record['卵管鏡施行手術'] : record['卵管鏡施行手術その他']
        })
      }
      try {
        CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
      } catch (e) {
        reject(RecordError)
      }
    }))
    .then(_ => new Promise((resolve, reject) => {}))
    .then(_ => new Promise((resolve, reject) => {}))
}
