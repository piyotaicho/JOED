import ProcedureTimeSelections from '@/modules/ProcedureTimes'
import { DateFormat } from '@/modules/CaseValidater'
import { CharacterReplacer, Migrate2019to2020 } from '@/modules/ImportMergeV4'

let internalcounter = 0

export function CreateDocument (record = [], assignrule = {}) {
  // インポートデータのフラグとメッセージ
  const CaseData = {
    Imported: true,
    Notification: 'CSVファイルから変換されたデータです.確認と保存が必要です.\n'
  }

  // DateOfProcedue と ID はレコード構成の最低限必須項目
  DateOfProcedure(CaseData, record, assignrule)
  BasicInformation(CaseData, record, assignrule)
  ProcedureTime(CaseData, record, assignrule)
  DiagnosesAndProcedures(CaseData, record, assignrule)
  AEs(CaseData, record, assignrule)

  return CaseData
}

function getvalueByRule (fieldname, record, assignrule, generator = undefined) {
  const ruleofField = assignrule[fieldname]
  if (ruleofField === undefined) {
    return undefined
  }
  // CSVのフィールドを取得
  if (ruleofField.column !== undefined) {
    return record[ruleofField.column]
  }
  // 定数を取得
  if (ruleofField.constants !== undefined) {
    return ruleofField.constants
  }
  // 自動生成
  if (ruleofField.compute !== undefined) {
    if (generator !== undefined) {
      return generator(fieldname, ruleofField.compute, record)
    } else {
      throw new Error(fieldname + 'は自動生成できません.')
    }
  }
}

function DateOfProcedure (CaseData, record, assignrule) {
  const ruleofField = assignrule['手術日 (必須)']
  if (ruleofField === undefined) {
    throw new Error('手術日は必須入力項目です.')
  }
  // CSVのフィールドから読み込み いろいろな日付フォーマットに一応対応 - HARDCODED
  if (ruleofField.column !== undefined) {
    const value = record[ruleofField.column].trim()
    const datefields = value.match(/20(?<year>[0-9]{2})[年/-](?<month>0{0,1}[1-9]|1[0-2])[月/-](?<day>0{0,1}[1-9]|[12][0-9]|3[01])$/)
    if (datefields === null) {
      throw new Error('ファイル中の日付の指定(' + value + ')が無効です.')
    }
    CaseData.DateOfProcedure = '20' + datefields.groups.year + '-' + ('0' + datefields.groups.month).substr(-2) + '-' + ('0' + datefields.groups.day).substr(-2)
  }

  // 指定の定数を設定
  if (ruleofField.constants !== undefined) {
    if (!DateFormat.test(ruleofField.constants)) {
      throw new Error('ユーザ指定の日付指定フォーマットに誤りがあります.')
    }
    CaseData.DateOfProcedure = ruleofField.constants
  }

  // 自動生成は無効
  if (ruleofField.compute !== undefined) {
    throw new Error('手術日は必須入力項目です.自動生成は出来ません.')
  }
}

function BasicInformation (CaseData, record, assignrule) {
  // 患者属性データの設定

  // 必須項目である患者IDを設定もしくは生成
  const ID = getvalueByRule('ID (必須)', record, assignrule,
    (fieldname, compute) => {
      if (compute !== 'ID') {
        throw new Error(fieldname + 'にはID以外の自動生成は設定できません.')
      }
      return 'I-' + ('000000' + (++internalcounter).toString(10)).substr(-6)
    }
  )
  if (ID !== undefined) {
    CaseData.PatientId = ID
  } else {
    throw new Error('IDは必須入力項目です.')
  }

  // 非必須フィールドの設定
  const name = getvalueByRule('患者名', record, assignrule)
  if (name !== undefined) {
    CaseData.Name = name
  }
  const age = (getvalueByRule('年齢', record, assignrule) || '').match(/\d+/)
  if (age !== null) {
    CaseData.Age = Number(age)
  }
  const JSOGid = getvalueByRule('腫瘍登録番号', record, assignrule)
  if (JSOGid !== undefined) {
    CaseData.JSOGid = JSOGid
  }
  const NCDid = getvalueByRule('NCD症例識別コード', record, assignrule)
  if (NCDid !== undefined) {
    CaseData.NCDid = NCDid
  }
}

function ProcedureTime (CaseData, record, assignrule) {
  const operationtime = getvalueByRule('手術時間', record, assignrule)
  if (operationtime !== undefined) {
    const timestrmatches = operationtime.match(/\s*(\d+)(分{0,1}(以上|(未満|まで))){0,1}/)
    if (timestrmatches !== null) {
      const timevalue = Number(timestrmatches[1]) - (timestrmatches[4] !== undefined ? 1 : 0)
      CaseData.ProcedureTime = ProcedureTimeSelections(timevalue)
    }
  }
}

function DiagnosesAndProcedures (CaseData, record, assignrule) {
  CaseData.Diagnoses = []
  CaseData.Procedures = []
  const diagnosisFields = ['手術診断1', '手術診断2', '手術診断3', '手術診断4']
  const procedureFields = ['実施手術1', '実施手術2', '実施手術3', '実施手術4']

  for (const field of diagnosisFields) {
    const diagnosis = getvalueByRule(field, record, assignrule)
    if (diagnosis) {
      const temporaryfield = { Text: CharacterReplacer(diagnosis) }

      const benignormalignancy = getvalueByRule(field + '良性/悪性', record, assignrule)

      // 診断のカテゴリにロボットはなく腹腔鏡に集約している
      const category = (
        getvalueByRule(field + 'カテゴリ', record, assignrule) ||
        ''
      ).replace('ロボット', '腹腔鏡')
      if (category === '') {
        throw new Error(field + 'に対するカテゴリの指定が必要です.')
      }

      // 良悪性のフィールドが利用されていない もしくは
      // 非悪性の場合はカテゴリをそのまま採用
      if (
        benignormalignancy === undefined ||
        !benignormalignancy.includes('悪性')
      ) {
        temporaryfield.Chain = [category]
      } else {
        // 悪性が別フィールドで保持されている場合に対応

        // すでにカテゴリに悪性が含まれている場合はそのまま通過
        // 卵管鏡・子宮鏡に悪性を設定している可能性も考慮
        if (
          category.includes('悪性') ||
          category === '子宮鏡' ||
          category === '卵管鏡'
        ) {
          temporaryfield.Chain = [category]
        } else {
          temporaryfield.Chain = ['腹腔鏡悪性']
        }
      }
      CaseData.Diagnoses.push(temporaryfield)
    }
  }

  for (const field of procedureFields) {
    const procedure = getvalueByRule(field, record, assignrule)
    if (procedure) {
      const temporaryfield = { Text: CharacterReplacer(procedure) }

      const benignormalignancy = getvalueByRule(field + '良性/悪性', record, assignrule)
      const category = getvalueByRule(field + 'カテゴリ', record, assignrule)
      if (category === undefined) {
        throw new Error(field + 'に対するカテゴリの指定が必要です.')
      }
      // 良悪性のフィールドが利用されていない もしくは
      // 非悪性の場合はカテゴリをそのまま採用
      if (
        benignormalignancy === undefined ||
        !benignormalignancy.includes('悪性')
      ) {
        temporaryfield.Chain = [category]
      } else {
        // 悪性が別フィールドで保持されている場合に対応

        // すでにカテゴリに悪性が含まれている場合はそのまま通過
        // 卵管鏡・子宮鏡に悪性を設定している可能性も考慮
        if (
          category.includes('悪性') ||
          category === '子宮鏡' ||
          category === '卵管鏡'
        ) {
          temporaryfield.Chain = [category]
        } else {
          // ロボット悪性 or 腹腔鏡悪性
          if (category.includes('ロボット')) {
            temporaryfield.Chain = ['ロボット悪性']
          } else {
            temporaryfield.Chain = ['腹腔鏡悪性']
          }
        }
      }
      CaseData.Procedures.push(temporaryfield)
    }
  }

  // 主たる術式からカテゴリを設定
  if (CaseData.Procedures[0]) {
    CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
  }
}

function AEs (CaseData, record, assignrule) {
  const hasAE = getvalueByRule('合併症の有無', record, assignrule)
  if (hasAE !== undefined) {
    if (
      /(合併症|)[無な]し/.test(hasAE) ||
      /no/i.test(hasAE)
    ) {
      CaseData.PresentAE = false
    } else {
      CaseData.PresentAE = true
      CaseData.Notification = (CaseData.Notification || '') + '合併症の詳細は再入力が必要です.\n'
    }
  }
}

export function Migrate (CaseData) {
  return Migrate2019to2020(CaseData)
}
