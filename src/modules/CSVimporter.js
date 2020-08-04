import ProcedureTimeSelections from '@/modules/ProcedureTimes'

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
  '腹腔鏡施行手術_リンパ節郭清_大網生検',
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
  '併施手術1_良性悪性_病名',
  '併施手術1_良性悪性_術式',
  '併施手術1_リンパ節郭清',
  '併施手術1_大網生検',
  '併施手術1_リンパ節郭清_大網生検',
  '腹腔鏡併施手術_術後診断2',
  '腹腔鏡併施手術_術後診断2その他',
  '腹腔鏡併施手術_施行手術2',
  '腹腔鏡併施手術_施行手術2その他',
  '併施手術2_良性悪性_病名',
  '併施手術2_良性悪性_術式',
  '併施手術2_リンパ節郭清',
  '併施手術2_大網生検',
  '併施手術2_リンパ節郭清_大網生検',
  '子宮鏡併施手術_術後診断',
  '子宮鏡併施手術_術後診断その他',
  '子宮鏡併施手術_施行手術',
  '子宮鏡併施手術_施行手術その他',
  '腹腔鏡以外併施手術_術後診断2',
  '腹腔鏡以外併施手術_施行手術2',
]

async function CreateDocument (record) {
  const CaseData = {}
  let YearOfRecord = '2020'

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
    reject(new Error('ファイルのフォーマットが適合しません.'))
  })
  .then(_ => new Promise((resolve, reject) => {
    // 手術日を生成
    if (record['手術日']) {
      CaseData.DateOfProcedure = record['手術日'].replace(/\//g, '-')
    }
    if (record['手術年']) {
      CaseData.DateOfProcedure = record['手術年'] + '-01-01'
    }
    if (CaseData.DateOfProcedure) {
      YearOfRecord = CaseData.DateOfProcedure.substr(0, 4)
      resolve()
    }
    reject(new Error('ファイルのフォーマットが適合しません.'))
  }))
  .then(_ => new Promise((resolve, reject) => {
    // 手術時間を生成
    // インポート特典として実時間入力にも対応
    if (record['手術時間']) {
      const maxlength = Number(record['手術時間'].replace(/([1-9]\d+)((分|\')(まで|未満))$/, '$1')) - 1
      const minlength = Number(record['手術時間'].replace(/([1-9]\d+)((分|\'){0,1}(以上))/, '$1'))
      const realtime = Number(record['手術時間']) || maxlength || minlength
      if (realtime) {
        CaseData.ProcedureTime = ProcedureTimeSelections(realtime)
        resolve()
      }
    }
    reject(new Error('ファイルのフォーマットが適合しません.'))
  }))
  .then(_ => new Promise((resolve, reject) => {
    // 主たる診断・術式を生成   
  }))
  .then(_ => new Promise((resolve, reject) => {}))

}