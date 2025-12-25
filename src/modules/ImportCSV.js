import { encodeProcedureTime, parseProcedureTime } from '@/modules/ProcedureTimes'
import { DateFormat, DateFormatPattern } from '@/modules/CaseValidater'
import { MigrateFrom2019 } from '@/modules/ImportMergeV4'

let staticCount = 0

export const fieldNames = [
  '手術日 (必須)', 'ID (必須)',
  '患者名', '年齢', '腫瘍登録番号', 'NCD症例識別コード',
  '手術時間',
  '合併症の有無',

  '手術診断1', '手術診断1カテゴリ', '手術診断1良性/悪性',
  '実施手術1', '実施手術1カテゴリ', '実施手術1良性/悪性',

  '手術診断2', '手術診断2カテゴリ', '手術診断2良性/悪性',
  '実施手術2', '実施手術2カテゴリ', '実施手術2良性/悪性',

  '手術診断3', '手術診断3カテゴリ', '手術診断3良性/悪性',
  '実施手術3', '実施手術3カテゴリ', '実施手術3良性/悪性',

  '手術診断4', '手術診断4カテゴリ', '手術診断4良性/悪性',
  '実施手術4', '実施手術4カテゴリ', '実施手術4良性/悪性'
]

export const generatorFunctions = {
  '自動生成 - ID': { compute: 'ID', title: '自動生成' },
  '定数 - 日付(ユーザ入力)': { constants: '$', title: 'yyyy-mm-dd の形式で日付文字列を入力して下さい.', rule: DateFormatPattern },
  '定数 - 文字列(ユーザ入力)': { constants: '$', title: '任意の文字列を入力可能です.' },
  '定数 - 数値(ユーザ入力)': { constants: '$', title: '任意の数値を入力可能です.', rule: '^[1-9][0-9]*$' }, // HARDCODED
  '定数 - あり': { constants: false, title: 'あり' },
  '定数 - なし': { constants: false, title: 'なし' },
  '定数 - 腹腔鏡': { constants: '腹腔鏡' },
  '定数 - ロボット': { constants: 'ロボット' },
  '定数 - 腹腔鏡悪性': { constants: '腹腔鏡悪性' },
  '定数 - ロボット悪性': { constants: 'ロボット悪性' },
  '定数 - 子宮鏡': { constants: '子宮鏡' },
  '定数 - 卵管鏡': { constants: '卵管鏡' },
  '定数 - 良性': { constants: '良性' },
  '定数 - 悪性': { constants: '悪性' }
}

export function CreateDocument (record = [], ruleset = {}) {
  // インポートデータのフラグとメッセージ
  const CaseData = {
    Imported: true,
    Notification: 'CSVファイルから変換されたデータです.確認と保存が必要です.\n'
  }

  // DateOfProcedue と ID はレコード構成の最低限必須項目
  DateOfProcedure(CaseData, record, ruleset)
  BasicInformation(CaseData, record, ruleset)
  ProcedureTime(CaseData, record, ruleset)
  DiagnosesAndProcedures(CaseData, record, ruleset)
  AEs(CaseData, record, ruleset)

  return CaseData
}

function getvalueByRule (fieldname, record, ruleset, generator = undefined) {
  const ruleofField = ruleset[fieldname]
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

function DateOfProcedure (CaseData, record, ruleset) {
  const ruleofField = ruleset['手術日 (必須)']
  if (ruleofField === undefined) {
    throw new Error('手術日は必須入力項目です.')
  }
  // CSVのフィールドから読み込み いろいろな日付フォーマットに一応対応 - HARDCODED
  if (ruleofField.column !== undefined) {
    const value = record[ruleofField.column].trim()
    const datefields = value.match(/^(?<year>20[0-9]{2})[年/-](?<month>0?[1-9]|1[0-2])[月/-](?<day>0?[1-9]|[12][0-9]|3[01])日?$/)
    if (datefields === null) {
      throw new Error('ファイル中の日付の指定(' + value + ')が無効です.')
    }
    CaseData.DateOfProcedure = [
      datefields.groups.year,
      ('0' + datefields.groups.month).slice(-2),
      ('0' + datefields.groups.day).slice(-2)
    ].join('-')
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

function BasicInformation (CaseData, record, ruleset) {
  // 患者属性データの設定

  // 必須項目である患者IDを設定もしくは生成
  const id = getvalueByRule('ID (必須)', record, ruleset,
    (fieldname, compute) => {
      if (compute !== 'ID') {
        throw new Error(fieldname + 'にはID以外の自動生成は設定できません.')
      }
      return 'I-' + ('000000' + (++staticCount).toString(10)).slice(-6)
    }
  )
  if (id !== undefined) {
    CaseData.PatientId = id
  } else {
    throw new Error('IDは必須入力項目です.')
  }

  // 非必須フィールドの設定
  const name = getvalueByRule('患者名', record, ruleset)
  if (name !== undefined) {
    CaseData.Name = name
  }
  const age = (getvalueByRule('年齢', record, ruleset) || '').match(/\d+/)
  if (age !== null) {
    CaseData.Age = Number(age)
  }
  const JSOGid = getvalueByRule('腫瘍登録番号', record, ruleset)
  if (JSOGid !== undefined) {
    CaseData.JSOGid = JSOGid
  }
  const NCDid = getvalueByRule('NCD症例識別コード', record, ruleset)
  if (NCDid !== undefined) {
    CaseData.NCDid = NCDid
  }
}

function ProcedureTime (CaseData, record, ruleset) {
  const operationtime = getvalueByRule('手術時間', record, ruleset)
  if (operationtime !== undefined) {
    CaseData.ProcedureTime = encodeProcedureTime(parseProcedureTime(operationtime))
  }
}

function DiagnosesAndProcedures (CaseData, record, ruleset) {
  Diagnoses(CaseData, record, ruleset)
  Procedures(CaseData, record, ruleset)

  // 主たる診断からカテゴリを設定(2021年より診断優位をデフォルトとした)
  if (CaseData.Diagnoses[0]) {
    CaseData.TypeOfProcedure = CaseData.Diagnoses[0].Chain[0]
  }
}

function Diagnoses (CaseData, record, ruleset) {
  CaseData.Diagnoses = []
  const diagnosisFields = ['手術診断1', '手術診断2', '手術診断3', '手術診断4']
  for (const field of diagnosisFields) {
    const diagnosis = getvalueByRule(field, record, ruleset)
    if (diagnosis) {
      // 実施術式の取得
      const temporaryfield = { Text: ConvertCharacters(diagnosis) }

      // カテゴリ指定を取得
      let category = getvalueByRule(field + 'カテゴリ', record, ruleset)
      // 良悪性区分フィールドの取得
      let benignormalignancy = getvalueByRule(field + '良性/悪性', record, ruleset)

      // カテゴリと良悪性区分の正規化
      if (category === undefined) {
        throw new Error(field + 'に対するカテゴリの指定が必要です.')
      } else {
        // 良悪性区分が未指定の場合 カテゴリに含まれていないかを検索
        category = category.toString()
        if (benignormalignancy === undefined) {
          const guess = category.search(/[良悪]性/)
          if (guess !== -1) {
            benignormalignancy = category[guess] === '良' ? '良性' : '悪性'
          }
        }

        // カテゴリの正規化
        if (category.search('腹腔鏡') !== -1 || category.search('ロボット') !== -1) {
          category = benignormalignancy !== '悪性' ? '腹腔鏡' : '腹腔鏡悪性'
        } else if (category.search('子宮鏡') !== -1) {
          category = '子宮鏡'
        } else if (category.search('卵管鏡') !== -1) {
          category = '卵管鏡'
        } else {
          throw new Error(field + 'のカテゴリに指定された値(' + category + ')が不正です.カテゴリ指定には腹腔鏡,腹腔鏡悪性,ロボット,ロボット悪性,子宮鏡,卵管鏡のいずれか用いてください.')
        }
      }

      temporaryfield.Chain = [category]
      CaseData.Diagnoses.push(temporaryfield)
    }
  }
}

function Procedures (CaseData, record, ruleset) {
  CaseData.Procedures = []
  const procedureFields = ['実施手術1', '実施手術2', '実施手術3', '実施手術4']
  for (const field of procedureFields) {
    const procedure = getvalueByRule(field, record, ruleset)
    if (procedure) {
      const temporaryfield = {}

      // 実施術式の取得
      let text = ConvertCharacters(procedure).toString()
      if (text.search(/\[.*\]/) !== -1) {
        // 1.3- [] 内にカンマ区切りで保持された付随情報を展開する
        const descriptions = text.substring(text.search(/\[/) + 1, text.search(/\]/)).split(/\w*,\w*/).map(item => item.trim())
        if (descriptions.length > 0) {
          temporaryfield.Description = descriptions
        }
        text = text.substring(0, text.search(/\[/) - 1).trim()
      }
      temporaryfield.Text = text

      // カテゴリ指定を取得
      let category = getvalueByRule(field + 'カテゴリ', record, ruleset)
      // 良悪性区分フィールドの取得
      let benignormalignancy = getvalueByRule(field + '良性/悪性', record, ruleset)

      // カテゴリと良悪性区分の正規化
      if (category === undefined) {
        throw new Error(field + 'に対するカテゴリの指定が必要です.')
      } else {
        // 良悪性区分が未指定の場合 カテゴリに含まれていないかを検索
        if (benignormalignancy === undefined) {
          const guess = category.search(/[良悪]性/)
          if (guess !== -1) {
            benignormalignancy = category[guess] === '良' ? '良性' : '悪性'
          }
        }

        // カテゴリの正規化
        if (category.search('腹腔鏡') !== -1) {
          category = benignormalignancy !== '悪性' ? '腹腔鏡' : '腹腔鏡悪性'
        } else if (category.search('ロボット') !== -1) {
          category = benignormalignancy !== '悪性' ? 'ロボット' : 'ロボット悪性'
        } else if (category.search('子宮鏡') !== -1) {
          category = '子宮鏡'
        } else if (category.search('卵管鏡') !== -1) {
          category = '卵管鏡'
        } else {
          throw new Error(field + 'のカテゴリに指定された値(' + category + ')が不正です.カテゴリ指定には腹腔鏡,腹腔鏡悪性,ロボット,ロボット悪性,子宮鏡,卵管鏡のいずれか用いてください.')
        }
      }
      temporaryfield.Chain = [category]

      CaseData.Procedures.push(temporaryfield)
    }
  }
}

function AEs (CaseData, record, ruleset) {
  const hasAE = getvalueByRule('合併症の有無', record, ruleset)
  if (hasAE !== undefined) {
    if (hasAE.toString().search(/(合併症)?[無な]し|no/i) !== -1) {
      CaseData.PresentAE = false
    } else {
      CaseData.PresentAE = true
      CaseData.Notification = (CaseData.Notification || '') + '合併症の詳細は再入力が必要です.\n'
    }
  }
}

export function Migrate (CaseData) {
  // MergeV4のルーチンを利用
  return MigrateFrom2019(CaseData)
}

export function ConvertCharacters (str = '') {
  // 全角記号を半角に丸める
   
  const index = str.search(/[（）　、，。．]/)
  if (index === -1) {
    return str
  } else {
    let c = str[index]
    switch (c) {
      case '（':
        c = '('
        break
      case '）':
        c = ')'
        break
      case '　':
        c = ' '
        break
      case '、':
      case '，':
        c = ','
        break
      case '。':
      case '．':
        c = '.'
        break
    }
    return str.substring(0, index) + c + ConvertCharacters(str.substring(index + 1))
  }
}
