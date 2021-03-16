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

  // 項目に登録された内容を取得する

  static ItemValue (item = {}, $propertyName = 'Text', $depthcount = 3) {
    if (item[$propertyName]) {
      return item[$propertyName]
    } else {
      if (--$depthcount) {
        for (const key in item) {
          const value = this.ItemValue(item[key], $propertyName, $depthcount)
          if (value) {
            return value
          }
        }
      }
      return undefined
    }
  }

  // Chain[0], Chain[1], TEXT の配列を取得する

  static ItemChain (item = {}, $propertyName = 'Text') {
    if (item.Chain && item[$propertyName]) {
      return [...item.Chain, this.ItemValue(item, $propertyName)]
    }
    return undefined
  }

  static FlattenItemList (itemList = [], $flattenToString = false) {
    const temporaryArray = []
    for (const item in itemList) {
      if (item.Description) {
        temporaryArray.push({
          Text: item.Text,
          Description: item.Desccription
        })
      } else {
        if ($flattenToString) {
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

  static $flattenItem (itemList = []) {
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

  // 症例データからエクスポート用のデータを成形する
  //
  // UniqueID を付与する
  //
  // @Param Object
  // @Param String
  // @Param Object
  static ExportCase (
    item = {},
    param = {}
  ) {
    const temporaryItem = {}
    const propsToExport = [
      'JSOGId', 'NCDId',
      'PatientId', 'Name', 'Age',
      'DateOfProcedure', 'ProcedureTime', 'TypeOfProcedure',
      'PresentAE', 'Imported'
    ]
    const params = {
      exportAllFields: false,
      omitDateOfProcedure: true,
      omitAge: true,
      ...param
    }

    if (params.exportAllFields) {
      params.omitAge = false
      params.omitDateOfProcedure = false
    } else {
      // NCDIdは当分NCDへのデータ提供はないのでエクスポートしない.
      propsToExport.splice(propsToExport.indexOf('NCDId'), 1)
      propsToExport.splice(propsToExport.indexOf('PatientId'), 1)
      propsToExport.splice(propsToExport.indexOf('Name'), 1)
    }

    if (params.omitAge) {
      propsToExport.splice(propsToExport.indexOf('Age'), 1)
    }

    if (params.omitDateOfProcedure) {
      propsToExport.splice(propsToExport.indexOf('DateOfProcedure'), 1)
    }

    for (const prop of propsToExport) {
      if (item[prop] !== undefined) {
        temporaryItem[prop] = item[prop]
      }
    }

    temporaryItem.Diagnoses = this.$flattenItem(item.Diagnoses)
    temporaryItem.Procedures = this.$flattenItem(item.Procedures)

    if (params.omitDateOfProcedure) {
      temporaryItem.YearOfProcedure = item.DateOfProcedure.substr(0, 4)
    }
    if (item.AEs) {
      temporaryItem.AEs = Object.assign([], item.AEs)
    }
    return temporaryItem
  }
}
