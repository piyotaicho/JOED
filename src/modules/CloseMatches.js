export const name = 'CloseMatches'

const CommonTranslation = {
  '[ ,.、。・]+': ' ',
  膣: '腟',
  頚: '頸',
  瘤: '脱',
  下垂: '脱',
  のう腫: '腫瘍',
  嚢腫: '腫瘍',
  嚢胞: '腫瘍',
  腫瘤: '腫瘍',
  がん: '癌'
}

const DiagnosisTranslation = {
  '((粘液|漿液)性?腺?|腺)癌': '癌',
  '(粘液|漿液|充実|孤立|繊維)性腫瘍': '腫瘍',
  '(癌|腺|平滑筋)?肉腫': '体癌',
  '(乳|胃|大腸)癌': '上記以外の悪性腫瘍',
  奇形腫: '良性腫瘍',
  膿瘍: '骨盤腹膜炎',
  異形成: '子宮頸部前癌病変',
  上皮内癌: '子宮頸部前癌病変',
  増殖症: '子宮体部前癌病変',
  悪性リンパ腫: '上記以外の悪性腫瘍',

  AEH: '子宮内膜異型増殖症',
  CIN: '子宮頸部前癌病変',
  CIS: '子宮頸部前癌病変',
  DIE: '子宮内膜症',
  ESS: '子宮体癌',
  FHCS: '骨盤腹膜炎',
  LEGH: '子宮頸部腫瘍',
  LMS: '子宮体癌',
  PID: '骨盤腹膜炎',
  POP: '骨盤性器脱',
  RRSO: '予防的内性器摘出術',
  STD: '骨盤腹膜炎'
}

const ProcedureTranslation = {
  '傍?(卵巣|卵管)腫瘍': '附属器腫瘍',
  トラケレクトミー: '頸部摘出術',
  アブレーション: '焼灼術',
  セカンドルック: 'SecondLookOperation',
  補助下: ' ',
  切除: '摘出',
  剔出: '摘出',
  全摘出: '全摘',
  核出: '摘出',

  'D&C': '剥爬術',
  IUD: '異物',
  LSC: '骨盤臓器脱修復術'
}

export function getMatchesInDiagnoses (str = '', candidates = []) {
  const difflib = require('difflib')

  // 全角の半角化
  str = str.replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  // step 1 - 基本的なよくある正規化
  str = ReplaceByTable(str, CommonTranslation)

  // Step 2 - 状態を示す補足語を削除する
  str = str.replace(/([右左両片]側?性?|(亜?急|慢|([特原続]発)|難治)性|(不|完|不完)全|(破裂|捻転|再発|転移))/g, '')

  // step 3 - 疾患名の正規化と変換
  str = ReplaceByTable(str, DiagnosisTranslation)

  // Step 4 - マッチ精度をあげるため臓器を示す名詞を先頭に移動する
  str = str.replace(/^(.*)(子宮|付属器|卵巣|卵管)(.*)$/, '$2 $1 $3')

  // Step 5 - マッチ配列を取得する
  const array = difflib.getCloseMatches(str, candidates, 12, 0.2)
  return array.filter((item, index, self) => self.indexOf(item) === index)
}

export function getMatchesInProcedures (str = '', candidates = []) {
  const difflib = require('difflib')

  // 全角の半角化
  str = str.replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  // step 1 - 基本的なよくある正規化
  str = ReplaceByTable(str, CommonTranslation)
  console.log('STEP1', str)

  // step 2 - 疾患名の正規化と変換
  str = ReplaceByTable(str, ProcedureTranslation)
  console.log('STEP2', str)

  // Step 3 - マッチ配列を取得する
  const array = difflib.getCloseMatches(str, candidates, 12, 0.2)
  return array.filter((item, index, self) => self.indexOf(item) === index)
}

function ReplaceByTable (str = '', hash = {}) {
  const re = new RegExp('(' + Object.keys(hash).join('|') + ')', 'gi')
  return str.replace(
    re,
    matched => {
      if (hash[matched]) return hash[matched]
      for (const key in hash) {
        if (matched.match(key)) return hash[key]
      }
    }
  )
}
