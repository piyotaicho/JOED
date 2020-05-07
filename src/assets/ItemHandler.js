// eslint-disable-next-line no-unused-vars
export default class SelectionTree {
  constructor (initialTree = {}) {
    Object.assign(this, initialTree)
  }

  /*
  アイテムリストオブジェクトの構成 - アイテムリストは年次更新される
  Category: {
    Target: [...項目]

    項目 - '項目名' もしくは
    {
      '項目名': {
        Notification: 'お知らせメッセージの内容'

        *** ProcedureItem ***
        Ditto: [同時入力できない同一手技]
        AdditionalProcedure: '同時展開される手技' // 原則的に同一カテゴリ・対象
        Description: { 補助情報のタイトル: [候補] } 候補に $Multi があるときは複数選択

        *** DiagnosisItem ***
        Procedure: '強制展開される手技'
      }
    }
  }
  */
  Categories () {
    return Object.getOwnPropertyNames(this)
  }

  Targets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  Candidates (category = '', target = '') {
    return (category !== '' && target !== '')
      ? this[category][target].map(item => SelectionTree.handleTreeItem(item))
      : []
  }

  getItemByIndex (category = '', target = '', index = -1) {
    return (category !== '' && target !== '' && index >= 0)
      ? this[category][target][index]
      : undefined
  }

  getItemByName (category = '', target = '', name = '') {
    return this.getItemByIndex(category, target,
      this.Candidates(category, target).findIndex(title => title === name))
  }

  static handleTreeItem (item, attribute = 'key') {
    if (typeof item === 'object') {
      if (attribute === 'key') {
        return Object.keys(item)[0]
      }
      return item[SelectionTree.handleTreeItem(item)][attribute]
    } else {
      if (attribute === 'key') {
        return item
      } else {
        return undefined
      }
    }
  }

  static getNotification (item) {
    return this.handleTreeItem(item, 'Noticication')
  }

  flatten () {
    const temporaryArray = []
    for (const category of Object.getOwnPropertyNames(this)) {
      for (const target of Object.keys(this[category])) {
        for (const item of this[category][target]) {
          temporaryArray.push(SelectionTree.handleTreeItem(item))
        }
      }
    }
    return temporaryArray
  }

  findItemByName (name) {
    for (const category of Object.getOwnPropertyNames(this)) {
      for (const target of Object.keys(this[category])) {
        for (const item of this[category][target]) {
          if (SelectionTree.handleTreeItem(item) === name) {
            return { Text: name, Chain: [category, target] }
          }
        }
      }
    }
    return undefined
  }

  /*
  データベースの項目
  Diagnoses - Array - String
  Procedures - Array - Hash
  [
    // 以下のhashがitem
    {
       Text: "登録される内容",
       Chain: [ {{カテゴリ}}, {{対象}} ]
       AdditionalProcedure: { Text: ..., Description: [] } => Chainを除くitem/出力データでは主アイテムの次に入る
       Description: []
    }
  ]
  */
  static getItemValue (hashObject = {}, $propertyName = 'Text', $depthcount = 0) {
    if (hashObject[$propertyName]) {
      return hashObject[$propertyName]
    } else {
      if (++$depthcount <= 3) {
        // eslint-disable-next-line prefer-const
        for (let key in hashObject) {
          const value = this.getItemValue(hashObject[key], $propertyName, $depthcount)
          if (value) {
            return value
          }
        }
      }
      return undefined
    }
  }

  static getItemChain (hashObject = {}, $propertyName = 'Text') {
    // 移行措置のためしばらくは旧バージョンデータを扱えるようにする
    if (hashObject.Chain && hashObject[$propertyName]) {
      return [...hashObject.Chain, this.getItemValue(hashObject, $propertyName)]
    } else {
      // 旧バージョンデータへの対応のためしばらくしたら以下は削除する
      const category = Object.keys(hashObject)[0]
      const target = Object.keys(hashObject[category])[0]
      return [category, target, this.getItemValue(hashObject)]
    }
  }

  static flattenItemList (itemList = [], FlattenToString = false) {
    const temporaryArray = []
    for (const item in itemList) {
      if (item.Description) {
        temporaryArray.push({
          Text: item.Text,
          Description: item.Desccription
        })
      } else {
        if (FlattenToString === false) {
          temporaryArray.push({
            Text: item.Text
          })
        } else {
          temporaryArray.push(item.Text)
        }
      }
    }
    return temporaryArray
  }
}
