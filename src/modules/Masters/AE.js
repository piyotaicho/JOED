export const LastUpdate = '2022-11-27'
const defaultReference = '2022'

export default class AEmaster {
  constructor (year) {
    if (year === undefined || year === '') {
      year = defaultReference
    }

    if (/^20[0-9]{2}/.test(year)) {
      Object.defineProperty(this, 'YearofMaster', {
        value: year.substring(0, 4)
      })
    } else {
      throw Error('マスターの日付シリアル指定に問題があります.')
    }

    // マスターのプロパティ設定
    Object.defineProperties(this, {
      // 基本カテゴリー
      Category: {
        writable: false,
        enumerable: true,
        value: [
          {
            Text: '総出血量500ml以上',
            Value: '出血',
            Components: ['Bloodcount']
          },
          {
            Text: '術中手術操作に伴う合併症・偶発症',
            Value: '術中手術操作',
            Components: ['Injuries', 'Locations']
          },
          {
            Text: '気腹・潅流操作に伴う合併症・偶発症',
            Value: '気腹・潅流操作',
            // 2022年より変更
            Components:
              (this.YearofMaster >= '2022'
                ? ['Irrigation']
                : ['Irrigation', 'Locations']
              )
          },
          {
            Text: '機器の不具合・破損に伴う合併症・偶発症',
            Value: '機器の不具合・破損',
            Components: ['Devices', 'Injuries', 'Locations'],
            Optional: ['Injuries']
          },
          {
            Text: '機器の誤操作に伴う合併症・偶発症',
            Value: '機器の誤操作',
            Components: ['Devices', 'Injuries', 'Locations'],
            // 2022年より変更 内容の必須化
            Optional: (this.YearofMaster >= '2022' ? [] : ['Injuries'])
          },
          {
            Text: '術中使用した薬剤に伴う合併症',
            Value: '術中使用した薬剤',
            Components: ['Medicines', 'Events']
          },
          {
            Text: '体腔内遺残',
            Value: '体腔内遺残',
            Components: ['Remnunts']
          },
          {
            Text: '術後合併症',
            Value: '術後',
            Components: ['Complications']
          }
        ]
      },

      // 内容入力用コンポーネントの項目
      Components: {
        writable: false,
        enumerable: true,
        value: {
          Bloodcount: {
            Title: '出血量',
            Element: 'BloodCount'
          },
          Injuries: {
            Title: '発生した合併症',
            Element: 'Title',
            Items: [
              ['臓器損傷', '出血']
            ]
          },
          Irrigation: {
            Title: '発生した合併症',
            Element: 'Title',
            Items: [
              [
                // 2022年より 表記変更
                (this.YearofMaster >= '2022'
                  ? '気腫'
                  : '皮下気腫'
                ),
                { Text: '炭酸ガス塞栓', Value: 'ガス塞栓(炭酸ガス)' },
                { Text: '空気塞栓', Value: 'ガス塞栓(空気)' }
              ],
              ['水中毒'],
              // 2022年より 表記変更
              (this.YearofMaster >= '2022'
                ? ['その他 循環器系障害', 'その他 呼吸器系障害', 'その他 神経系障害']
                : ['そのほか心臓障害', 'そのほか呼吸器障害', 'そのほか神経系障害']
              ),
              ['上記以外']
            ]
          },
          Devices: {
            Title: '関連する機器',
            Element: 'Cause',
            Items: [
              [
                '鉗子',
                { Text: '内視鏡(スコープ・シース)', Value: '内視鏡' },
                { Text: 'カテーテル・ガイドワイヤー', Value: 'カテーテル' }
              ],
              ['内視鏡関連装置', { Text: '潅流・気腹装置', Value: '潅流気腹装置' }],
              ['トロッカー'],
              [{ Text: '子宮マニピュレーター・腟カップ・パイプ', Value: '子宮操作器具' }],
              [{ Text: '組織回収器具（袋）・モルセレーター', Value: '組織回収器具' }],
              [
                { Text: '血管クリップ・縫合糸', Value: '止血材料' },
                { Text: '自動縫合・吻合器', Value: 'ステープラー' }
              ],
              [{
                Text: '電気メス（モノポーラー・バイポーラー・アルゴンビーム）',
                Value: '電気メス'
              }],
              [
                { Text: '超音波凝固切開装置', Value: 'SUS' },
                { Text: 'ベッセルシーリングシステム', Value: 'VSS' }
              ],
              ['レーザー', 'マイクロ波'],
              ['上記にないもの']
            ]
          },
          Locations: {
            Title: '発生部位',
            Element: 'Location',
            Items: [
              ['子宮', '卵管', '卵巣', '腟'],
              ['膀胱', '尿管', '後腹膜'],
              // 2021年より変更
              (this.YearofMaster >= '2021'
                ? [
                    { Text: '消化管(直腸)', Value: '直腸' },
                    { Text: '消化管(結腸)', Value: '結腸' },
                    { Text: '消化管(その他)', Value: '消化管' }
                  ]
                : ['消化管']
              ),
              ['腹壁', '腹壁血管', '皮下'],
              ['動脈', '静脈', '大血管動脈', '大血管静脈'],
              ['神経',
                // 2021年より追加
                ...(this.YearofMaster >= '2021'
                  ? [{ Text: '骨・骨膜・軟骨', Value: '骨格系' }]
                  : []
                )
              ],
              ['上記にない部位']
            ]
          },
          Medicines: {
            Title: '関連する薬剤',
            Element: 'Cause',
            Items: [
              ['バソプレッシン', 'アドレナリン'],
              ['インジゴカルミン'],
              ['上記にないもの']
            ]
          },
          Events: {
            Title: '発生した合併症',
            Element: 'Title',
            Items: [
              ['アナフィラキシー', '心停止', '徐脈', '頻脈', 'それ以外']
            ]
          },
          Remnunts: {
            Title: '遺残したもの',
            Element: 'Cause',
            Items: [
              ['検体', '器械', 'ガーゼなど衛生材料', '針', '上記にないもの']
            ]
          },
          Complications: {
            Title: '合併症の内容',
            Element: 'Title',
            Items: [
              ['出血', '血腫'],
              ['創部感染', '創離開', '腟断端部離開',
                // 2021年より追加
                ...(this.YearofMaster >= '2021' ? ['メッシュ露出'] : [])
              ],
              ['腹膜炎', '子宮感染', '卵管・卵巣感染',
                // 2021年より追加
                ...(this.YearofMaster >= '2021' ? ['メッシュ感染'] : [])
              ],
              [
                { Text: 'イレウス(腸管麻痺)', Value: 'イレウス' },
                { Text: '腸閉塞(機械的閉塞・絞扼性イレウス)', Value: '腸閉塞' },
                '消化管穿孔'
              ],
              ['腹壁瘢痕・ポートサイトヘルニア'],
              // 2022年より追加
              ...(this.YearofMaster >= '2022'
                ? [['尿管損傷', '尿路閉塞', '膀胱損傷', 'その他 尿路系障害']]
                : [['尿管損傷', '尿路閉塞', '膀胱損傷']]
              ),
              // 2022年より変更・追加
              ...(this.YearofMaster >= '2022'
                ? [
                    ['肺動脈血栓塞栓症', '深部静脈血栓症', '心肺停止'],
                    ['その他 循環器系障害'],
                    ['気胸', 'その他 呼吸器系障害'],
                    ['コンパートメント症候群', 'その他 骨軟部系障害']
                  ]
                : [
                    ['肺動脈血栓塞栓症', '深部静脈血栓症'],
                    ['気胸', '心肺停止', 'コンパートメント症候群']
                  ]
              ),
              ['上肢神経障害', '下肢神経障害',
                // 2022年より追加
                ...(this.YearofMaster >= '2022'
                  ? ['その他 神経系障害']
                  : []
                )
              ],
              ['リンパ浮腫', '非感染性リンパ嚢胞', '感染性リンパ嚢胞・後腹膜膿瘍'],
              ['子宮腔からの出血持続', '子宮腔の癒着', '卵管閉塞']
            ]
          }
        }
      },
      // グレードの表記
      Grading: {
        writable: false,
        enumerable: true,
        value: [
          { Grade: '1', Text: 'Grade 1: 正常な術後経過からの逸脱' },
          { Grade: '2', Text: 'Grade 2: 中等症 輸血および中心静脈栄養を要する場合を含む' },
          { Grade: '3a', Text: 'Grade 3a: 全身麻酔を要さない治療介入を要する' },
          { Grade: '3b', Text: 'Grade 3b: 全身麻酔下での治療介入を要する' },
          { Grade: '4', Text: 'Grade 4: ICU管理を要する、合併症により生命を脅かす状態' },
          { Grade: '5', Text: 'Grade 5: 死亡' }
        ]
      },
      // 転帰
      Courses: {
        writable: false,
        enumerable: true,
        value: [
          {
            Title: 'Grade 1～2',
            Min: 1,
            Max: 2,
            Items: [
              [
                '経過観察',
                { Text: '抗菌薬投与など周術期管理の延長', Value: '周術期管理の延長' },
                '入院期間の延長',
                '再入院'
              ]
            ]
          },
          {
            Title: 'Grade 2',
            Min: 2,
            Max: 2,
            Items: [
              [
                { Text: '輸血～自己血輸血・術中回収血', Value: '自己血輸血・術中回収血' },
                '輸血・血液製剤'
              ]
            ]
          },
          {
            Title: 'Grade 3',
            Min: 3,
            Max: 3,
            Items: [
              [{ Label: '術中の追加手術' }],
              [
                { Text: '開腹', Value: '術中の追加手術～開腹' },
                { Text: '腹腔鏡', Value: '術中の追加手術～腹腔鏡' },
                { Text: '子宮鏡', Value: '術中の追加手術～子宮鏡' },
                { Text: '経腟', Value: '術中の追加手術～経腟' },
                { Text: 'その他', Value: '術中の追加手術～その他' }
              ],
              [{ Label: '術後の再手術' }],
              [
                { Text: '開腹', Value: '術後の再手術～開腹' },
                { Text: '腹腔鏡', Value: '術後の再手術～腹腔鏡' },
                { Text: '子宮鏡', Value: '術後の再手術～子宮鏡' },
                { Text: '経腟', Value: '術後の再手術～経腟' },
                { Text: 'その他,術後のIVRを含む再手術・追加処置', Value: '術後の再手術～その他' }
              ]
            ]
          },
          {
            Title: 'Grade 4',
            Min: 4,
            Max: 4,
            Items: [
              [{ Text: '合併症管理のためのICU入室', Value: 'ICU管理' }]
            ]
          },
          {
            Title: 'Grade 5',
            Min: 5,
            Max: 5,
            Items: [
              ['死亡']
            ]
          }
        ]
      }
    })
    // マスターのプロパティ設定おわり
  }

  // 合併症オブジェクトの妥当性検証
  // エラーの際は例外を発生.
  //
  // @param{object}
  validate (AE = {}) {
    // 合併症の種類毎に入力を確認
    if (!AE.Category) {
      // データがそもそもおかしい
      throw Error('合併症入力にカテゴリ設定のない不正なデータです.')
    }

    // 合併症カテゴリの設計オブジェクトを取得
    const categorySchema = this.Category.find(element => element.Value === AE.Category)
    if (!categorySchema) {
      // 指定されたカテゴリがない
      throw Error(`入力された合併症カテゴリ(${AE.Category})に該当するカテゴリがマスタにありません.`)
    }

    const foundErrors = []

    // 合併症設計のコンポーネント毎に入力があるか検証
    const schemaComponents = categorySchema.Components
    const optionalComponents = categorySchema.Optional || []

    for (const component of schemaComponents) {
      const propertyName = this.Components[component].Element
      if (AE[propertyName] === undefined || AE[propertyName].length === 0) {
        // 該当するコンポーネントの入力なし
        if (!optionalComponents.includes(component)) {
          foundErrors.push(`${this.Components[component].Title} の入力が不十分です.`)
        }
      } else {
        // 該当するコンポーネントの入力あり
        if (component === 'Bloodcount') {
          if (AE.Category !== '出血') {
            foundErrors.push('出血量が入力されています.')
          }
          if (!/^(不明|([1-9]\d+|[5-9])\d{2})$/.test(AE?.BloodCount)) {
            foundErrors.push('出血量の入力内容が不正です.')
          }
        } else {
          const items = this.Components[component].Items
            .flat(2)
            .map(item => (typeof item === 'object') ? item.Value : item)
          for (const item of AE[propertyName]) {
            if (items.indexOf(item) === -1) {
              foundErrors.push(`${this.Components[component].Title} の選択内容(${item})がマスタにありません.`)
            }
          }
        }
      }
    }

    // グレードと転帰の確認 - 最高グレードに相当する転帰が選択されている
    if (AE?.Grade && AE?.Course?.length > 0) {
      if (!/^([1245]|3[ab])$/i.test(AE.Grade)) {
        foundErrors.push('Gradeの指定が不正です.')
      }

      const grade = Number(AE.Grade.toString()[0] | 0)
      let min = 0
      let max = 0
      for (const course of AE.Course) {
        const courseelement = this.Courses
          .find(element => element.Items.flat(2)
            .findIndex(element => typeof element === 'string'
              ? element === course
              : element?.Value === course) !== -1)
        if (courseelement === undefined) {
          foundErrors.push(`転帰(${course})が合併症マスタにありません.`)
        } else {
          min = min < courseelement.Min ? courseelement.Min : min
          max = max < courseelement.Max ? courseelement.Max : max
        }
      }
      if (grade < min || grade > max) {
        foundErrors.push('合併症の程度と転帰が不一致です.')
      }
    } else {
      foundErrors.push('合併症の程度・転帰の入力が不十分です.')
    }

    // 各論チェックにエラーがあったら例外を発生する
    if (foundErrors.length > 0) {
      throw new Error(`合併症 [${categorySchema.Text}]\n${foundErrors.join('\n')}`)
    }

    // ここまでたどり着いたら問題なし
    return true
  }
}
