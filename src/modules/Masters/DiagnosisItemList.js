import Master from '@/modules/Masters/Master'

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
            ICD10: ['D175', 'D282', 'D390']
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
            ICD10: ['N701', 'N719', 'N734', 'N735', 'O85']
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
            ICD10: ['N701', 'N719', 'N734', 'N735', 'O85']
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
          '上記以外の子宮頸部腫瘍',
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
            ICD10: ['T193']
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

  static getCode (item) {
    return this.parseItem(item, 'ICD10')
  }

  static matchCode (item, value) {
    const codes = this.getCode(item)
    if (codes === undefined) {
      return false
    }
    const icd10format = /^([A-Z][0-9]{2,3})$/i
    if (icd10format.test(value)) {
      const uppercasedvalue = value.toLocaleUpperCase()
      for (const code of codes) {
        const wildcard = code.indexOf('*')
        // 全一致
        if (wildcard === -1) {
          if (code === uppercasedvalue) {
            return true
          }
        } else {
          // 先頭一致
          if (code.substr(0, wildcard) === uppercasedvalue.substr(0, wildcard)) {
            return true
          }
        }
      }
    }
    return false
  }
}

// eslint-disable-next-line no-unused-vars
const MEDISdiagnoses = {}
