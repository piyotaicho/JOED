import Master from '@/modules/Masters/Master'
import { ZenToHan } from '@/modules/ZenHanChars'
import { getCloseMatches } from 'difflib'

export const LastUpdate = '2021-02-02'
const defaultReference = '2020'

export default class DiagnosisMaster extends Master {
  constructor () {
    super({
      腹腔鏡: {
        子宮: [
          {
            Text: '子宮筋腫',
            ICD10: ['D25*']
          },
          {
            Text: '子宮腺筋症',
            ICD10: ['N800']
          },
          {
            Text: '骨盤臓器脱',
            ICD10: ['N81*']
          },
          // 2020 表記変更 子宮内膜症(チョコレート嚢胞含む) -> 子宮内膜症(子宮内膜症性嚢胞含む)
          {
            Text: '子宮内膜症(チョコレート嚢胞含む)',
            VaildTo: '2019'
          },
          {
            Text: '子宮内膜症(子宮内膜症性嚢胞含む)',
            VaildFrom: '2020',
            ICD10: ['N80*']
          },
          // 2020 表記変更 付属器癒着 -> 子宮付属器癒着
          {
            Text: '付属器癒着',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器癒着',
            VaildFrom: '2020',
            ICD10: ['N736']
          },
          // 2020 新規
          {
            Text: '子宮頸部上皮内腫瘍(CIN1-3,CIS,AIS含む)',
            VaildFrom: '2020',
            ICD10: ['D060', 'D061', 'D069', 'R876', 'N879']
          },
          // 2020 新規
          {
            Text: '子宮頸部嚢胞性腫瘍(LEGH等)',
            VaildFrom: '2020',
            ICD10: ['D390', 'N879']
          },
          // 2020 新規
          {
            Text: '子宮内膜増殖症・異型増殖症',
            VaildFrom: '2020',
            ICD10: ['N850', 'N851']
          },
          // 2020 新規
          {
            Text: '子宮体部腫瘍(APAM,STUMP等)',
            VaildFrom: '2020',
            ICD10: ['D175', 'D282']
          },
          // 2020 新規
          {
            Text: '絨毛性疾患',
            VaildFrom: '2020',
            ICD10: ['O019', 'D392', 'C56', 'C58']
          },
          // 2020 表記変更 異所性妊娠(子宮外妊娠) -> 異所性妊娠
          {
            Text: '異所性妊娠(子宮外妊娠)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠',
            VaildFrom: '2020',
            ICD10: ['O00*']
          },
          {
            Text: '機能性不妊症(腹腔内検査)',
            ICD10: ['N972', 'N973', 'N979']
          },
          {
            Text: '子宮奇形',
            ICD10: ['Q512', 'Q513', 'Q514', 'Q518']
          },
          {
            Text: '骨盤腹膜炎',
            ICD10: ['K670', 'N701', 'N719', 'N734', 'N735', 'O85']
          },
          // 2020 新規
          {
            Text: '性同一性障害',
            ValidFrom: '2020',
            ICD10: ['F649']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020',
            ICD10: ['C1*', 'C2*', 'C3*', 'C4*', 'C50*', 'C6*', 'C7*', 'C8*', 'C9*']
          },
          // 2020 新規
          {
            Text: '予防的内性器摘出術の適応',
            VaildFrom: '2020',
            ICD10: ['C809', 'R798']
          }
        ],
        付属器: [
          {
            Text: '良性卵巣腫瘍',
            ICD10: ['D27', 'D391', 'N838', 'N839']
          },
          // 2020 表記変更 子宮内膜症(チョコレート嚢胞含む) -> 子宮内膜症(子宮内膜症性嚢胞含む)
          {
            Text: '子宮内膜症(チョコレート嚢胞含む)',
            VaildTo: '2019'
          },
          {
            Text: '子宮内膜症(子宮内膜症性嚢胞含む)',
            VaildFrom: '2020',
            ICD10: ['N80']
          },
          // 2020 表記変更 異所性妊娠(子宮外妊娠) -> 異所性妊娠
          {
            Text: '異所性妊娠(子宮外妊娠)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠',
            VaildFrom: '2020',
            ICD10: ['O00*']
          },
          {
            Text: '機能性不妊症(腹腔内検査)',
            ICD10: ['N971', 'N972', 'N979']
          },
          {
            Text: '多嚢胞性卵巣症候群',
            ICD10: ['E282']
          },
          // 2020 表記変更 付属器癒着 -> 子宮付属器癒着
          {
            Text: '付属器癒着',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器癒着',
            VaildFrom: '2020',
            ICD10: ['N736']
          },
          // 2020 表記変更 卵管閉塞,卵管留水(血)症 -> 卵管閉塞・卵管留水(血)症
          {
            Text: '卵管閉塞,卵管留水(血)症',
            VaildTo: '2019'
          },
          {
            Text: '卵管閉塞・卵管留水(血)症',
            VaildFrom: '2020',
            ICD10: ['Q506', 'N701', 'N836']
          },
          {
            Title: '卵巣出血',
            ICD10: ['N838']
          },
          '上記以外の付属器良性疾患',
          // 2020 新規
          {
            Text: '性同一性障害',
            ValidFrom: '2020',
            ICD10: ['F649']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020',
            ICD10: ['C1*', 'C2*', 'C3*', 'C4*', 'C50*', 'C6*', 'C7*', 'C8*', 'C9*']
          },
          // 2020 新規
          {
            Text: '予防的内性器摘出術の適応',
            VaildFrom: '2020',
            ICD10: ['C809', 'R798']
          }
        ],
        その他: [
          // 2020 表記変更 子宮内膜症(チョコレート嚢胞含む) -> 子宮内膜症(子宮内膜症性嚢胞含む)
          {
            Text: '子宮内膜症(チョコレート嚢胞含む)',
            VaildTo: '2019'
          },
          {
            Text: '子宮内膜症(子宮内膜症性嚢胞含む)',
            VaildFrom: '2020',
            ICD10: ['N80*']
          },
          // 2020 新規
          {
            Text: '絨毛性疾患',
            VaildFrom: '2020',
            ICD10: ['O019', 'D392', 'C56', 'C58']
          },
          // 2020 表記変更 異所性妊娠(子宮外妊娠) -> 異所性妊娠
          {
            Text: '異所性妊娠(子宮外妊娠)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠',
            VaildFrom: '2020',
            ICD10: ['O00*']
          },
          // 2020 表記変更 付属器癒着 -> 子宮付属器癒着
          {
            Text: '付属器癒着',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器癒着',
            VaildFrom: '2020',
            ICD10: ['N736']
          },
          {
            Text: '機能性不妊症(腹腔内検査)',
            ICD10: ['N971', 'N972', 'N979']
          },
          // 2020 削除
          {
            Text: '子宮筋腫',
            VaildTo: '2019'
          },
          {
            Text: '先天性腟欠損症',
            ICD10: ['Q520']
          },
          {
            Text: '骨盤臓器脱',
            ICD10: ['N81*']
          },
          {
            Text: '骨盤腹膜炎',
            ICD10: ['K670', 'N701', 'N719', 'N734', 'N735', 'O85']
          },
          // 2020 新規
          {
            Text: '性同一性障害',
            ValidFrom: '2020',
            ICD10: ['F649']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020',
            ICD10: ['C1*', 'C2*', 'C3*', 'C4*', 'C50*', 'C6*', 'C7*', 'C8*', 'C9*']
          }
        ]
      },
      腹腔鏡悪性: {
        子宮: [
          {
            Text: '子宮体癌',
            ICD10: ['C54*']
          },
          {
            Text: '子宮頸癌',
            ICD10: ['C53*']
          },
          // 2020 削除
          {
            Text: '子宮頸部前癌病変(CIN,CIS,AIS)',
            VaildTo: '2019'
          },
          // 2020 削除
          {
            Text: '子宮体部前癌病変(子宮内膜異型増殖症)',
            VaildTo: '2019'
          },
          // 2020 削除
          {
            Text: '上記以外の子宮頸部腫瘍(子宮頸部嚢胞性病変,LEGH等)',
            VaildTo: '2019'
          },
          // 2020 削除
          {
            Text: '上記以外の子宮体部腫瘍(APAM,STUMP等)',
            VaildTo: '2019'
          },
          // 2020 新規
          {
            Text: '絨毛性疾患',
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020'
          },
          // 2020 表記変更 予防的内性器摘出術適応 -> 予防的内性器摘出術の適応
          {
            Text: '予防的内性器摘出術適応',
            VaildTo: '2019'
          },
          {
            Text: '予防的内性器摘出術の適応',
            VaildFrom: '2020',
            ICD10: ['C809', 'R798']
          },
          '術後合併症の修復'
        ],
        付属器: [
          // 2020 表記変更 卵巣癌(卵管癌・腹膜癌含む) -> 卵巣癌(卵管癌,腹膜癌含む)
          {
            Text: '卵巣癌(卵管癌・腹膜癌含む)',
            VaildTo: '2019'
          },
          {
            Text: '卵巣癌(卵管癌,腹膜癌含む)',
            VaildFrom: '2020',
            ICD10: ['C56', 'C570']
          },
          {
            Text: '境界悪性卵巣腫瘍',
            ICD10: ['D391']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020',
            ICD10: ['C1*', 'C2*', 'C3*', 'C4*', 'C50*', 'C6*', 'C7*', 'C8*', 'C9*']
          },
          // 2020 表記変更 予防的内性器摘出術適応 -> 予防的内性器摘出術の適応
          {
            Text: '予防的内性器摘出術適応',
            VaildTo: '2019'
          },
          {
            Text: '予防的内性器摘出術の適応',
            VaildFrom: '2020',
            ICD10: ['C809', 'R798']
          },
          // 2020 削除
          {
            Text: '妊孕性温存のための卵巣摘出',
            VaildTo: '2019'
          },
          // 2020 削除
          {
            Text: '転移性卵巣癌',
            VaildTo: '2019'
          },
          '術後合併症の修復'
        ],
        その他: [
          // 2020 削除
          {
            Text: '上記以外の悪性疾患',
            VaildTo: '2019'
          },
          // 2020 新規
          {
            Text: '腟癌',
            VaildFrom: '2020',
            ICD10: ['C52']
          },
          // 2020 新規
          {
            Text: '外陰癌',
            VaildFrom: '2020',
            ICD10: ['C519']
          },
          // 2020 新規
          {
            Text: '絨毛性疾患',
            VaildFrom: '2020',
            ICD10: ['O019', 'D392', 'C56', 'C58']
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性腫瘍',
            VaildFrom: '2020',
            ICD10: ['C1*', 'C2*', 'C3*', 'C4*', 'C50*', 'C6*', 'C7*', 'C8*', 'C9*']
          },
          '術後合併症の修復'
        ]
      },
      子宮鏡: {
        子宮: [
          {
            Text: '子宮内膜ポリープ',
            ICD10: ['N840']
          },
          {
            Text: '粘膜下子宮筋腫',
            ICD10: ['D250']
          },
          // 2020 表記変更 子宮体部前癌病変 -> 子宮内膜増殖症・異型増殖症
          {
            Text: '子宮体部前癌病変',
            VaildTo: '2019'
          },
          {
            Text: '子宮内膜増殖症・異型増殖症',
            VaildFrom: '2020',
            ICD10: ['N850', 'N851']
          },
          // 2020 新規
          {
            Text: '子宮体癌',
            VaildFrom: '2020',
            ICD10: ['C54*']
          },
          '上記以外の子宮体部腫瘍',
          {
            Text: '子宮頸管ポリープ',
            ICD10: ['N841']
          },
          {
            Text: '上記以外の子宮頸部腫瘍',
            ICD10: ['N840', 'N888', 'C53*']
          },
          {
            Text: '過多月経',
            ICD10: ['N92*']
          },
          {
            Text: '子宮奇形',
            ICD10: ['Q51*']
          },
          {
            Text: 'アッシャーマン症候群',
            ICD10: ['N856']
          },
          {
            Text: '異所性妊娠',
            ICD10: ['O00*']
          },
          {
            Text: '胎盤ポリープ・胎盤遺残',
            ICD10: ['O720', 'O730', 'O908']
          },
          // 2020 表記変更 帝王切開瘢痕部症候群 -> 帝王切開瘢痕症候群
          {
            Text: '帝王切開瘢痕部症候群',
            VaildTo: '2019'
          },
          {
            Text: '帝王切開瘢痕症候群',
            VaildFrom: '2020'
          },
          {
            Text: '子宮腟異物',
            ICD10: ['T192', 'T193']
          }
        ]
      },
      卵管鏡: {
        卵管: [
          {
            Text: '卵管閉塞',
            ICD10: ['Q506']
          },
          {
            Text: '卵管狭窄',
            ICD10: ['N971']
          },
          {
            Text: '機能性不妊',
            ICD10: ['N971', 'N972', 'N979']
          },
          {
            Text: '卵管留水(血)症',
            ICD10: ['Q506', 'N701', 'N836']
          }
        ]
      }
    },
    // マスターのシリアル
    defaultReference)
  }

  static getCodes (item) {
    return this.parseItem(item, 'ICD10')
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
        matchCode(DiagnosisMaster.getCodes(item), source)
      ) {
        matcheditemtitles.push(this.getText(item))
      }
    }
    if (matcheditemtitles.length > 0) {
      return matcheditemtitles.filter((item, index, self) => self.indexOf(item) === index)
    }
    // ステップ2 ～closematch
    console.log(source, flattenitems.map(item => this.getText(item)))
    return getCloseMatches(
      source,
      flattenitems.map(item => this.getText(item)),
      12, 0.34 // cut and tryでの適応値
    ).filter((item, index, self) => self.indexOf(item) === index)
  }
} // class DiagnosisMaster おわり

function matchCode (codes, value) {
  if (codes === undefined) {
    return false
  }
  const icd10format = /^([A-Z][0-9]{2,3})$/i
  if (icd10format.test(value)) {
    const uppercasedvalue = value.toLocaleUpperCase()
    for (const code of codes) {
      if (compareCode(code, uppercasedvalue)) {
        return true
      }
    }
  }
  return false
}

function compareCode (str1 = 'A', str2 = 'B') {
  const wildcard1 = str1.indexOf('*')
  const wildcard2 = str2.indexOf('*')
  const comparelength = wildcard1 === -1
    ? (wildcard2 === -1 ? 4 : wildcard2)
    : (wildcard2 === -1 ? wildcard1 : Math.min(wildcard1, wildcard2))

  return str1.substr(0, comparelength) === str2.substr(0, comparelength)
}

// eslint-disable-next-line no-unused-vars
const MEDISdiagnoses = {}

// 表記の統一のためのruleset g フラグつきで検索・置換する
const ruleset1 = {
  // 修飾語の除去
  '[右左両片]側?性?|傍|(亜?急|慢|([特原続]発)|難治)性|[再多]発性?|部分|(不|完|不完)全|(高度)?変性|巨大|有茎性|破裂|捻転': '',
  // 一般的なゆらぎの内容
  附属器: '付属器',
  膣: '腟',
  頚: '頸',
  がん: '癌',
  閉鎖: '閉塞',
  '(のう|嚢)(腫|胞)': '嚢$2',
  // 疾患にありそうな表記の集約
  '(悪性腺腫|((粘液|漿液)性?腺?|腺)癌)': '癌',
  '(粘液|漿液|充実|孤立|繊維|多房|単発)性?': ''
}

// 一般的によくある表現をexact matchにもってゆくための検索式
const ruleset2 = {
  // 病名の置換～病名
  チョコレート: 'N809',
  '卵巣((成熟)?(嚢胞性)?奇形腫|(デルモイド|皮様)(腫瘍|嚢胞|嚢腫)?)': 'D27',
  '(卵巣|境界悪性){2}腫瘍': 'D391',
  '(子宮外|(卵管(角|峡|狭|間質|膨大)部|間質部|瘢痕部?))妊娠': 'O009',
  '子宮(平滑)筋腫': 'D259',
  '子宮頸部(軽|中等|高)度異形成': 'N879',
  '(子宮頸部|)上皮内癌': 'N789',
  '.+(炎|膿瘍)': 'N735',

  '子宮頸部(悪性腫瘍|癌)': 'C539',
  '子宮((癌|腺|平滑筋|脂肪|)肉腫|体部悪性腫瘍)': 'C549',
  悪性転化: 'C56',
  '((乳|胃|大腸)癌|(悪性|)リンパ腫)': '婦人科以外の悪性腫瘍',
  '(奇胎|トロホブラスト)': 'D392',

  '(IUD|(子宮内|)(避妊具|リング))': 'T193',
  '(子宮|膀胱|腟|直腸)(脱|下垂|瘤)': 'N819',
  '粘膜下(子宮)?筋腫(分娩)?': 'D250',

  '([AC]IS|CIN(-|)[123])': 'N879',
  'AEH((-|)C|)': 'N850',

  GTD: 'F649',
  FTM: 'F649',
  MTF: 'F649',
  DIE: 'N809',
  ESS: 'C541',
  FHCS: 'K670',
  LEGH: 'D390',
  LMS: 'C542',
  MDA: 'C539',
  PID: 'N735',
  POP: 'N819',
  POI: '上記以外の付属器良性疾患',
  RRSO: '予防的内性器摘出術の適応',
  リンチ症候群: '予防的内性器摘出術の適応',
  HNPCC: '予防的内性器摘出術の適応',
  STD: 'N735'
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
