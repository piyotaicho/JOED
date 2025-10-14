export const LastUpdate = '2025-10-01'
const defaultReference = '2025'

export default class ApproachMaster {
  constructor (argYear = defaultReference) {
    Object.defineProperty(this, 'year', { value: argYear || defaultReference, enumerable: false, writable: false })

    const year = this.year
    const approachMasterSets = year <= '2024' ? {}
    : {
      '腹腔鏡': {
        oneof: ['通常ポート配置', '単孔式/RPS', 'VNOTES', 'つり上げ法'],
        anyof: ['経腹膜アプローチ', '腹膜外アプローチ'],
        check: [
          ['治療のため開腹移行$']
        ]
      },
      'ロボット': {
        oneof: ['da Vinci Si,X,Xi,5', 'da Vinci SP', 'Hugo', 'hinotori', 'Saroa'],
        check: [
          ['ダブルバイポーラ'],
          ['治療のため腹腔鏡に移行$', '治療のため開腹移行$']
        ]
      },
      '子宮鏡': {
        oneof: ['硬性子宮鏡', '細径子宮鏡', '軟性子宮鏡', 'シェーバー'],
        check: [
          ['非電解質溶液使用$']
        ]
      }
    }

    for(const category of Object.keys(approachMasterSets)) {
      Object.defineProperty(this, category, { value: approachMasterSets[category] || {}, enumerable: true, writable: false })
    }
  }

  // マスタ年次を取得
  getYear () {
    return this.year
  }

  /**
   * 指定されたカテゴリのツリーを取得
   *
   * @param {*} argCategories - 取得するカテゴリ名の配列、もしくは単一のカテゴリ名。未指定の場合は全カテゴリ
   * @param {boolean} asDefaultValues - trueの場合、値の最後に $ が含まれるものは除外する(デフォルト値設定用)
   */
  getTree (argCategories, asDefaultValues = false) {
    const categories = []

    if (typeof argCategories === 'string' && Object.keys(this).includes(argCategories)) {
      categories.push(argCategories)
    }
    if (typeof argCategories === 'object' && Array.isArray(argCategories)) {
      for (const category of argCategories) {
        if (Object.keys(this).includes(category) && !categories.includes(category)) {
          categories.push(category)
        }
      }
    }
    if (typeof argCategories === 'undefined') {
      categories.push(...Object.keys(this))
    }

    // 選択されたツリーを返す
    const tree = {}
    for (const category of Object.keys(this)) {
      if (!categories.includes(category)) {
        continue
      }
      tree[category] = {}

      console.log(category)

      // 値の最後に $ が含まれる場合はデフォルト値設定対象から除外
      // ツリーの値としては $ は除いたものを使用
      for (const directive of Object.keys(this[category])) {
        const values = []
        for (const value of this[category][directive]) {
          if (!Array.isArray(value)) {
            if (value.slice(-1) === '$') {
              if (!asDefaultValues) {
                values.push(value.slice(0, -1))
              }
            } else {
              values.push(value)
            }
          } else {
            const subvalues = []
            for (const subvalue of value) {
              if (subvalue.slice(-1) === '$') {
                if (!asDefaultValues) {
                  subvalues.push(subvalue.slice(0, -1))
                }
              } else {
                subvalues.push(subvalue)
              }
            }
            if (subvalues.length > 0) {
              values.push(subvalues)
            }
          }
        }
        if (values.length > 0) {
          tree[category][directive] = values
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
  checkSelection (selection = {}) {
    for(const category of Object.keys(selection)) {
      // 不正な入力項目のチェック
      const validItems = []
      for (const directive of Object.keys(this[category])) {
        validItems.push(...(this[category][directive].flat(2).map(item => item.slice(-1) === '$' ? item.slice(0, -1) : item)))
      }
      const difference = Array.from((new Set(selection[category])).difference(new Set(validItems)))
      if (difference.length > 0) {
        throw new Error(`${category}のアプローチに不正な入力 ${difference.join(',')} があります.`)
      }

      // oneOfの項目選択状態をチェック
      let selected = false
      for (const oneOfItem of this[category]?.oneof || []) {
        if (selection[category]?.includes(oneOfItem)) {
          if (selected) {
            throw new Error(`${category}のアプローチに複数の選択肢が入力されています.`)
            break
          }
          selected = true
        }
      }
      if (!selected) {
        throw new Error(`${category}のアプローチに選択肢が入力されていません.`)
      }
    }
  }
}
