import { parseProcedureTime, encodeProcedureTime } from '@/modules/ProcedureTimes'

let year = ''
let internalcounter = 1

export function ValidateRecords (records) {
  if (!Array.isArray(records)) {
    throw new Error('内部呼び出しのエラーです.')
  }

  year = ''
  internalcounter = 1
  let hasHeader = false
  let anonymised = false
  let numberofCase = 0

  for (const record of records) {
    // 提出用データのヘッダレコード
    if (
      record.InstitutionName &&
      record.InstitutionID
    ) {
      hasHeader = true
      if (record.Year) {
        year = record.Year
      }
      continue
    }
    // 症例レコードの最低限構成レコードがあるかを確認
    // Idと日付だけの一時保存を含むパターン
    if (record.PatientId && record.DateOfProcedure) {
      // 症例レコードの数をカウントアップ
      numberofCase++
    } else {
      // 提出データに準ずる必要条件を満たしているパターン
      if (
        record.ProcedureTime &&
        record.PresentAE !== undefined &&
        record.Diagnoses &&
        record.Procedures
      ) {
        if (record.PatientId === undefined) {
          anonymised = true
        }
        // 症例レコードの数をカウントアップ
        numberofCase++
      }
    }
  }

  if (numberofCase === 0) {
    throw new Error('ファイルに有効な症例レコードが含まれていない可能性があります.')
  }
  return {
    length: numberofCase,
    hasHeader,
    anonymised
  }
}

export function CreateDocument (record) {
  const CaseData = {
  }

  // DateOfProcedue と ID はレコード構成の最低限必須項目
  // ここからの例外は上位で対応する.
  DateOfProcedure(CaseData, record)
  BasicInformation(CaseData, record)

  ProcedureTime(CaseData, record)
  DiagnosesAndProcedures(CaseData, record)
  AEs(CaseData, record)

  // Notificationのインポートはインポート警告のあとに追加する
  if (record?.Notification) {
    CaseData.Notification = (CaseData.Notification || '') + `${record.Notification}\n`
  }
  return CaseData
}

function DateOfProcedure (CaseData, record) {
  if (record?.DateOfProcedure) {
    try {
      CaseData.DateOfProcedure = '20' +
        record.DateOfProcedure
          .match(/^20([0-9]{2})[/-](0{0,1}[1-9]|1[0-2])[/-](0{0,1}[1-9]|[12][0-9]|3[01])$/)
          .splice(1, 3)
          .map(item => ('0' + item).slice(-2))
          .join('-')
    } catch {
      throw new Error('日付の書式が不正です.')
    }
  } else {
    // 日付の設定が無い場合自動生成
    if (year === '') {
      throw new Error('データの自動生成に必要な情報が不足しているためこれ以上の変換は出来ません.')
    }
    CaseData.DateOfProcedure = year + '-01-01'
    CaseData.Imported = true
  }
}

function BasicInformation (CaseData, record) {
  // 非必須基本情報フィールドの設定
  for (const key of ['Name', 'Age', 'JSOGId', 'NCDId', 'Denial']) {
    if (record[key] !== undefined) {
      CaseData[key] = record[key]
    }
  }

  // 患者IDを設定もしくは生成
  if (record?.PatientId !== undefined) {
    CaseData.PatientId = record.PatientId
  } else {
    CaseData.PatientId = 'I-' + ('000000' + internalcounter.toString(10)).slice(-6)
    CaseData.Imported = true
    CaseData.Notification = '自動生成された患者IDです、実際の重複などに注意してください.\n' +
      (CaseData.Notification || '')

    internalcounter++
  }
}

function ProcedureTime (CaseData, record) {
  try {
    if (record?.ProcedureTime) {
      CaseData.ProcedureTime = encodeProcedureTime(parseProcedureTime(record.ProcedureTime))
    } else {
      throw new Error()
    }
  } catch {
    // 手術時間がない場合などフラグを立てる.
    CaseData.Imported = true
    CaseData.Notification = (CaseData.Notification || '') +
      '手術時間を設定して下さい.\n'
  }
}

function DiagnosesAndProcedures (CaseData, record) {
  try {
    CaseData.Diagnoses = []
    Object.assign(CaseData.Diagnoses, record.Diagnoses)

    CaseData.Procedures = []
    Object.assign(CaseData.Procedures, record.Procedures)

    if (record?.TypeOfProcedure) {
      CaseData.TypeOfProcedure = record.TypeOfProcedure
    } else {
      CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
    }
  } catch {
    CaseData.Imported = true
    CaseData.Notification = (CaseData.Notification || '') +
      '手術診断・実施術式のインポートが出来ませんでした, 再入力を御願いします.\n'
  }
}

function AEs (CaseData, record) {
  if (record?.PresentAE !== undefined) {
    if (typeof record.PresentAE === 'boolean') {
      CaseData.PresentAE = record.PresentAE
    } else {
      // なにかの間違いでboolean以外となっていた場合に適当に対応
      CaseData.PresentAE = /(1|true|yes|はい|[あ有]り)/i.test(record.PresentAE.toString())
      CaseData.Imported = true
      CaseData.Notification = (CaseData.Notification || '') +
        '合併症情報について確認が必要です.\n'
    }

    // 合併症ありの場合のチェック
    if (CaseData.PresentAE) {
      if (record?.AEs) {
        CaseData.AEs = []
        Object.assign(CaseData.AEs, record.AEs)
      } else {
        // 合併症あり にも関わらず合併症の詳細がない場合
        CaseData.Imported = true
        CaseData.Notification = (CaseData.Notification || '') +
          '合併症の詳細入力が必要です.\n'
      }
    }
  } else {
    CaseData.Imported = true
    CaseData.Notification = (CaseData.Notification || '') +
      '合併症情報の入力が必要です.\n'
  }
}
