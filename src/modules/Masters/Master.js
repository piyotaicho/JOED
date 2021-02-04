/*
  診断・術式マスタオブジェクト
  new Master ()
  @param {object} 基本となるオブジェクトツリー
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
    for (const keyname of Object.keys(initialTree)) {
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

        Notification: 'お知らせメッセージ'
        VaildFrom: '使用開始年'
        ValidTo: '使用終了年'

        // *** 診断 ***
        Procedure: '強制展開される手技' // 同一カテゴリ・対象であることが必須

        // *** 術式 ***
        Ditto: [同時入力できない同一手技]
        AdditionalProcedure: '同時展開される術式' // 同一カテゴリに限定
        Description: { 補助情報のタイトル: [...候補] } // メンバに $MULTI$ があるときは複数選択, $で終わる候補は選択しても登録されない（主たる術式の場合は選択不可）
      }
    }
  }
  */

  // カテゴリのarrayを取得
  //
  Categories () {
    return Object.keys(this)
  }

  // 対象臓器のarrayを取得
  //
  // @param {string} カテゴリ
  Targets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  // カテゴリ・対象臓器に該当するアイテムのarrayを取得
  //
  // @param {string} カテゴリ
  // @param {string} 対象続器 - 空白もしくはundefinedの場合はカテゴリ内すべて
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
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
      temporaryArray.push(...this[category][targetname])
    }
    return temporaryArray
  }

  // カテゴリ・対象臓器に該当するアイテム名(.Textもしくはキー))のarrayを取得
  //
  // @param {string} カテゴリ
  // @param {string} 対象続器 - 空白もしくはundefinedの場合はカテゴリ内すべて
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
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
    return temporaryArray.filter((item, index, self) => self.indexOf(item) === index)
  }

  // カテゴリ・対象続器・アイテム名称に合致するアイテムを取得
  //
  // @param {string} アイテム名(.Text)
  // @param {string} カテゴリ
  // @param {number/string} データセットの参照年指定(デフォルトはマスタの年次=最新)
  getItem (text = '', category = '', target, year = this.YearofMaster) {
    if (year < 2019) {
      year = 2019
    }

    if (!text || !category) {
      return {}
    }

    for (const targetname of (target ? [target] : this.Targets(category))) {
      return this[category][targetname].find(item => Master.parseItem(item, 'Text', year) === text)
    }
  }

  // 与えられた選択ツリーの３層目の情報を取得する オブジェクトならば指定のプロパティ値 stringの場合はその値
  // データセットの対象以外、もしくは該当プロパティが無い場合は undefined
  //
  // @param {any} ３層目の値
  // @param {string}  プロパティ名 デフォルトはText
  // @param {string}  データセットの参照年指定
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
}
