import Master from '@/modules/Masters/Master'
import Fuse from 'fuse.js'
import { ZenToHan } from '@/modules/ZenHanChars'

export const LastUpdate = '2024-12-01'
const defaultReference = '2024'

const Kcodeformat = /^([A-Z]\d{3})(-0?(\d))?(-0?(\d))?/

// Description の Values: [] のフォーマット
//
// $ で終わる文字列が選択された場合はその術式は登録無効となる(単独選択の場合エラーで登録出来ない)
// [] で囲まれた文字列は選択肢には表示されず、データの可読性を目的に保持される

export default class ProcedureMaster extends Master {
  constructor() {
    super({
      腹腔鏡: {
        子宮: [
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
            ValidTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            ValidFrom: '2020',
            Kcode: ['K9 12-00-02']
          },
          {
            Text: '腟式子宮全摘出術(LAVH)',
            Ditto: [
              '子宮全摘出術(TLH,LH)', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術', 'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K877-02-00']
          },
          {
            Text: '子宮腟上部切断術(腹腔鏡下)',
            Kcode: ['K876-02-00']
          },
          {
            Text: '子宮全摘出術(TLH,LH)',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K877-02-00']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡補助下)'],
            Kcode: ['K872-02-00']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡補助下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡下)'],
            Kcode: ['K872-02-00']
          },
          {
            Text: '子宮腺筋症病巣除去術(腹腔鏡下)'
          },
          {
            Text: '腹腔内観察'
          },
          // 2021 削除
          {
            Text: '骨盤臓器脱修復術',
            ValidTo: '2020'
          },
          {
            Text: '仙骨腟固定術',
            Kcode: ['K865-02-00']
          },
          // 2021 新規
          // 2022 変更 K-コード追加
          {
            Text: '仙骨子宮靭帯縫縮術',
            ValidFrom: '2021',
            ValidTo: '2021'
          },
          {
            Text: '仙骨子宮靭帯縫縮術',
            ValidFrom: '2022',
            Kcode: ['K860-03-00']
          },
          // 2021 新規
          {
            Text: 'その他の骨盤臓器脱修復術',
            ValidFrom: '2021'
          },
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            },
            ValidFrom: '2020',
            Kcode: ['K888-00-02']
          },
          {
            Text: '術後合併症の修復術'
          },
          // 2022 新規
          {
            Text: '腹腔鏡下子宮瘢痕部修復術',
            ValidFrom: '2022',
            Kcode: ['K882-02-00']
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            ValidFrom: '2020'
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
            ValidTo: '2019'
          },
          {
            Text: '子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)',
            ValidFrom: '2020',
            Kcode: ['K863-00-00', 'K887-00-02', 'K888-00-02']
          },
          {
            Text: '子宮付属器嚢胞摘出術(その他)',
            Kcode: ['K887-00-02', 'K888-00-02']
          },
          // 2020 表記変更 子宮付属器切除術(チョコレート嚢胞) -> 子宮付属器切除術(子宮内膜症性嚢胞)
          {
            Text: '子宮付属器切除術(チョコレート嚢胞)',
            ValidTo: '2019'
          },
          {
            Text: '子宮付属器切除術(子宮内膜症性嚢胞)',
            ValidFrom: '2020',
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
            ValidTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管摘出術)',
            Ditto: ['異所性妊娠手術(卵管線状切開術)', '異所性妊娠手術(その他)'],
            ValidFrom: '2020',
            Kcode: ['K912-00-02', 'K888-02-02', 'K887-03-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(卵管摘出術) -> 異所性妊娠手術(卵管摘出術)
          {
            Text: '異所性(子宮外)妊娠手術(卵管線状切開術)',
            Ditto: ['異所性(子宮外)妊娠手術(卵管摘出術)'],
            ValidTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管線状切開術)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(その他)'],
            ValidFrom: '2020',
            Kcode: ['K912-00-02', 'K888-02-02']
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            ValidTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            ValidFrom: '2020',
            Kcode: ['K912-00-02']
          },
          {
            Text: '卵管切除術',
            Kcode: ['K888-02-02']
          },
          {
            Text: '腹腔内観察'
          },
          {
            Text: '上記以外の付属器手術',
            Kcode: ['K913-02-02']
          },
          // 2020 表記変更 チョコレート嚢胞エタノール固定術 -> 卵巣嚢腫エタノール固定術(子宮内膜症性嚢胞含む)
          {
            Text: 'チョコレート嚢胞エタノール固定術',
            ValidTo: '2019'
          },
          {
            Text: '卵巣嚢腫エタノール固定術(子宮内膜症性嚢胞含む)',
            ValidFrom: '2020',
            Kcode: ['J017-00-00']
          },
          // 2020 新規
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            },
            ValidFrom: '2020',
            Kcode: ['K877-02-00', 'K888-00-02', 'K888-02-02']
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            },
            ValidFrom: '2020',
            Kcode: ['K888-00-02']
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            ValidFrom: '2020'
          },
          {
            Text: '術後合併症の修復術'
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            ValidFrom: '2020'
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
            ValidTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            ValidFrom: '2020'
          },
          {
            Text: '造腟術',
            Kcode: ['K859-02-00']
          },
          {
            Text: '腹腔内観察',
            Kcode: ['D314-00-00', 'K636-03-00']
          },
          // 2021 削除
          {
            Text: '骨盤臓器脱修復術',
            ValidTo: '2020'
          },
          {
            Text: '仙骨腟固定術',
            Kcode: ['K865-02-00']
          },
          // 2021 新規
          {
            Text: '仙骨子宮靭帯縫縮術',
            ValidFrom: '2021'
          },
          // 2021 新規
          {
            Text: 'その他の骨盤臓器脱修復術',
            ValidFrom: '2021'
          },
          {
            Text: '術後合併症の修復術'
          }
        ]
      },
      腹腔鏡悪性: {
        子宮: [
          {
            Text: '腹腔鏡下単純子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下広汎子宮全摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K879-02-00']
          },
          {
            Text: '腹腔鏡下準広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K879-02-00']
          },
          {
            Text: '腹腔鏡下広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下準広汎子宮全摘出術', '腹腔鏡下単純子宮全摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
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
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN'],
              Selection: 'one'
            },
            Kcode: ['K627-02-01', 'K627-02-02', 'K627-02-03']
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            ValidTo: '2019'
          },
          // 2024 新規
          {
            Text: '腹腔鏡下骨盤内臓全摘術',
            Kcode: ['K877-02'],
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術', 'ロボット支援下骨盤内臓全摘術'
            ],
            ValidFrom: '2024'
          },
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            },
            Kcode: ['K877-02-00', 'K888-00-02', 'K888-02-02']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患による子宮全摘出術',
            ValidFrom: '2020',
            Kcode: ['K877-02-00']
          },
          // 2020 新規
          {
            Text: '再発病巣の摘出術',
            ValidFrom: '2020'
          },
          // 2020 新規
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            ValidFrom: '2020',
            Kcode: ['D314-00-00', 'K636-03-00', 'K636-04-00']
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            ValidFrom: '2020'
          },
          {
            Text: '治療のために開腹手術へ移行(合併症を除く)'
          },
          {
            Text: '術後合併症の修復術'
          }
        ],
        付属器: [
          // 2020 実装変更
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            ValidTo: '2019'
          },
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            ValidFrom: '2020',
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
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN'],
              Selection: 'one'
            }
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            ValidTo: '2019'
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            ValidFrom: '2020'
          },
          {
            Text: '治療のために開腹手術へ移行(合併症を除く)'
          },
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術'],
              Selection: 'any'
            },
            ValidFrom: '2020',
            Kcode: ['K888-00-02']
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            ValidFrom: '2020'
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
            ValidFrom: '2020'
          },
          {
            Text: '術後合併症の修復術'
          }
        ],
        その他: [
          // 2020 実装変更
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            ValidTo: '2019'
          },
          {
            Text: '腹腔鏡下病変生検・審査腹腔鏡',
            Description: {
              Text: '組織生検',
              Values: ['[生検]あり', '[生検]なし']
            },
            ValidFrom: '2020',
            Kcode: ['D314-00-00', 'K636-03-00', 'K636-04-00']
          },
          // 2020 新規
          {
            Text: '再発病巣の摘出術',
            ValidFrom: '2020'
          },
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            ValidFrom: '2020'
          },
          {
            Text: '治療のために開腹手術へ移行(合併症を除く)'
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            ValidTo: '2019'
          },
          {
            Text: '術後合併症の修復術'
          }
        ]
      },
      ロボット: {
        子宮: [
          {
            Text: '子宮全摘出術(ロボット支援下)',
            Kcode: ['K877-02-00'],
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ]
          },
          // 2021 削除
          {
            Text: '骨盤臓器脱修復術(ロボット支援下)',
            ValidTo: '2020'
          },
          {
            Text: 'ロボット支援下その他'
          }
        ],
        付属器: [
          {
            Text: 'ロボット支援下その他'
          }
        ],
        その他: [
          // 2021 削除
          {
            Text: '骨盤臓器脱修復術(ロボット支援下)',
            ValidTo: '2020'
          },
          {
            Text: '仙骨腟固定術(ロボット支援下)',
            Kcode: ['K865-02-00']
          },
          {
            Text: 'ロボット支援下その他'
          }
        ]
      },
      ロボット悪性: {
        子宮: [
          {
            Text: 'ロボット支援下単純子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術', 'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K879-02-00']
          },
          {
            Text: 'ロボット支援下準広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
            Kcode: ['K879-02-00']
          },
          {
            Text: 'ロボット支援下広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下骨盤内臓全摘術'
            ],
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
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN'],
              Selection: 'one'
            }
          },
          // 2024 新規
          {
            Text: 'ロボット支援下骨盤内臓全摘術',
            Ditto: [
              '腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH,LH)',
              '腹腔鏡下広汎子宮全摘出術', '腹腔鏡下準広汎子宮全摘出術',
              '腹腔鏡下単純子宮全摘出術', '腹腔鏡下付属器摘出術',
              '腹腔鏡下骨盤内臓全摘術',
              '子宮全摘出術(ロボット支援下)',
              'ロボット支援下単純子宮全摘出術', 'ロボット支援下準広汎子宮全摘出術',
              'ロボット支援下広汎子宮全摘出術'
            ],
            ValidFrom: '2024'
          },
          {
            Text: '治療のために開腹手術へ移行(合併症を除く)'
          },
          // 2020 削除
          {
            Text: 'Second Look Operation',
            ValidTo: '2019'
          },
          {
            Text: '術後合併症の修復術'
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患によるロボット支援下子宮全摘出術',
            ValidFrom: '2020',
            Kcode: ['K877-02-00']
          }
        ]
      },
      子宮鏡: {
        子宮: [
          // 2022 詳細調査追加
          {
            Text: '子宮筋腫摘出術',
            Kcode: ['K872-03-01', 'K872-03-02', 'K873-00-01', 'K873-00-02'],
            ValidTo: '2021'
          },
          {
            Text: '子宮筋腫摘出術',
            Kcode: ['K872-03-01', 'K872-03-02', 'K873-00-01', 'K873-00-02'],
            ValidFrom: '2022',
            Description: {
              Text: '主たる使用機器',
              Values: ['レゼクトスコープ 電解質溶液使用', 'レゼクトスコープ 非電解質溶液使用', '細径子宮鏡', '軟性子宮鏡', 'シェーバー'],
              Selection: 'one'
            }
          },
          // 2022 詳細調査追加
          {
            Text: '子宮内膜ポリープ摘出術',
            Kcode: ['K872-03-01', 'K872-03-02'],
            ValidTo: '2021'
          },
          {
            Text: '子宮内膜ポリープ摘出術',
            Kcode: ['K872-03-01', 'K872-03-02'],
            ValidFrom: '2022',
            Description: {
              Text: '主たる使用機器',
              Values: ['レゼクトスコープ 電解質溶液使用', 'レゼクトスコープ 非電解質溶液使用', '細径子宮鏡', '軟性子宮鏡', 'シェーバー'],
              Selection: 'one'
            }
          },
          // 2022 詳細調査追加
          {
            Text: '子宮内腔癒着剥離術',
            Kcode: ['K863-02-00'],
            ValidTo: '2021'
          },
          {
            Text: '子宮内腔癒着剥離術',
            Kcode: ['K863-02-00'],
            ValidFrom: '2022',
            Description: {
              Text: '主たる使用機器',
              Values: ['レゼクトスコープ 電解質溶液使用', 'レゼクトスコープ 非電解質溶液使用', '細径子宮鏡', '軟性子宮鏡', 'シェーバー'],
              Selection: 'one'
            }
          },
          {
            Text: '子宮鏡下子宮中隔切除術',
            Kcode: ['K863-02-00']
          },
          {
            Text: '子宮形成術'
          },
          {
            Text: '子宮内膜焼灼術',
            Kcode: ['K863-03-00']
          },
          // 2022 詳細調査追加
          {
            Text: '胎盤ポリープ・胎盤遺残摘出術',
            Kcode: ['K861-00-00', 'K872-03-01', 'K872-03-02'],
            ValidTo: '2021'
          },
          {
            Text: '胎盤ポリープ・胎盤遺残摘出術',
            Kcode: ['K861-00-00', 'K872-03-01', 'K872-03-02'],
            ValidFrom: '2022',
            Description: {
              Text: '主たる使用機器',
              Values: ['レゼクトスコープ 電解質溶液使用', 'レゼクトスコープ 非電解質溶液使用', '細径子宮鏡', '軟性子宮鏡', 'シェーバー'],
              Selection: 'one'
            }
          },
          // 2020 新規
          {
            Text: '帝王切開瘢痕症候群創部切除術',
            ValidFrom: '2020'
          },
          {
            Text: '子宮鏡検査・内膜剥爬術',
            Kcode: ['D320-00-00', 'D322-00-00', 'K861-00-00']
          },
          {
            Text: '異物除去術'
          },
          {
            Text: '子宮頸管ポリープ切除術',
            Kcode: ['K866-00-00']
          },
          {
            Text: '上記以外の子宮体部腫瘍切除術'
          }
        ]
      },
      卵管鏡: {
        卵管: [
          // 2020 表記変更 腹腔鏡併用は付随情報へ
          {
            Text: '卵管鏡下卵管形成術(単独)',
            ValidTo: '2019'
          },
          // 2020 表記変更 腹腔鏡併用は付随情報へ
          {
            Text: '卵管鏡下卵管形成術(腹腔鏡併用)',
            ValidTo: '2019'
          },
          // 2022年 付随情報の選択様式変更
          {
            Text: '卵管鏡下卵管形成術',
            Description: {
              Text: '実施形態',
              Values: ['卵管鏡単独', '腹腔鏡併用']
            },
            ValidFrom: '2020',
            ValidTo: '2021',
            Kcode: ['K890-02-00']
          },
          {
            Text: '卵管鏡下卵管形成術',
            Description: {
              Text: '実施形態',
              Values: ['腹腔鏡併用'],
              Selection: 'anyornone'
            },
            ValidFrom: '2022',
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
  static getAdditioninalProcedure(item) {
    return this.parseItem(item, 'AdditionalProcedure')
  }

  static getDittos(item) {
    return this.parseItem(item, 'Ditto')
  }

  static getDescriptionObject(item) {
    return this.parseItem(item, 'Description')
  }

  static getCodes(item) {
    return this.parseItem(item, 'Kcode')
  }

  static getDescriptionTitle(item) {
    return this.getDescriptionObject(item)?.Text
  }

  static getDescriptionOptions(item) {
    return (this.getDescriptionObject(item)?.Values || [])
  }

  static getDescriptionSelectionMode(item) {
    return (this.getDescriptionObject(item)?.Selection || 'one')
  }

  // あいまい検索での候補選定
  //
  // @param {string} 検索文字列
  // @param {string}
  // @param {string}
  // @param {string|number}
  //
  // @return {array}
  Matches(text, category = '', target = '', year = this.YearofMaster) {
    if (text === undefined || text === '') {
      return []
    }

    // 検索文字列の正規化
    const regulaterdText = regulateExpression(text)
    if (regulaterdText === '') {
      return []
    }

    // マスタから年次・カテゴリ・対象に応じた術式一覧を取得
    const masterItems = this.Items(category, target, year)
      .map(item => {
        return {
          Text: item.Text,
          Kcode: item?.Kcode || [],
          history: item?.history || []
        }
      })

    let results = []

    // Kコードでの検索
    if (Kcodeformat.test(regulaterdText)) {
      results = masterItems
        .filter(item => matchCode(ProcedureMaster.getCodes(item), regulaterdText))
        .map(item => item.Text)
    }

    // Fuse.jsを使ったあいまい検索
    const fuzzyMatch = new Fuse(masterItems, { keys: ['Text', 'history'], threshold: 0.49 })
    const fuzzyResults = fuzzyMatch.search(regulaterdText)
    results.push(...fuzzyResults.map(result => result.item.Text))

    // 重複を排除して返す
    return results.length < 2 ? results : Array.from(new Set(results))
  }
} // class ProcedureMaster おわり

// コンパニオン関数

// Kコードの比較 ～ 表記に揺らぎが大きいのでグループ毎に比較する
//
// @param {array}
// @param {string}
//
// @return {boolean}
function matchCode(codes, value) {
  if (codes === undefined || Array.isArray(codes) === false) {
    return false
  }
  // matches $1 - code $3 - subcode $5 - subcode2
  const valuegroups = (value.toLocaleUpperCase() + '-0-0').match(Kcodeformat)
  if (valuegroups !== null) {
    for (const code of codes) {
      const breakedcode = code.match(Kcodeformat)
      if (
        breakedcode !== null &&
        valuegroups[1] === breakedcode[1] &&
        Number(valuegroups[3]) === Number(breakedcode[3]) &&
        Number(valuegroups[5]) === Number(breakedcode[5])
      ) {
        return true
      }
    }
  }
  return false
}

// 表現の揺らぎなど g フラグ付きで検索・置換する
const ruleset1 = {
  // 修飾語の除去
  '緊急|右|左': '',
  '全?腹腔鏡(補助)?下': '',
  'ロボット(支援下?)?': '',
  '子宮鏡下?': '',
  '卵管鏡下?': '',
  // 一般的なゆらぎの内容
  附属器: '付属器',
  膣: '腟',
  頚: '頸',
  '(瘤|下垂)': '脱',
  '(がん|悪性腫瘍|肉腫)': '癌',
  チョコレート: '子宮内膜症性',
  '(のう|嚢)(腫|胞)': '嚢$2',
  '(嚢(腫|胞))核出': '$1摘出',
  剔出: '摘出',
  '全摘出?': '全摘出',
  // 術式では卵巣とつくものは卵巣癌のみなのでそれ以外は付属器に集約する
  '卵巣[^癌]': '付属器'
}

// exact matchにむけての置換 ルールにマッチしたら文字列を完全に置き換える
const ruleset2 = {
  '全?腹腔鏡下子宮全摘': 'K877-02-00',
  LAM: '子宮筋腫核出術(腹腔鏡補助下)',
  'T?LM': '子宮筋腫核出術(腹腔鏡下)',
  '(子宮外|(卵管(角|峡|狭|間質|膨大)部|間質部|瘢痕部?))妊娠': '異所性妊娠手術',
  エタノール固定: 'J017-00-00',
  トラケレクトミー: '腹腔鏡下子宮頸部摘出術',
  セカンドルック: 'SecondLookOperation',
  子宮亜全摘: '子宮腟上部切断',

  'D&C': '剥爬術',
  アブレーション: 'K863-03-00',
  IUD: '異物除去術',
  LSC: '仙骨腟固定術',
  MEA: 'K863-03-00',
  '[LRB]?SO': '付属器切除術',
  TLC: '嚢胞摘出術',
  'TCR-?P': 'K872-03-02',
  'TCRis-?P': 'K872-03-01',
  'TCR-?M': 'K873-00-02',
  'TCRis-?M': 'K873-00-01'
}

function regulateExpression(str = '') {
  // 型変換と前後の余白の削除
  let searchstring = str.toString().trim()
  if (searchstring === '') {
    return ''
  }
  // 全角英数の半角変換
  searchstring = ZenToHan(searchstring)

  // 連結文字列の検索、連結が発見されたら例外を発生させる
  if (/([ +＋.､、｡。\t]+|(?<!TLH),(?!=LH))/.test(searchstring)) {
    throw new Error('区切り文字を用いた複数項目の自由入力はできません.')
  }

  // 置換1 - 文字列の全置換
  for (const rule in ruleset1) {
    const regex = new RegExp(rule, 'g')
    searchstring = searchstring.replace(regex, ruleset1[rule])
  }

  // 置換2 - 文字列からの検索して置き換え
  for (const rule in ruleset2) {
    const regex = new RegExp(rule, 'i')
    if (regex.test(searchstring)) {
      searchstring = ruleset2[rule]
    }
  }

  return searchstring
}

