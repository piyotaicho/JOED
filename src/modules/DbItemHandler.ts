import type { CaseDocument, DiagnosisItem, ProcedureItem, ExportCaseRecord, ProcedureDescription } from '@/types/data'

type ItemWithText = { Text: string; Description?: ProcedureDescription }

export default class CaseDocumentHandler {
  // 症例データの項目に対する操作
  //
  // 診断・実施手術項目
  // Diagnoses - Hash[]
  // Procedures - Hash[]
  // [
  //   // 以下のhashがitem
  //  {
  //     Text: "登録される内容",
  //     Chain: [ {{カテゴリ}}, {{対象}}|undefined ]
  //     AdditionalProcedure: { Text: ..., Description: [] } => Chainを除くitem/出力データでは主アイテムの次に入る
  //     Description: []
  //     UserTyped: boolean
  //  }, ...
  // ]

  /**
   * itemを辿って propertyName の値を取得する(depthは3まで)
   * @param {*} item
   * @param {*} _propertyName
   * @param {*} _depthcount
   * @returns
   */
  static ItemValue(item: Record<string, unknown> = {}, _propertyName: string = 'Text', _depthcount: number = 3): unknown {
    if (item[_propertyName]) {
      return item[_propertyName]
    } else {
      if (--_depthcount) {
        for (const key in item) {
          const nested = item[key]
          if (!nested || typeof nested !== 'object') {
            continue
          }
          const value = this.ItemValue(nested as Record<string, unknown>, _propertyName, _depthcount)
          if (value) {
            return value
          }
        }
      }
      return undefined
    }
  }

  /**
   * Diagnoses/ProceduresのChainとTextをArrayにして取得する
   * @param {*} item
   * @param {*} _propertyName
   * @returns [chain[0], chain[1], Text]
   */
  static ItemChain(item: DiagnosisItem | ProcedureItem = {} as DiagnosisItem, _propertyName: string = 'Text'): [string, string, unknown] | undefined {
    const record = item as unknown as Record<string, unknown>
    if (item.Chain && record[_propertyName]) {
      const value = this.ItemValue(record, _propertyName)
      if (item.Chain.length === 2) {
        return [item.Chain[0], item.Chain[1] || '', value]
      } else {
        return [item.Chain[0], '', value]
      }
    }
    return undefined
  }

  /**
   * Diagnoses/Proceduresの「値」をArrayにして取得する
   * @param {*} itemList
   * @param {*} _flattenToString Textのみの入力値をsrtingでの抽出にするか、.Textのオブジェクトを返すか選択する
   * @returns
   */
  static FlattenItemList(
    itemList: Array<DiagnosisItem | ProcedureItem> = [],
    _flattenToString: boolean = false
  ): Array<ItemWithText | string> {
    const temporaryArray: Array<ItemWithText | string> = []
    for (const item of itemList) {
      if ('Description' in item && item.Description) {
        temporaryArray.push({
          Text: item.Text,
          Description: item.Description
        })
      } else {
        if (_flattenToString) {
          temporaryArray.push(item.Text)
        } else {
          temporaryArray.push({
            Text: item.Text
          })
        }
      }
    }
    return temporaryArray
  }

  /**
   * AdditionalProcesureをparseしてItemのArrayにする
   * @param {*} itemList
   * @returns
   */
  static _flattenItem(itemList: Array<DiagnosisItem | ProcedureItem> = []): Array<ItemWithText> {
    function _extract(item: DiagnosisItem | ProcedureItem): ItemWithText {
      return ('Description' in item && item.Description)
        ? {
            Text: item.Text,
            Description: item.Description
          }
        : {
            Text: item.Text
          }
    }

    const temporaryArray: Array<ItemWithText> = []

    for (const item of itemList) {
      temporaryArray.push(_extract(item))
      if ('AdditionalProcedure' in item && item.AdditionalProcedure) {
        temporaryArray.push(_extract(item.AdditionalProcedure))
      }
    }

    return temporaryArray
  }

  // 症例データから症例登録用のデータとしてプロパティを抽出する
  //
  // @Param Object
  static ExportCase(caserecord: Partial<CaseDocument> = {}): ExportCaseRecord {
    const temporaryItem: ExportCaseRecord = {
      YearOfProcedure: String(caserecord.DateOfProcedure || '').substring(0, 4)
    }

    // ProcedureTimeをコピー
    temporaryItem.ProcedureTime = caserecord.ProcedureTime

    // TypeOfProcedureをコピー
    temporaryItem.TypeOfProcedure = caserecord.TypeOfProcedure

    // 診断・実施手術を $.[*].Text, $.[*].Description に整形してコピー
    temporaryItem.Diagnoses = this._flattenItem(caserecord.Diagnoses || [])
    temporaryItem.Procedures = this._flattenItem(caserecord.Procedures || [])

    // Approachがあればコピー
    if (caserecord?.Approach !== undefined) {
      if (Object.keys(caserecord.Approach).length > 0) {
        temporaryItem.Approach = caserecord.Approach
      }
    }

    // 合併症項目をコピー
    // PresentAEをコピー
    temporaryItem.PresentAE = caserecord.PresentAE

    if (caserecord?.AEs && caserecord.AEs.length > 0) {
      temporaryItem.AEs = Object.assign([], caserecord.AEs)
    }

    // Importedがtrueの時のみコピー
    if (caserecord?.Imported) {
      temporaryItem.Imported = true
    }

    return temporaryItem
  }
}
