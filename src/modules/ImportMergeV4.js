import ProcedureTimeSelections from '@/modules/ProcedureTimes'

export function CreateDocument (record) {
  // インポートデータのフラグとメッセージ
  const CaseData = {
    Imported: true,
    Notification: '症例登録システムversion4から読み込まれたデータです.確認と保存が必要です.\n'
  }

  // DateOfProcedue と ID はレコード構成の最低限必須項目
  DateOfProcedure(CaseData, record)
  BasicInformation(CaseData, record)
  // 以下からの例外については欠損項目として処理
  try {
    ProcedureTime(CaseData, record)
    DiagnosesAndProceduresPrimary(CaseData, record)
    DiagnosesAndProceduresSecondary(CaseData, record)
    AEs(CaseData, record)
  } catch (error) {
    console.warn(error.message)
  }

  return CaseData
}

function DateOfProcedure (CaseData, record) {
  if (record['手術日']) {
    try {
      CaseData.DateOfProcedure = '20' +
      record['手術日']
        .match(/^20([0-9]{2})[/-](0{0,1}[1-9]|1[0-2])[/-](0{0,1}[1-9]|[12][0-9]|3[01])$/)
        .splice(1, 3)
        .map(item => ('0' + item).substr(-2))
        .join('-')
      return
    } catch {}
  }
  if (record['手術年']) {
    CaseData.DateOfProcedure = record['手術年'] + '-01-01'
    return
  }
  throw new Error('手術日もしくは手術年がありません.')
}

function BasicInformation (CaseData, record) {
  // 非必須フィールドの設定
  if (record['氏名']) { CaseData.Name = record['氏名'] }
  if (record['年齢']) { CaseData.Age = record['年齢'] }
  if (record['症例別腫瘍登録番号']) { CaseData.JSOGId = record['症例別腫瘍登録番号'] }

  // 患者IDを設定もしくは生成
  if (record.ID) {
    CaseData.PatientId = record.ID
    return
  }
  if (record['内部ID']) {
    CaseData.PatientId = CaseData.DateOfProcedure.substr(0, 4) + record['内部ID'].substr(5)
    return
  }
  CaseData.PatientId = 'I-' + Number(new Date()).toString().substr(-8)
}

function ProcedureTime (CaseData, record) {
  if (record['手術時間']) {
    const timestrmatches = record['手術時間']
      .match(/\s*(\d+)(分{0,1}(以上|(未満|まで))){0,1}/)
    if (timestrmatches) {
      const timevalue = Number(timestrmatches[1]) - (timestrmatches[4] !== undefined ? 1 : 0)
      CaseData.ProcedureTime = ProcedureTimeSelections(timevalue)
      return
    }
  }
  throw new Error('手術時間の様式が不正です.')
}

function DiagnosesAndProceduresPrimary (CaseData, record) {
  CaseData.Diagnoses = []
  CaseData.Procedures = []

  if ([
    record['腹腔鏡術後診断'],
    record['子宮鏡術後診断'],
    record['卵管鏡術後診断']
  ].filter(item => item).length !== 1) {
    throw new Error('手術診断の入力がありません.')
  }

  if ([
    record['腹腔鏡施行手術'],
    record['子宮鏡施行手術'],
    record['卵管鏡施行手術']
  ].filter(item => item).length !== 1) {
    throw new Error('実施手術の入力がありません.')
  }

  if (record['腹腔鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      record['良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
      record['腹腔鏡術後診断'], record['腹腔鏡術後診断その他'])
    )

    CaseData.Procedures.push(
      laparoProcedure(
        record['腹腔鏡施行手術'], record['腹腔鏡施行手術その他'],
        record['良性悪性_病名'] === '良性' ? '' : '悪性',
        record['リンパ節郭清'], record['大網生検']
      )
    )
  }

  if (record['子宮鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      '子宮鏡', record['子宮鏡術後診断'], record['子宮鏡術後診断その他']
    ))
    CaseData.Procedures.push(handleUserTyped(
      '子宮鏡', record['子宮鏡施行手術'], record['子宮鏡施行手術その他']
    ))
  }

  if (record['卵管鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped(
      '卵管鏡', record['卵管鏡術後診断'], record['卵管鏡術後診断その他']
    ))
    CaseData.Procedures.push(handleUserTyped(
      '卵管鏡', record['卵管鏡施行手術'], record['卵管鏡施行手術その他']
    ))
  }

  // 主たる術式からカテゴリを設定
  try {
    CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
  } catch (e) {
    throw new Error('実施術式カテゴリの抽出に失敗しました.')
  }
}

function DiagnosesAndProceduresSecondary (CaseData, record) {
  if (record['腹腔鏡併施手術_術後診断1']) {
    if (record['腹腔鏡併施手術_術後診断1'] !== record['腹腔鏡術後診断'] || record['腹腔鏡併施手術_術後診断1'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        record['併施手術1_良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
        record['腹腔鏡併施手術_術後診断1'], record['腹腔鏡併施手術_術後診断1その他']
      ))
    }
  }
  if (record['腹腔鏡併施手術_術後診断2']) {
    if (record['腹腔鏡併施手術_術後診断2'] !== record['腹腔鏡術後診断'] || record['腹腔鏡併施手術_術後診断2'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        record['併施手術2_良性悪性_病名'] === '良性' ? '腹腔鏡' : '腹腔鏡悪性',
        record['腹腔鏡併施手術_術後診断2'], record['腹腔鏡併施手術_術後診断2その他']
      ))
    }
  }
  if (record['子宮鏡併施手術_術後診断']) {
    if (record['子宮鏡併施手術_術後診断'] !== record['子宮鏡術後診断'] || record['子宮鏡併施手術_術後診断'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        '子宮鏡', record['子宮鏡併施手術_術後診断'], record['子宮鏡併施手術_術後診断その他']
      ))
    }
  }

  if (record['腹腔鏡併施手術_施行手術1']) {
    const item = laparoProcedure(
      record['腹腔鏡併施手術_施行手術1'], record['腹腔鏡併施手術_施行手術1その他'],
      record['併施手術1_良性悪性_術式'] === '良性' ? '' : '悪性',
      record['併施手術1_リンパ節郭清'], record['併施手術1_大網生検']
    )
    if (item) CaseData.Procedures.push(item)
  }
  if (record['腹腔鏡併施手術_施行手術2']) {
    const item = laparoProcedure(
      record['腹腔鏡併施手術_施行手術2'], record['腹腔鏡併施手術_施行手術2その他'],
      record['併施手術2_良性悪性_術式'] === '良性' ? '' : '悪性',
      record['併施手術2_リンパ節郭清'], record['併施手術2_大網生検']
    )
    if (item) CaseData.Procedures.push(item)
  }
  if (record['子宮鏡併施手術_施行手術']) {
    if (record['子宮鏡併施手術_施行手術'] !== record['子宮鏡施行手術'] || record['子宮鏡併施手術_施行手術'] === 'その他') {
      CaseData.Procedures.push(handleUserTyped(
        '子宮鏡', record['子宮鏡併施手術_施行手術'], record['子宮鏡併施手術_施行手術その他']
      ))
    }
  }
}

function AEs (CaseData, record) {
  if (record['合併症有無'] !== undefined) {
    if (record['合併症有無'] === 'なし') {
      CaseData.PresentAE = false
    } else {
      CaseData.PresentAE = true
      CaseData.Notification = (CaseData.Notification || '') + '合併症の再入力が必要です.\n'
    }
  } else {
    throw new Error('合併症の有無の入力がありません.')
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
