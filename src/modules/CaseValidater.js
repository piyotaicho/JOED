import DaignosisMaster from '@/modules/Masters/DiagnosisItemList'
import ProcedureMaster from '@/modules/Masters/ProcedureItemList'
import AEmaster from '@/modules/Masters/AE'

import ProcedureTimeSelections from '@/modules/ProcedureTimes'

// 日付の表記
export const DateFormatPattern = '^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$'
export const DateFormat = new RegExp(DateFormatPattern)

// 手術時間の表記
export const ProcedureTimeFormat = /^\d+0分(以上|未満)( － \d+0分未満)?$/

// 施設番号の表記
export const InstituteIDFormat = /^(0[1-9]|[1-3]\d|4[0-7])\d{3}$/

// 2020年時点の日産腫瘍登録患者No.表記
export const JSOGboardCaseNoFormat = /^(CC|EM|US|UAS|OV|VU|VA|TD)20\d{2}-\d+$/i

// NCDの症例識別コード
export const NCDIdFormat = /^\d{18}-\d{2}-\d{2}-\d{2}$/

// カテゴリチェック(診断のカテゴリに集約する)のテーブル
export const CategoryTranslation = {
  腹腔鏡: '腹腔鏡',
  腹腔鏡悪性: '腹腔鏡悪性',
  ロボット: '腹腔鏡',
  ロボット悪性: '腹腔鏡悪性',
  子宮鏡: '子宮鏡',
  卵管鏡: '卵管鏡'
}

// 症例データの検証
//
// @Param Object １症例分のドキュメントオブジェクト
export async function ValidateCase (item = {}, temporary = false) {
  // 一時保存でも患者IDと手術日は最低限の必須入力項目
  await CheckBasicInformations(item)
  if (!temporary) {
    const Year = item.DateOfProcedure.substr(0, 4)

    await Promise.allSettled([
      CheckProcedureTime(item),
      ValidateAdditionalInformations(item),
      CheckCategoryMatch(item),
      ValidateDiagnoses(item, Year),
      ValidateProcedures(item, Year),
      ValidateAEs(item, Year)
    ]).then(results => {
      throw Error(results
        .filter(result => result.reason)
        .map(result => result.reason.message)
        .join('\n')
      )
    })
  }
}

// 必須基本情報の有無
//
export async function CheckBasicInformations (item) {
  if (
    !item.PatientId ||
    !DateFormat.test(item.DateOfProcedure)
  ) {
    throw Error('患者ID・手術日は最低限の必須入力項目です.')
  }
}

// 手術時間の入力を確認
//
export async function CheckProcedureTime (item) {
  if (!item.ProcedureTime) {
    throw Error('手術時間は必須入力項目です.')
  }
  let procedureTimeString = item.ProcedureTime

  if (/^\d+$/.test(procedureTimeString)) {
    procedureTimeString = ProcedureTimeSelections(Number(procedureTimeString))
  }
  if (!ProcedureTimeFormat.test(procedureTimeString)) {
    throw Error('手術時間の入力様式が違います.')
  }
}
// 補足登録情報の検証
//
export async function ValidateAdditionalInformations (item) {
  const errorMessages = []
  if (item.Age && (item.Age <= 0 || item.Age > 129)) {
    errorMessages.push('年齢の入力内容を確認してください.')
  }
  if (item.JSOGId && item.JSOGId.match(JSOGboardCaseNoFormat) === null) {
    errorMessages.push('日産婦腫瘍登録番号の様式が不正です.')
  }
  if (item.NCDId && item.NCDId.match(NCDIdFormat) === null) {
    errorMessages.push('NCD症例識別番号の様式が不正です.')
  }
  if (errorMessages.length > 0) {
    throw Error(errorMessages.join('\n'))
  }
}

// 主たる術後診断・実施術式のカテゴリの一致の検証
//
export async function CheckCategoryMatch (item) {
  const categoryDiagnosis = item?.Diagnoses[0]?.Chain[0]
  const categoryProcedure = item?.Procedures[0]?.Chain[0]
  // Diagnoses, Proceduresが未設定については別でチェックされる
  if (categoryDiagnosis && categoryProcedure &&
    CategoryTranslation[categoryDiagnosis] !== CategoryTranslation[categoryProcedure]) {
    throw Error('主たる手術診断と主たる実施術式のカテゴリが一致していません.')
  }
}

// 術後診断の重複の有無
//
export async function CheckDupsInDiagnoses (item) {
  const itemTexts = item.Diagnoses.map(item => item.Text)
  if (itemTexts.length > (new Set(itemTexts)).size) {
    throw Error('手術診断に重複があります.')
  }
}

// 術後診断の重複確認と年次ツリーとの整合性検証
//
export async function ValidateDiagnoses (item, year) {
  if (!(item?.Diagnoses?.length > 0)) {
    throw Error('手術診断の入力がありません.')
  }

  await CheckDupsInDiagnoses(item)

  const master = new DaignosisMaster()
  await Promise.allSettled(
    item.Diagnoses.map(record => new Promise((resolve, reject) => {
      if (record?.UserTyped !== true) {
        if (master.ItemTexts(record.Chain[0], '', year).indexOf(record.Text) === -1) {
          reject(Error(record.Text + ' が術式マスタにありません.'))
        }
      }
      resolve()
    }))
  )
    .then(results => {
      throw Error(results
        .map(result => result?.reason)
        .filter(result => result)
        .map(result => result.message)
        .join('\n')
      )
    })
}

// 実施手術の重複の有無
//
export async function CheckDupsInProcedures (item) {
  const itemTexts = item.Procedures
    .map(item => [
      item.Text,
      (item.AdditionalProcedure ? item.AdditionalProcedure.Text : []),
      (item.Ditto ? item.Ditto : [])
    ])
    .flat(2)
  if (itemTexts.length > (new Set(itemTexts)).size) {
    throw Error('実施手術の内容に重複があります.')
  }
}

// 実施手術名の重複確認と年次ツリーとの整合性検証
//
export async function ValidateProcedures (item, year) {
  if (!(item?.Procedures?.length > 0)) {
    throw Error('実施手術の入力がありません.')
  }

  await CheckDupsInProcedures(item)

  const master = new ProcedureMaster()
  await Promise.allSettled(
    item.Procedures.map(record => new Promise((resolve, reject) => {
      if (record?.UserTyped !== true) {
        if (master.ItemTexts(record.Chain[0], '', year).indexOf(record.Text) === -1) {
          reject(Error(record.Text + ' が術式マスタにありません.'))
        }
      }
      resolve()
    }))
  )
    .then(results => {
      throw Error(results
        .map(result => result?.reason)
        .filter(result => result)
        .map(result => result.message)
        .join('\n')
      )
    })
}

// 合併症の重複と整合性確認
//
export async function ValidateAEs (item, year) {
  if (item?.PresentAE === undefined && item?.AEs?.length === undefined) {
    throw Error('合併症の入力がありません.')
  }

  // PresentAEとAEsの整合確認
  if (
    (item.PresentAE === false && (item?.AEs?.length > 0)) ||
    (item.PresentAE === true && !(item?.AEs?.length > 0))
  ) {
    throw Error('合併症の有無と合併症の入力との整合がとれません.')
  }

  if (item.PresentAE === false) {
    return
  }

  // 重複確認～BloodCount,Grade,Courseを除いた部分で評価
  const values = item?.AEs
    .map(record => [record.Category,
      ...record?.Title || [],
      ...record?.Cause || [],
      ...record?.Location || []
    ].join(','))

  if (values.length !== (new Set(values)).size) {
    throw Error('合併症の登録内容に重複があります.')
  }

  // 登録内容の整合性確認
  const Master = new AEmaster(year)
  await Promise.allSettled(item?.AEs.map(record => Master.validate(record)))
    .then(results => {
      throw Error(results
        .map(result => result?.reason)
        .filter(result => result)
        .map(result => result.message)
        .join('\n')
      )
    })
}
