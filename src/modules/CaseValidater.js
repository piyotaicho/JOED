import DaignosisMaster from '@/modules/Masters/DiagnosisMaster'
import ProcedureMaster from '@/modules/Masters/ProcedureMaster'
import AEmaster from '@/modules/Masters/AE'

import { procedureTimeFormat } from '@/modules/ProcedureTimes'

// 日付の表記
export const DateFormatPattern = '^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$'
export const DateFormat = new RegExp(DateFormatPattern)

// 手術時間の表記
// procedureTimeFormat - ProcedureTimesからimport

// 施設コードの表記
export const InstituteIDFormat = /^(0[1-9]|[1-3]\d|4[0-7])\d{3}$/

// 2020年時点の日産腫瘍登録患者No.表記
export const JSOGboardCaseNoFormat = /^(CC|EM|US|UAS|OV|VU|VA|TD)20\d{2}-\d+$/i

// NCDの症例識別コード
export const NCDIdFormat = /^\d{18}-\d{2}-\d{2}-\d{2}$/

// 診断カテゴリ
export const CategoriesOfDiagnosis = ['腹腔鏡', '腹腔鏡悪性', '子宮鏡', '卵管鏡']

// 術式カテゴリ
export const CategoriesOfProcedure = ['腹腔鏡', '腹腔鏡悪性', 'ロボット', 'ロボット悪性', '子宮鏡', '卵管鏡']

// 症例データの検証
//
// @Param Object １症例分のドキュメントオブジェクト
//
// return string 症例区分
export async function ValidateCase (item = {}, temporary = false) {
  // 一時保存でも患者IDと手術日は最低限の必須入力項目
  await CheckBasicInformations(item)
  const year = item.DateOfProcedure.substring(0, 4)
  if (!temporary) {
    const results = await allSettled([
      CheckProcedureTime(item),
      ValidateAdditionalInformations(item),
      CheckCategoryMatch(item, year),
      ValidateDiagnoses(item, year),
      ValidateProcedures(item, year),
      ValidateAEs(item, year)
    ])
    return results[2]
  } else {
    try {
      return await CheckCategoryMatch(item, year)
    } catch {
      return undefined
    }
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

  if (!(
    procedureTimeFormat.test(item.ProcedureTime) ||
    /^(\d+:)?\d+$/.test(item.ProcedureTime) // 実時間入力
  )) {
    throw Error('手術時間の入力様式に問題があります.')
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
export async function CheckCategoryMatch (item, year) {
  const categoryOfDiagnosis = item?.Diagnoses?.[0]?.Chain?.[0]
  const categoryOfProcedure = item?.Procedures?.[0]?.Chain?.[0]
  // Diagnoses, Proceduresが未設定については別でチェックされる
  if (categoryOfDiagnosis && categoryOfProcedure) {
    if (year <= 2020) {
      // 2020年以前の対応表 - 術式のカテゴリを優先
      const translation = {
        腹腔鏡: '腹腔鏡',
        腹腔鏡悪性: '腹腔鏡悪性',
        ロボット: '腹腔鏡',
        ロボット悪性: '腹腔鏡悪性',
        子宮鏡: '子宮鏡',
        卵管鏡: '卵管鏡'
      }
      if (translation[categoryOfDiagnosis] !== translation[categoryOfProcedure]) {
        throw Error('主たる手術診断と主たる実施術式のカテゴリが一致していません.')
      }
      return categoryOfProcedure
    } else {
      // 2021年以降 - 診断優先のカテゴリ分類
      if (categoryOfDiagnosis === categoryOfProcedure) {
        // 同一の場合はそのまま
        return categoryOfDiagnosis
      } else {
        if (categoryOfDiagnosis === '腹腔鏡') {
          // 良性腹腔鏡
          if (
            categoryOfProcedure === '腹腔鏡' ||
            categoryOfProcedure === '腹腔鏡悪性'
          ) {
            return '腹腔鏡'
          }
          // 良性ロボット
          if (
            categoryOfProcedure === 'ロボット' ||
            categoryOfProcedure === 'ロボット悪性'
          ) {
            return 'ロボット'
          }
        }
        if (categoryOfDiagnosis === '腹腔鏡悪性') {
          // 悪性腹腔鏡
          if (
            categoryOfProcedure === '腹腔鏡' ||
            categoryOfProcedure === '腹腔鏡悪性'
          ) {
            return '腹腔鏡悪性'
          }
          // 悪性ロボット
          if (
            categoryOfProcedure === 'ロボット' ||
            categoryOfProcedure === 'ロボット悪性'
          ) {
            return 'ロボット悪性'
          }
        }
        throw Error('主たる手術診断と主たる実施術式のカテゴリが一致していません.')
      }
    }
  } else {
    throw Error('主たる手術診断と主たる実施術式が適切に設定されていません.')
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
  await allSettled(
    item.Diagnoses.map(record => new Promise((resolve, reject) => {
      if (!record.Text) {
        reject(Error('空白の手術診断レコードです.'))
      } else {
        if (record.UserTyped !== true) {
          const masterItem = master.getItem(record.Text, record?.Chain?.[0], '', year)
          if (master.getText(masterItem) === undefined) {
            reject(Error(record.Text + ' が診断マスタにありません.'))
          }
        }
        resolve()
      }
    }))
  )
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
  await allSettled(
    item.Procedures.map(record => new Promise((resolve, reject) => {
      if (!record.Text) {
        reject(Error('空白の実施手術レコードです.'))
      } else {
        if (record.UserTyped !== true) {
          // 選択術式がマスタに存在するか確認
          const masterItem = master.getItem(record.Text, record?.Chain?.[0], '', year)
          if (master.getText(masterItem) === undefined) {
            reject(Error(record.Text + ' が術式マスタにありません.'))
          }
          // マスタに存在する場合、Descriptionの要否を確認
          const itemDescription = ProcedureMaster.getDescriptionObject(masterItem)
          if (itemDescription) {
            if (record?.Description === undefined) {
              // Descriptionの入力がない
              if (itemDescription.Selection !== 'anyornone') {
                reject(Error('実施手術 ' + record.Text + ' には詳細情報が必要です.'))
              }
            } else {
              // 入力されたDescriptionを確認
              // 入力数の確認
              if (record.Description.length === 0) {
                // 入力なし - Selection == 'anyornone' でのみ許容される
                if (itemDescription.Selection !== 'anyornone') {
                  reject(Error('実施手術 ' + record.Text + ' には詳細情報が必要です.'))
                }
              } else {
                // 入力あり
                // 単一入力 Selection == 'one' に複数の入力がある
                if (itemDescription.Selection === 'one' && record.Description.length > 1) {
                  reject(Error('実施手術 ' + record.Text + ' に単一では無く複数の詳細情報が設定されています.'))
                }

                // 入力内容の確認
                const intersection = record.Description.filter(
                  description =>
                    itemDescription.Values
                      .findIndex(
                        item => (item.slice(-1) === '$' ? item.slice(0, -1) : item) === description
                      ) !== -1
                )
                if (record.Description.length !== intersection.length) {
                  reject(Error('実施手術 ' + record.Text + ' に入力された詳細情報 (' + record.Description.join(',') + ') にマスタとの不一致があります.'))
                }
              }
            }
          }
        }
        resolve()
      }
    }))
  )
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
  // 出血の重複を回避
  const checkValues = item?.AEs
    .map(
      record => record.Category === '出血'
        ? record.Category
        : [
            record.Category,
            ...(record?.Title || []).sort(),
            ...(record?.Cause || []).sort(),
            ...(record?.Location || []).sort()
          ].join(',')
    )

  // 2項目以上の登録がなければ重複は無い
  if (checkValues.length > 1) {
    const dupValues = (Array.from(new Set(checkValues))).reduce(
      (originalValues, value) => {
        originalValues.splice(originalValues.indexOf(value), 1)
        return originalValues
      },
      [...checkValues]
    )
    if (dupValues.length > 0) {
      throw Error(`合併症の登録に ${dupValues.map(value => (value.split(','))[0]).join(', ')} の重複があります.`)
    }
  }

  // if (values.length !== (new Set(values)).size) {
  //   throw Error('合併症の登録内容に重複があります.')
  // }

  // 登録内容の整合性確認
  const Master = new AEmaster(year)
  await allSettled(item?.AEs.map(record => Master.validate(record)))
}

// Promise.allSettledのラッパー
// エラーメッセージを連結してthrowする
//
// @param{Array} promiseの配列オブジェクト
function allSettled (promises) {
  return Promise.allSettled(promises)
    .then(results => {
      const messages = results
        .filter(result => result?.reason)
        .map(result => result.reason.message)
        .join('\n')
      if (messages !== '') {
        throw Error(messages)
      }
      return results.map(result => result?.value)
    })
}
