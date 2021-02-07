import Master from '@/modules/Masters/Master'
import { ZenToHan } from '@/modules/ZenHanChars'
import * as difflib from 'difflib'

export const LastUpdate = '2021-02-02'
const defaultReference = '2020'

// Description の Values: [] のフォーマット
//
// 要素に '$MULTI$' を含むとDescriptionは複数保持可能となる
//
// $ で終わる文字列が選択された場合はその術式は無効となる(単独選択の場合エラーで登録出来ない)
// [] で囲まれた文字列は選択肢には表示されず、データの可読性を目的に保持される

export default class ProcedureMaster extends Master {
  constructor () {
    super({
      腹腔鏡: {
        子宮: [
          {
            Text: '子宮内膜症病巣除去術',
            Kcode: ['K863']
          },
          {
            Text: '子宮付属器癒着剥離術',
            Kcode: ['K886-00-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020',
            Kcode: ['K912-00-02']
          },
          {
            Text: '腟式子宮全摘出術(LAVH)',
            Ditto: ['子宮腟上部切断術(腹腔鏡下)', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術'],
            Kcode: ['K877-02']
          },
          {
            Text: '子宮腟上部切断術(腹腔鏡下)',
            Kcode: ['K876-02']
          },
          {
            Text: '子宮全摘出術(TLH,LH)',
            Ditto: ['腟式子宮全摘出術(LAVH)', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術'],
            Kcode: ['K877-02']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡補助下)'],
            Kcode: ['K872-02', 'K878-02']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡補助下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡下)'],
            Kcode: ['K872-02', 'K878-02']
          },
          '子宮腺筋症病巣除去術(腹腔鏡下)',
          '腹腔内観察',
          '骨盤臓器脱修復術',
          {
            Text: '仙骨腟固定術',
            Kcode: ['K865-02']
          },
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            },
            VaildFrom: '2020',
            Kcode: ['K888-00-02']
          },
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          }
        ],
        付属器: [
          {
            Text: '子宮内膜症病巣除去術',
            Kcode: ['K863-00-00']
          },
          // 2020 表記変更 子宮付属器嚢胞摘出術(チョコレート嚢胞) -> 子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)
          {
            Text: '子宮付属器嚢胞摘出術(チョコレート嚢胞)',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)',
            VaildFrom: '2020',
            Kcode: ['K863', 'K887-00-02', 'K888-00-02']
          },
          {
            Text: '子宮付属器嚢胞摘出術(その他)',
            Kcode: ['K887-00-02', 'K888-00-02']
          },
          // 2020 表記変更 子宮付属器切除術(チョコレート嚢胞) -> 子宮付属器切除術(子宮内膜症性嚢胞)
          {
            Text: '子宮付属器切除術(チョコレート嚢胞)',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器切除術(子宮内膜症性嚢胞)',
            VaildFrom: '2020',
            Kcode: ['K863-00-00', 'K888-00-02']
          },
          {
            Text: '子宮付属器切除術(その他)',
            Kcode: ['K888-00-02', 'K913-02-02']
          },
          {
            Text: '子宮付属器癒着剥離術',
            Kcode: ['K886-00-02']
          },
          {
            Text: '卵巣多孔術(開孔術)',
            Kcode: ['K887-04-00']
          },
          {
            Text: '卵管結紮術',
            Kcode: ['K887-02-02']
          },
          {
            Text: '卵管形成術',
            Kcode: ['K887-03-02', 'K888-02-02', 'K890-03-00']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(卵管摘出術) -> 異所性妊娠手術(卵管摘出術)
          {
            Text: '異所性(子宮外)妊娠手術(卵管摘出術)',
            Ditto: ['異所性(子宮外)妊娠手術(卵管線状切開術)'],
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管摘出術)',
            Ditto: ['異所性妊娠手術(卵管線状切開術)', '異所性妊娠手術(その他)'],
            VaildFrom: '2020',
            Kcode: ['K912-00-02', 'K888-02-02', 'K887-03-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(卵管摘出術) -> 異所性妊娠手術(卵管摘出術)
          {
            Text: '異所性(子宮外)妊娠手術(卵管線状切開術)',
            Ditto: ['異所性(子宮外)妊娠手術(卵管摘出術)'],
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管線状切開術)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(その他)'],
            VaildFrom: '2020',
            Kcode: ['K912-00-02', 'K888-02-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020',
            Kcode: ['K912-00-02']
          },
          {
            Text: '卵管切除術',
            Kcode: ['K888-02-02']
          },
          '腹腔内観察',
          {
            Text: '上記以外の付属器手術',
            Kcode: ['K913-02-02']
          },
          // 2020 表記変更 チョコレート嚢胞エタノール固定術 -> 卵巣嚢腫エタノール固定術(子宮内膜症性嚢胞含む)
          {
            Text: 'チョコレート嚢胞エタノール固定術',
            VaildTo: '2019'
          },
          {
            Text: '卵巣嚢腫エタノール固定術(子宮内膜症性嚢胞含む)',
            VaildFrom: '2020',
            Kcode: ['J017-00-00']
          },
          // 2020 新規
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            },
            VaildFrom: '2020',
            Kcode: ['K877-02-00', 'K888-00-02', 'K888-02-02']
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            },
            VaildFrom: '2020',
            Kcode: ['K888-00-02']
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            VaildFrom: '2020'
          },
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          }
        ],
        その他: [
          {
            Text: '子宮内膜症病巣除去術',
            Kcode: ['K863-00-00']
          },
          {
            Text: '子宮付属器癒着剥離術',
            Kcode: ['K886-00-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020'
          },
          {
            Text: '造腟術',
            Kcode: ['K859-02-00']
          },
          {
            Text: '腹腔内観察',
            Kcode: ['D314-00-00', 'K636-03-00']
          },
          '骨盤臓器脱修復術',
          {
            Text: '仙骨腟固定術',
            Kcode: ['K865-02']
          },
          '術後合併症の修復術'
        ]
      },
      腹腔鏡悪性: {
        子宮: [
          {
            Text: '腹腔鏡下単純子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: ['腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: '腹腔鏡下準広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: ['腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下単純子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: '腹腔鏡下広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: ['腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下単純子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: '腹腔鏡下子宮頸部摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清'
          },
          {
            Text: '腹腔鏡下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            },
            Kcode: ['K627-02-01', 'K627-02-02', 'K627-02-03']
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            VaildTo: '2019'
          },
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            },
            Kcode: ['K877-02-00', 'K888-00-02', 'K888-02-02']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患による子宮全摘出術',
            VaildFrom: '2020',
            Kcode: ['K877-02-00']
          },
          // 2020 新規
          {
            Text: '再発病巣の摘出術',
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            VaildFrom: '2020',
            Kcode: ['D314-00-00', 'K636-03-00', 'K636-04-00']
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          '術後合併症の修復術'
        ],
        付属器: [
          // 2020 実装変更
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            VaildTo: '2019'
          },
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            VaildFrom: '2020',
            Kcode: ['D314-00-00', 'K636-03-00', 'K636-04-00']
          },
          {
            Text: '腹腔鏡下付属器摘出術',
            Description: {
              Text: '大網切除・生検',
              Values: ['[大網切除・生検]あり', '[大網切除・生検]なし']
            },
            Kcode: ['K888-00-02', 'K642-02-00']
          },
          {
            Text: '腹腔鏡下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            }
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            VaildTo: '2019'
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$MULTI$']
            },
            VaildFrom: '2020',
            Kcode: ['K888-00-02']
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '転移性卵巣癌による付属器摘出術',
            Description: {
              Text: '大網切除・生検',
              Values: ['[大網切除・生検]あり', '[大網切除・生検]なし']
            },
            Kcode: ['K888-00-02']
          },
          // 2020 新規
          {
            Text: '再発病巣の摘出術',
            VaildFrom: '2020'
          },
          '術後合併症の修復術'
        ],
        その他: [
          // 2020 実装変更
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            VaildTo: '2019'
          },
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            VaildFrom: '2020',
            Kcode: ['D314-00-00', 'K636-03-00', 'K636-04-00']
          },
          // 2020 新規
          {
            Text: '再発病巣の摘出術',
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          // 2020 削除
          {
            Text: 'Second Look Operation',
            VaildTo: '2019'
          },
          '術後合併症の修復術'
        ]
      },
      ロボット: {
        子宮: [
          {
            Text: '子宮全摘出術(ロボット支援下)',
            Kcode: ['K877-02-00']
          },
          '骨盤臓器脱修復術(ロボット支援下)',
          'ロボット支援下その他'
        ],
        付属器: [
          'ロボット支援下その他'
        ],
        その他: [
          '骨盤臓器脱修復術(ロボット支援下)',
          {
            Text: '仙骨腟固定術(ロボット支援下)',
            Kcode: ['K865-02-00']
          },
          'ロボット支援下その他'
        ]
      },
      ロボット悪性: {
        子宮: [
          {
            Text: 'ロボット支援下単純子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: ['ロボット支援下準広汎子宮全摘出術', 'ロボット支援下広汎子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: 'ロボット支援下準広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: ['ロボット支援下単純子宮全摘出術', 'ロボット支援下広汎子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: 'ロボット支援下広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: ['ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術'],
            Kcode: ['K879-02-00']
          },
          {
            Text: 'ロボット支援下子宮頸部摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清'
          },
          {
            Text: 'ロボット支援下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            }
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          // 2020 削除
          {
            Text: 'Second Look Operation',
            VaildTo: '2019'
          },
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患によるロボット支援下子宮全摘出術',
            VaildFrom: '2020',
            Kcode: ['K877-02-00']
          }
        ]
      },
      子宮鏡: {
        子宮: [
          {
            Text: '子宮筋腫摘出術',
            Kcode: ['K872-03-01', 'K872-03-02', 'K873-00-01', 'K873-00-02']
          },
          {
            Text: '子宮内膜ポリープ摘出術',
            Kcode: ['K872-03-01', 'K872-03-02']
          },
          {
            Text: '子宮内腔癒着剥離術',
            Kcode: ['K863-02-00']
          },
          {
            Text: '子宮鏡下子宮中隔切除術',
            Kcode: ['K863-02-00']
          },
          '子宮形成術',
          {
            Text: '子宮内膜焼灼術',
            Kcode: ['K863-03-00']
          },
          {
            Text: '胎盤ポリープ・胎盤遺残摘出術',
            Kcode: ['K861-00-00', 'K872-03-01', 'K872-03-02']
          },
          // 2020 新規
          {
            Text: '帝王切開瘢痕症候群創部切除術',
            VaildFrom: '2020'
          },
          {
            Text: '子宮鏡検査・内膜剥爬術',
            Kcode: ['D320-00-00', 'D322-00-00', 'K861-00-00']
          },
          '異物除去術',
          {
            Text: '子宮頸管ポリープ切除術',
            Kcode: ['K866-00-00']
          },
          '上記以外の子宮体部腫瘍切除術'
        ]
      },
      卵管鏡: {
        卵管: [
          // 2020 表記変更 腹腔鏡併用は付随情報へ
          {
            Text: '卵管鏡下卵管形成術(単独)',
            VaildTo: '2019'
          },
          // 2020 表記変更 腹腔鏡併用は付随情報へ
          {
            Text: '卵管鏡下卵管形成術(腹腔鏡併用)',
            VaildTo: '2019'
          },
          {
            Text: '卵管鏡下卵管形成術',
            Description: {
              Text: '実施形態',
              Values: ['卵管鏡単独', '腹腔鏡併用']
            },
            VaildFrom: '2020',
            Kcode: ['K890-02-00']
          }
        ]
      }
    },
    // デフォルト参照されるマスター年次設定
    defaultReference)
  }

  // ProcedureMasterのstaticメソッド
  // itemは術式への参照
  // - parseItemはMasterからの継承
  // - 該当項目がなければ undefined を返す
  // @param {object/string} 第三層の項目
  static getAdditioninalProcedure (item) {
    return this.parseItem(item, 'AdditionalProcedure')
  }

  static getDittos (item) {
    return this.parseItem(item, 'Ditto')
  }

  static getDescriptionObject (item) {
    return this.parseItem(item, 'Description')
  }

  static getCodes (item) {
    return this.parseItem(item, 'Kcode')
  }

  static getDescriptionTitle (item) {
    return (this.getDescriptionObject(item))
      ? this.getDescriptionObject(item).Text
      : undefined
  }

  static getDescriptionValue (item) {
    return (this.getDescriptionObject(item))
      ? this.getDescriptionObject(item).Values.filter(value => value !== '$MULTI$')
      : []
  }

  static isDescriptionMultiple (item) {
    return this.getDescriptionObject(item).Values.findIndex(value => value === '$MULTI$') >= 0
  }

  // CloseMatch
  Matches (text, category = '', target = '', year = this.YearofMaster) {
    const source = translation(text)
    if (source === '') {
      return []
    }
    const flattenitems = this.Items(category, target, year)
    const matcheditemtitles = []
    // ステップ1 ～正規化しての完全一致
    // これで一致するものがあったら重複を排除して返す
    for (const item of flattenitems) {
      if (
        source === this.getText(item) ||
        matchCode(item, source)
      ) {
        matcheditemtitles.push(this.getText(item))
      }
    }
    if (matcheditemtitles.length > 0) {
      return matcheditemtitles.filter((item, index, self) => self.indexOf(item) === index)
    }
    // ステップ2 ～closematch
    return difflib.getCloseMatches(
      source,
      flattenitems.map(item => this.getText(item)),
      12, 0.34 // cut and tryでの適応値
    ).filter((item, index, self) => self.indexOf(item) === index)
  }
}

// eslint-disable-next-line no-unused-vars
const MEDISprocedures = {}

const ruleset1 = {
  // 修飾語の除去
  緊急: '',
  補助: '',
  // 一般的なゆらぎの内容
  附属器: '付属器',
  膣: '腟',
  頚: '頸',
  '(瘤|下垂)': '脱',
  がん: '癌',
  チョコレート: '子宮内膜症性',
  剔出: '摘出',
  '(のう|嚢)(腫|胞)': '嚢$2',
  '(嚢(腫|胞))核出': '$1摘出',
  全摘出: '全摘'
}

const ruleset2 = {
  '全?腹腔鏡下子宮全摘': 'K877-02-00',
  'T?LA?M': 'K872-02-00',
  '(子宮外|(卵管(角|峡|狭|間質|膨大)部|間質部|瘢痕部?))妊娠': '異所性妊娠',
  エタノール固定: 'J017-00-00',
  トラケレクトミー: '腹腔鏡下子宮頸部摘出術',
  セカンドルック: 'SecondLookOperation',
  子宮亜全摘: '子宮腟上部切断',

  'D&C': '剥爬術',
  アブレーション: 'K863-03-00',
  IUD: '異物除去術',
  LSC: '仙骨腟固定術',
  MEA: 'K863-03-00',
  SO: '付属器切除術',
  TLC: '嚢胞摘出術',
  'TCR-?P': 'K872-03-02',
  'TCRis-?P': 'K872-03-01',
  'TCR-?M': 'K873-00-02',
  'TCRis-?M': 'K873-00-01'
}

function translation (str = '') {
  // 型変換と余白の削除
  let searchstring = str.toString().trim()
  if (searchstring === '') {
    return ''
  }
  // 全角英数の半角変換
  searchstring = ZenToHan(searchstring)

  // 連結文字列の検索、連結が発見されたら例外を発生させる
  if (/[ ,.()､、｡。\t]+/.test(searchstring)) {
    throw new Error('区切り文字で区切られた複数項目からなる入力は許容されません.')
  }

  // 置換1 - 文字列の全置換
  for (const rule of Object.keys(ruleset1)) {
    const regex = new RegExp(rule, 'g')
    searchstring = searchstring.replace(regex, ruleset1[rule])
  }

  // 置換2 - 文字列からの検索して置き換え
  for (const rule of Object.keys(ruleset2)) {
    const regex = new RegExp(rule, 'i')
    if (regex.test(searchstring)) {
      searchstring = ruleset2[rule]
    }
  }

  return searchstring
}

function matchCode (item, value) {
  const codes = this.getCodes(item)
  if (codes === undefined) {
    return false
  }
  // matches $1 - code $3 - subcode $5 - subcode2
  const codebreaker = /^([A-Z]\d{3})(-0{0,1}(\d)){0,1}(-0{0,1}(\d)){0,1}/i
  const valuegroups = (value.toLocaleUpperCase() + '-0-0').match(codebreaker)
  if (valuegroups !== null) {
    for (const code of codes) {
      const breakedcode = code.match(codebreaker)
      if (
        valuegroups[1] === breakedcode[1] &&
        valuegroups[3] === breakedcode[3] &&
        valuegroups[5] === breakedcode[5]
      ) {
        return true
      }
    }
  }
  return false
}
