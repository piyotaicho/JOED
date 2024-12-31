export default class CaseDocumentHandler {
  // データベースの項目
  // Diagnoses - Array - String/Hash
  // Procedures - Array - Hash
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
  static ItemValue (item = {}, _propertyName = 'Text', _depthcount = 3) {
    if (item[_propertyName]) {
      return item[_propertyName]
    } else {
      if (--_depthcount) {
        for (const key in item) {
          const value = this.ItemValue(item[key], _propertyName, _depthcount)
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
  static ItemChain (item = {}, _propertyName = 'Text') {
    if (item.Chain && item[_propertyName]) {
      if (item.Chain.length === 2) {
        return [...item.Chain, this.ItemValue(item, _propertyName)]
      } else {
        return [item.Chain[0], '', this.ItemValue(item, _propertyName)]
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
  static FlattenItemList (itemList = [], _flattenToString = false) {
    const temporaryArray = []
    for (const item in itemList) {
      if (item.Description) {
        temporaryArray.push({
          Text: item.Text,
          Description: item.Desccription
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
  static _flattenItem (itemList = []) {
    function _extract (item) {
      return (item.Description)
        ? {
            Text: item.Text,
            Description: item.Description
          }
        : {
            Text: item.Text
          }
    }

    const temporaryArray = []

    for (const item of itemList) {
      temporaryArray.push(_extract(item))
      if (item.AdditionalProcedure) {
        temporaryArray.push(_extract(item.AdditionalProcedure))
      }
    }

    return temporaryArray
  }

  // 症例データから症例登録用のデータとしてプロパティを抽出する
  //
  // @Param Object
  static ExportCase (
    item = {}
  ) {
    const temporaryItem = {}

    // 手術実施年を抽出
    temporaryItem.YearOfProcedure = item.DateOfProcedure.substring(0, 4)

    // ProcedureTimeをコピー
    temporaryItem.ProcedureTime = item.ProcedureTime

    // TypeOfProcedureをコピー
    temporaryItem.TypeOfProcedure = item.TypeOfProcedure

    // PresentAEをコピー
    temporaryItem.PresentAE = item.PresentAE

    // Importedがtrueの時のみコピー
    if (item?.Imported) {
      temporaryItem.Imported = true
    }

    // 診断・実施手術を $.[*].Text, $.[*].Description に整形してコピー
    temporaryItem.Diagnoses = this._flattenItem(item.Diagnoses)
    temporaryItem.Procedures = this._flattenItem(item.Procedures)

    // 合併症項目をコピー
    if (item?.AEs && item.AEs.length > 0) {
      temporaryItem.AEs = Object.assign([], item.AEs)
    }

    return temporaryItem
  }
}
