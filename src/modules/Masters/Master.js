/*
  診断・術式マスタオブジェクト

  @param {object} 基本となるオブジェクトテンプレート
  @param {string} オブジェクトツリーの日付シリアル - 最初の4文字は年号を示す
*/

export default class Master {
  constructor (initialTree = {}, Year = '') {
    // マスタ年次の設定
    if (/^20[0-9]{2}/.test(Year)) {
      Object.defineProperty(this, 'YearofMaster', { value: Year.substr(0, 4) })
    } else {
      throw Error('マスターの日付シリアル指定に問題があります.')
    }

    // 列挙可能変更不可プロパティとして initialTree への参照を設定
    for (const keyname in initialTree) {
      Object.defineProperty(this, keyname, {
        value: initialTree[keyname],
        enumerable: true
      })
    }
  }

  Year () {
    return this.YearofMaster
  }

  /*
  アイテムリストオブジェクトの構成 - アイテムリストは年次更新される
  Category: {
    Target: [...項目]

    項目 - '項目名' もしくは
    {
      {
        Text: '項目名'

        Notification: 'お知らせメッセージ' -- 未実装

        VaildFrom: '使用開始年'
        ValidTo: '使用終了年'

        // *** 診断 ***
        ICD10: [...'ICD10コード'] // *で前方一致のワイルドカードを使用可能
        Procedure: '強制展開される手技' // 同一カテゴリ・対象であることが必須 -- 未実装

        // *** 術式 ***
        Kcode: [...'Kコード'] // *で前方一致のワイルドカードを使用可能
        Ditto: [同時入力できない同一手技]
        AdditionalProcedure: '同時展開される術式' // 同一カテゴリに限定
        Description: {
          Text: '補助情報のタイトル'
          Values: [...候補] }

        // Description の Values: [] のフォーマット
        //
        // 要素に '$MULTI$' を含むとDescriptionは複数保持可能となる
        //
        // $ で終わる文字列が選択された場合はその術式は登録無効となる(単独選択の場合エラーで登録出来ない)
        // [] で囲まれた文字列は選択肢には表示されず、データの可読性を目的に保持される

      }
    }
  }
  */

  // カテゴリkeyのarrayを取得
  //
  // return: array of string
  Categories () {
    return Object.keys(this)
  }

  // 対象臓器keyのarrayを取得
  //
  // @param {string} カテゴリ
  //
  // return: array of string
  Targets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  // カテゴリ・対象臓器に該当するアイテムobjectのarrayを取得
  //
  // @param {string} カテゴリ
  // @param {string} 対象続器 - 空白もしくはundefinedの場合はカテゴリ内すべて
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
  //
  // return: array
  Items (category = '', target, year = this.YearofMaster) {
    if ((year).toString() === '') {
      year = this.YearofMaster
    }
    if (year < 2019) {
      year = 2019
    }

    const temporaryArray = []

    if (!category) {
      return temporaryArray
    }

    for (const targetname of (target ? [target] : this.Targets(category))) {
      temporaryArray.push(
        ...this[category][targetname]
          .filter(item => Master.parseItem(item, 'Text', year))
      )
    }
    return temporaryArray
  }

  // カテゴリ・対象臓器に該当するアイテム名(.Textもしくはkey) のarrayを取得
  //
  // @param {string} カテゴリ
  // @param {string} 対象続器 - 空白もしくはundefinedの場合はカテゴリ内すべて
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
  //
  // return: array
  ItemTexts (category = '', target, year = this.YearofMaster) {
    if ((year).toString() === '') {
      year = this.YearofMaster
    }
    if (year < 2019) {
      year = 2019
    }

    const temporaryArray = []

    if (!category) {
      return temporaryArray
    }

    for (const targetname of (target ? [target] : this.Targets(category))) {
      temporaryArray.push(...this[category][targetname]
        .map(item => Master.parseItem(item, 'Text', year))
        .filter(item => item)
      )
    }
    return Array.from(new Set(temporaryArray))
  }

  // カテゴリ・対象続器・アイテム名称に合致するアイテムobject を取得
  //
  // @param {string} アイテム名(.Text)
  // @param {string} カテゴリ
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
  //
  // return: object
  getItem (text = '', category = '', target, year = this.YearofMaster) {
    if (year < 2019) {
      year = 2019
    }

    if (!text || !category) {
      return {}
    }

    for (const targetname of (target ? [target] : this.Targets(category))) {
      const item = this[category][targetname].find(item => Master.parseItem(item, 'Text', year) === text)
      if (item !== undefined) {
        return item
      }
    }
  }

  // アイテムobject のプロパティを取得
  // アイテムobjectが 名称(string)の場合 それを プロパティ Text として解釈する.
  // 年次が設定されており無効な場合や, 該当プロパティが無い場合は undefined
  //
  // @param {any} ３層目の値
  // @param {string}  プロパティ名 デフォルトはText
  // @param {string}  データセットの参照年指定
  //
  // return any
  static parseItem (item, $attribute = 'Text', year = '') {
    if (typeof item === 'object') {
      if (year !== '') {
        if (item.VaildTo && year > item.VaildTo) {
          return undefined
        }
        if (item.VaildFrom && year < item.VaildFrom) {
          return undefined
        }
      }
      return item[$attribute]
    } else {
      if ($attribute === 'Text') {
        return item
      } else {
        return undefined
      }
    }
  }

  // 3層目オブジェクトの題目を取得 - parseItemのラッパー
  //
  // @param {any} ３層目の値
  getText (item) {
    return Master.parseItem(item, 'Text')
  }
}
