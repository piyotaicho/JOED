// eslint-disable-next-line no-unused-vars
export default class SelectionTree {
  constructor (initialTree = {}) {
    Object.assign(this, initialTree)
  }

  /*
  アイテムリストの構成
  Category: {
    Target: [項目]

    項目 - '項目名' もしくは
    {
      Text: '項目名'
      Notification: 'お知らせメッセージの内容'
    }
  }
  */
  fetchCategories () {
    return Object.getOwnPropertyNames(this)
  }

  fetchTargets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  fetchSelections (category = '', target = '') {
    return (category !== '' && target !== '')
      ? this[category][target].map(item => SelectionTree.handleTreeItem(item))
      : []
  }

  getSelectedItemByIndex (category = '', target = '', index = -1) {
    return (category !== '' && target !== '' && index >= 0)
      ? this[category][target][index]
      : undefined
  }

  getSelectedItemByName (category = '', target = '', name = '') {
    return this.getSelectedItemByIndex(category, target,
      this.fetchSelections(category, target).findIndex(title => title === name))
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
       AdditionalProcedure: { Text: ..., Description: [] } => 出力データでは主アイテムの次に入る
       Description: []
    }
  ]
  */
  static getPropertyValue (hashObject = {}, $propertyName = 'Text', $depthcount = 0) {
    if (hashObject[$propertyName]) {
      return hashObject[$propertyName]
    } else {
      if (++$depthcount <= 3) {
        // eslint-disable-next-line prefer-const
        for (let key in hashObject) {
          const value = this.getPropertyValue(hashObject[key], $propertyName, $depthcount)
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
      return [...hashObject.Chain, this.getPropertyValue(hashObject, $propertyName)]
    } else {
      // 旧バージョンデータへの対応のためしばらくしたら以下は削除する
      const category = Object.keys(hashObject)[0]
      const target = Object.keys(hashObject[category])[0]
      return [category, target, this.getPropertyValue(hashObject)]
    }
  }
}
