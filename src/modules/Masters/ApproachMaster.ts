export const LastUpdate = '2025-10-01'
const defaultReference = '2025'

type ApproachDirective = Record<string, string[]>
type ApproachMasterSets = Record<string, string | ApproachDirective[] | Record<string, string>>

export default class ApproachMaster {
  declare readonly year: string
  declare readonly title: string | undefined
  declare readonly requirement: string
  declare readonly categorymap: Record<string, string | undefined>
  declare readonly colormap: Record<string, string | undefined>

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
    const approachMasterSets: ApproachMasterSets = year <= '2024' ? {
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
  getYear (): string {
    return this.year
  }

  /**
   * マスタに設定されたタイトル文字列を取得
   */
  getTitle (): string {
    return this?.title || ''
  }

  /**
   * カテゴリから必須かどうかを判断
   */
  getRequirement (categories: string[] = []): string {
    const mappedCategories = categories.map(category => this.mapCategory(category)).filter(category => category !== undefined)
    if (mappedCategories.length === 0) {
      return 'none'
    }

    return this.requirement
  }

  /**
   * カテゴリマップで置換
   */
  mapCategory (category: string): string | undefined {
    if (!this?.categorymap) {
      return undefined
    }
    return this.categorymap[category] || undefined
  }

  /**
   * カラーコードを取得
   */
  getColorCode (category: string): string {
    if (this.colormap[category]) {
      return this.colormap[category]!
    }
    const mappedCategory = this.mapCategory(category) || 'undefined'
    return (this.colormap[mappedCategory] || this.colormap['undefined'])!
  }

  /**
   * 有効なカテゴリー一覧の和集合を取得
   */
  getCategories (categories: string[] = []): string[] {
    if (categories === undefined || categories.length === 0) {
      return Object.keys(this)
    }

    const mappedCategories = categories
      .map(category => this.mapCategory(category))
      .filter((category): category is string => category !== undefined)
      .reduce((acc, category) => {
        if (!acc.includes(category)) {
          acc.push(category)
        }
        return acc
      }, [] as string[])
    return Object.keys(this).filter(category => mappedCategories.includes(category))
  }

  /**
   * 指定されたカテゴリのツリーを取得
   *
   * @param {*} argCategories - 取得するカテゴリ名の配列、もしくは単一のカテゴリ名。未指定の場合は全カテゴリ
   * @param {boolean} asDefaultValues - trueの場合、値の最後に $ が含まれるものは除外する(デフォルト値設定用)
   */
  getTree (argCategories?: string | string[], asDefaultValues = false): Record<string, ApproachDirective[]> {
    const categories = new Set<string>()

    if (typeof argCategories === 'string' && Object.keys(this?.categorymap || {}).includes(argCategories)) {
      const mapped = this.mapCategory(argCategories)
      if (mapped !== undefined) {
        categories.add(mapped)
      }
    }
    if (typeof argCategories === 'object' && Array.isArray(argCategories)) {
      if (argCategories.length === 0) {
        Object.keys(this).forEach(category => categories.add(category))
      } else {
        for (const category of argCategories) {
          if (Object.keys(this?.categorymap || {}).includes(category)) {
            const mapped = this.mapCategory(category)
            if (mapped !== undefined) {
              categories.add(mapped)
            }
          }
        }
      }
    }
    if (typeof argCategories === 'undefined') {
      Object.keys(this).forEach(category => categories.add(category))
    }

    // 選択されたツリーを返す
    const tree: Record<string, ApproachDirective[]> = {}
    for (const category of Object.keys(this)) {
      if (!categories.has(category)) {
        continue
      }
      tree[category] = []

      // 値の最後に $ が含まれる場合はデフォルト値設定対象から除外
      // ツリーの値としては $ は除いたものを使用
      const categoryData = ((this as unknown as Record<string, ApproachDirective[] | undefined>)[category] || []) as ApproachDirective[]
      for (const directive of categoryData) {
        const directiveType = Object.keys(directive)[0] as string
        const values: string[] = []
        for (const value of (directive[directiveType] || [])) {
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
  check (selection: Record<string, string[]> = {}): void {
    for(const category in selection) {
      // 不正なカテゴリのチェック
      if (!Object.keys(this).includes(category)) {
        throw new Error(`不正なカテゴリ入力 ${category} があります.`)
      }

      // 不正な入力項目のチェック
      const categoryData = ((this as unknown as Record<string, ApproachDirective[] | undefined>)[category] || []) as ApproachDirective[]
      const validItems = categoryData
        .map(directive => {
          const key = Object.keys(directive)[0] as string
          return (directive[key] || []).map(item => ApproachMaster.asValue(item))
        })
        .flat()
      const difference = (selection[category] || []).filter(item => !validItems.includes(item))
      if (difference.length > 0) {
        throw new Error(`${category}のアプローチに不正な入力 ${difference.join(',')} があります.`)
      }

      // 必須入力項目(oneOf)のチェック oneOfには $ 修飾子の項目はない
      const selected: string[] = []
      for (const directive of categoryData) {
        if (directive?.['oneOf']) {
          if (selection[category]) {
            selected.push(...(selection[category] || []).filter(item => (directive['oneOf'] || []).map((it: string) => ApproachMaster.asValue(it)).includes(item)))
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
  static asValue (value: string = ''): string {
    if (value.slice(-1) === '$') {
      value = value.slice(0, -1)
    }
    return value.replace(/\[.*\]/, '')
  }

  /**
   * マスタ文字列から表示用文字列に変換 (static)
   */
  static asLabel (value: string = ''): string {
    if (value.slice(-1) === '$') {
      value = value.slice(0, -1)
    }
    return value.replace(/[\[\]]/g, '')
  }

  /**
   * 値から表示用文字列に変換
   */
  valueToLabel (value: string = '', category?: string | string[]): string | undefined {
    const tree = this.getTree(category)
    for (const treecategory in tree) {
      const directives = tree[treecategory] || []
      for (const directive of directives) {
        const directiveType = Object.keys(directive)[0] as string
        const directiveValues = directive[directiveType] || []
        const foundIndex = directiveValues.findIndex(item => ApproachMaster.asValue(item) === value)
        if (foundIndex !== -1) {
          return ApproachMaster.asLabel(directiveValues[foundIndex] || '')
        }
      }
    }
  }
}
