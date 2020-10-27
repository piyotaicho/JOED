export default class Master {
  constructor (initialTree = {}, Year = '') {
    Object.assign(this, initialTree)
    if (/^20[0-9]{2}/.test(Year)) {
      Object.defineProperty(this, '_YearOfThisTree', { value: Year.substr(0, 4) })
    } else {
      throw Error('マスターセットの日付シリアルに問題があります.')
    }
  }

  /*
  アイテムリストオブジェクトの構成 - アイテムリストは年次更新される
  Category: {
    Target: [...項目]

    項目 - '項目名' もしくは
    {
      {
        Text: '項目名'

        Notification: 'お知らせメッセージ'

        *** ProcedureItem ***
        Ditto: [同時入力できない同一手技]
        AdditionalProcedure: '同時展開される手技' // 原則的に同一カテゴリ・対象
        Description: { 補助情報のタイトル: [...候補] } //候補に $MULTI$ があるときは複数選択 $で終わる候補は選択しても登録されない（主たる術式の場合は選択不可）

        *** DiagnosisItem ***
        Procedure: '強制展開される手技' // 同一カテゴリ・対象であることが必須
      }
    }
  }
  */
  Year () {
    return this._YearOfThisTree
  }

  Categories () {
    return Object.keys(this)
  }

  Targets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  Candidates (category = '', target = '', year = this._YearOfThisTree) {
    if (!year) { year = this._YearOfThisTree }
    return (category !== '' && target !== '')
      ? this[category][target].map(item => Master.handleTreeItem(item, 'Text', year)).filter(item => item !== undefined)
      : []
  }

  getItemByIndex (category = '', target = '', index = -1) {
    return (category !== '' && target !== '' && index >= 0)
      ? this[category][target][index]
      : undefined
  }

  getItemByName (category = '', target = '', name = '', year = this._YearOfThisTree) {
    return this[category][target].find(item => Master.handleTreeItem(item, 'Text', year) === name)
  }

  // 指定カテゴリで平坦化したリスト項目を取得する
  //
  // @param {string} カテゴリ
  // @param {string} データセットの参照年指定(デフォルトは最新)
  getCategoryItems (category = '', year = this._YearOfThisTree) {
    const temporaryArray = []
    for (const key of Object.keys(this)) {
      if (category === '' || key === category) {
        for (const target of Object.keys(this[key])) {
          for (const item of this[key][target]) {
            temporaryArray.push(Master.handleTreeItem(item, 'Text', year))
          }
        }
      }
    }
    return temporaryArray.filter(item => item)
  }

  // カテゴリ・対象臓器ツリーを検索して列挙する
  //
  // @param {string} 対象
  // @param {string} データセットの参照年指定(デフォルトは最新)
  findItemByName (name, year = this._YearOfThisTree) {
    for (const category of Object.keys(this)) {
      for (const target of Object.keys(this[category])) {
        for (const item of this[category][target]) {
          if (Master.handleTreeItem(item, 'Text', year) === name) {
            return { Text: name, Chain: [category, target] }
          }
        }
      }
    }
    return undefined
  }

  // 選択ツリーの３層目の値を取得する
  //
  // @param {object, sting} ３層目の値
  // @param {string}  Text, Ditto, など
  // @param {string}  データセットの参照年指定
  static handleTreeItem (item, attribute = 'Text', year = '') {
    if (typeof item === 'object') {
      if (year !== '') {
        if (item.VaildTo && year > item.VaildTo) {
          return undefined
        }
        if (item.VaildFrom && year < item.VaildFrom) {
          return undefined
        }
      }
      return item[attribute]
    } else {
      if (attribute === 'Text') {
        return item
      } else {
        return undefined
      }
    }
  }
}
