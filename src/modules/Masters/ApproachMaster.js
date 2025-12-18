export const LastUpdate = '2025-10-01'
const defaultReference = '2025'

export default class ApproachMaster {
  constructor (argYear = defaultReference) {
    Object.defineProperty(this, 'year', { value: argYear || defaultReference, enumerable: false, writable: false })

    const year = this.year
    // マスタデータ定義
    // $で終わるプロパティはマスタ情報としてnon-enumerableに設定
    //
    // カテゴリプロパティの内容は配列で、各要素(行)はオブジェクトで指定
    // oneof - 必須選択肢 各カテゴリに1つ
    // anyof - 任意選択肢 複数選択可
    // check - チェックボックス 複数選択可
    //
    // 各選択肢の最後に $ が付く場合、その選択肢はデフォルト値設定用には含めない
    const approachMasterSets = year <= '2024' ? {
      'requirement$': 'none'
    } : {
      'title$': (
        year === '2025' ?
          '腹腔鏡・ロボット・子宮鏡手術のアプローチ法が入力可能です.' :
          '腹腔鏡・ロボット・子宮鏡手術はアプローチ法の入力が必要です.'
        ),
      'requirement$': (
        year === '2025' ?
          'optional' :
          'mandatory'
      ),
      '腹腔鏡': [
        {
          oneOf: ['通常ポート配置', '[単孔/]RPS', 'VNOTES', 'つり上げ法']
        },
        {
          anyOf: ['腹腔内アプローチ[(リンパ節処理)]', '後腹膜アプローチ[(リンパ節処理)]']
        },
        {
          check: ['治療のため開腹移行$']
        }
      ],
      'ロボット': [
        {
          oneOf: ['da Vinci[ Si,X,Xi,5]', 'da Vinci SP', 'Hugo', 'hinotori', 'Saroa']
        },
        {
          anyOf: ['腹腔内アプローチ[(リンパ節処理)]', '後腹膜アプローチ[(リンパ節処理)]']
        },
        {
          check: ['ダブルバイポーラ']
        },
        {
          check: ['治療のため腹腔鏡に移行$', '治療のため開腹移行$']
        }
      ]
      ,
      '子宮鏡': [
        {
          oneOf: [
            'レゼクトスコープ 電解質溶液使用', 'レゼクトスコープ 非電解質溶液使用',
            '細径子宮鏡', '軟性子宮鏡', 'シェーバー'
          ]
        }
      ]
    }

    // カテゴリマップとカラーマップを定義(基本的に年次に左右されない)
    approachMasterSets['categorymap$'] = {
      '腹腔鏡': '腹腔鏡',
      '腹腔鏡悪性': '腹腔鏡',
      'ロボット': 'ロボット',
      'ロボット悪性': 'ロボット',
      '子宮鏡': '子宮鏡'
    }

    approachMasterSets['colormap$'] = {
      'undefined': '#DDDDDD',
      '腹腔鏡': '#8CF700',
      'ロボット': '#00F063',
      '子宮鏡': '#00BBFF',
      '卵管鏡': '#FFD000'
    }

    // マスタデータをプロパティとして設定
    for(const key in approachMasterSets) {
      if (key.slice(-1) === '$') {
        const propertyName = key.slice(0, -1)
        Object.defineProperty(this, propertyName, { value: approachMasterSets[key], enumerable: false, writable: false })
        continue
      } else {
        Object.defineProperty(this, key, { value: approachMasterSets[key] || {}, enumerable: true, writable: false })
      }
    }
  }

  // マスタ年次を取得
  getYear () {
    return this.year
  }

  /**
   * マスタに設定されたタイトル文字列を取得
   */
  getTitle () {
    return this?.title || ''
  }

  /**
   * カテゴリから必須かどうかを判断
   */
  getRequirement (categories = []) {
    const mappedCategories = categories.map(category => this.mapCategory(category)).filter(category => category !== undefined)
    if (mappedCategories.length === 0) {
      return 'none'
    }

    return this.requirement
  }

  /**
   * カテゴリマップで置換
   */
  mapCategory (category) {
    if (!this?.categorymap) {
      return undefined
    }
    return this.categorymap[category] || undefined
  }

  /**
   * カラーコードを取得
   */
  getColorCode (category) {
    if (this.colormap[category]) {
      return this.colormap[category]
    }
    const mappedCategory = this.mapCategory(category) || 'undefined'
    return (this.colormap[mappedCategory] || this.colormap['undefined'])
  }

  /**
   * 有効なカテゴリー一覧の和集合を取得
   */
  getCategories (categories = []) {
    if (categories === undefined || categories.length === 0) {
      return Object.keys(this)
    }

    const mappedCategories = categories
      .map(category => this.mapCategory(category))
      .filter(category => category !== undefined)
      .reduce((acc, category) => {
        if (!acc.includes(category)) {
          acc.push(category)
        }
        return acc
      }, [])
    return Object.keys(this).filter(category => mappedCategories.includes(category))
  }

  /**
   * 指定されたカテゴリのツリーを取得
   *
   * @param {*} argCategories - 取得するカテゴリ名の配列、もしくは単一のカテゴリ名。未指定の場合は全カテゴリ
   * @param {boolean} asDefaultValues - trueの場合、値の最後に $ が含まれるものは除外する(デフォルト値設定用)
   */
  getTree (argCategories, asDefaultValues = false) {
    const categories = new Set()

    if (typeof argCategories === 'string' && Object.keys(this?.categorymap || {}).includes(argCategories)) {
      categories.add(this.mapCategory(argCategories))
    }
    if (typeof argCategories === 'object' && Array.isArray(argCategories)) {
      if (argCategories.length === 0) {
        Object.keys(this).forEach(category => categories.add(category))
      } else {
        for (const category of argCategories) {
          if (Object.keys(this?.categorymap || {}).includes(category)) {
            categories.add(this.mapCategory(category))
          }
        }
      }
    }
    if (typeof argCategories === 'undefined') {
      Object.keys(this).forEach(category => categories.add(category))
    }

    // 選択されたツリーを返す
    const tree = {}
    for (const category of Object.keys(this)) {
      if (!categories.has(category)) {
        continue
      }
      tree[category] = []

      // 値の最後に $ が含まれる場合はデフォルト値設定対象から除外
      // ツリーの値としては $ は除いたものを使用
      for (const directive of this[category]) {
        const directiveType = Object.keys(directive)[0]
        const values = []
        for (const value of directive[directiveType]) {
          if (value.slice(-1) === '$') {
            if (!asDefaultValues) {
              values.push(value.slice(0, -1))
            }
          } else {
            values.push(value)
          }
        }
        if (values.length > 0) {
          tree[category].push({ [directiveType]: [...values] })
        }
      }
    }
    return tree
  }

  /**
   * selectionオブジェクトの内容をチェックする
   *
   * @param { *} selection
   */
  check (selection = {}) {
    for(const category in selection) {
      // 不正なカテゴリのチェック
      if (!Object.keys(this).includes(category)) {
        throw new Error(`不正なカテゴリ入力 ${category} があります.`)
      }

      // 不正な入力項目のチェック
      const validItems = this[category]
        .map(directive => directive[Object.keys(directive)[0]]
        .map(item => ApproachMaster.asValue(item)))
        .flat()
      const difference = Array.from((new Set(selection[category])).difference(new Set(validItems)))
      if (difference.length > 0) {
        throw new Error(`${category}のアプローチに不正な入力 ${difference.join(',')} があります.`)
      }

      // 必須入力項目(oneOf)のチェック oneOfには $ 修飾子の項目はない
      const selected = []
      for (const directive of this[category]) {
        if (directive?.oneOf) {
          if (selection[category]) {
            selected.push(...selection[category].filter(item => directive.oneOf.map(item => ApproachMaster.asValue(item)).includes(item)))
          }
        }
      }
      if (selected.length === 0) {
        throw new Error(`${category}のアプローチに必須選択肢が入力されていません.`)
      }
      if (selected.length > 1) {
        throw new Error(`${category}のアプローチに複数の必須選択肢が入力されています.`)
      }
    }
  }

  /**
   * マスタ文字列から値に変換 (static)
   */
  static asValue (value = '') {
    if (value.slice(-1) === '$') {
      value = value.slice(0, -1)
    }
    return value.replace(/\[.*\]/, '')
  }

  /**
   * マスタ文字列から表示用文字列に変換 (static)
   */
  static asLabel (value = '') {
    if (value.slice(-1) === '$') {
      value = value.slice(0, -1)
    }
    return value.replace(/[\[\]]/g, '')
  }

  /**
   * 値から表示用文字列に変換
   */
  valueToLabel (value = '', category = undefined) {
    const tree = this.getTree(category)
    for (const treecategory in tree) {
      const directives = tree[treecategory]
      for (const directive of directives) {
        const directiveType = Object.keys(directive)[0]
        const foundIndex = directive[directiveType].findIndex(item => ApproachMaster.asValue(item) === value)
        if (foundIndex !== -1) {
          return ApproachMaster.asLabel(directive[directiveType][foundIndex])
        }
      }
    }
  }
}
