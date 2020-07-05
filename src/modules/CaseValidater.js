import DaignosisTree from '@/modules/DiagnosisItemList'
import ProcedureTree from '@/modules/ProcedureItemList'

export async function ValidateCase (item = {}) {
  let Year = ''

  return new Promise((resolve) => { resolve() })
    .then(_ => {
      return ValidateBasicInformations(item)
    })
    .then(YearToValidate => {
      Year = YearToValidate

      return ValidateAdditionalInformations(item)
    })
    .then(_ => {
      return ValidateCategory(item)
    })
    .then(_ => {
      return CheckDupsInDiagnoses(item)
    })
    .then(_ => {
      return new Promise((resolve, reject) => {
        for (const procedure of item.Procedures) {
          if (!procedure.UserTyped) {
            // ユーザ入力時の際はテーブルとの照合をしない
            resolve()
          }
        }
      })
    })
}

// 必須基本情報
//
// resolveで対象となる年次(20xx)を文字列で返す
export async function ValidateBasicInformations (item) {
  return new Promise((resolve, reject) => {
    if (item.Age > 0 &&
      item.InstitutionalPatientId &&
      item.DateOfProcedure &&
      item.ProcedureTime
    ) {
      resolve(item.DateOfProcedure.substr(0, 4))
    } else {
      reject(new Error('基本情報の入力が不十分です.'))
    }
  })
}

// 補足登録情報
//
export async function ValidateAdditionalInformations (item) {
  return new Promise((resolve, reject) => {
    if (item.JSOGId) {
      if (item.JSOGId.match(/^(CC|EM|OV)\d{4}-\d+$/ig) === null) {
        reject(new Error('症例の腫瘍登録フォーマットが不正です.'))
      }
    }
    if (item.NCDId) {
      if (item.NCDId.match(/\d{18}-\d{2}-\d{2}-\d{2}/g) === null) {
        reject(new Error('症例のNCD症例識別コードが不正です.'))
      }
    }
    resolve()
  })
}

// 主たる術後診断・実施術式のカテゴリの一致
//
export async function ValidateCategory (item) {
  return new Promise((resolve, reject) => {
    const CategoryTranslator = {
      腹腔鏡: '腹腔鏡',
      ロボット: '腹腔鏡',
      腹腔鏡悪性: '腹腔鏡',
      ロボット悪性: '腹腔鏡',
      子宮鏡: '子宮鏡',
      卵管鏡: '卵管鏡'
    }

    if (item.Diagnoses[0].Chain[0] === CategoryTranslator[item.Procedures[0].Chain[0]]) {
      resolve(CategoryTranslator[item.Procedures[0].Chain[0]])
    } else {
      reject(new Error('主たる術後診断と主たる実施術式のカテゴリが一致していません.'))
    }
  })
}

// 術後診断の重複の有無
//
export async function CheckDupsInDiagnoses (item) {
  return new Promise((resolve, reject) => {
    if (item.Procedures.map(item => item.Text)
      .flat()
      .filter((item, index, self) => self.indexOf(item) !== self.laseIndexOf(item))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('術後診断に重複があります.'))
    }
  })
}

// 術後診断の年次ツリーとの整合性
//
export async function ValidateDiagnosis (item, category, year) {
  const checkYear = year !== undefined ? year : item.DateOfProcedure.substr(0, 4)
  const checkCategory = category !== undefined ? category : item.TypeOfProcedure

  const tree = new DiagnosisTree()
  const treeList = tree.flatten( checkCategory, checkYear)

  return new Promise((resolve, reject) => {
    for (const diagnosis of item.Diagnoses) {
      if (diagnosis.UserTyped !== true) {
        if (treeList.indexOf(diagnosis.Text) >= 0) {
          resolve()
        }
      }
    }
    reject(new Error('選択入力された診断名のマスタが更新されています.再入力をお願いします.'))
  })
}

// 実施手術の重複の有無
//
export async function CheckDupsInProcedures (item) {
  return new Promise((resolve, reject) => {
    if (item.Procedures.map(item => item.Text)
      .flat()
      .filter((item, index, self) => self.indexOf(item) !== self.laseIndexOf(item))
      .length <= 0) {
      resolve()
    } else {
      reject(new Error('実施手術に重複があります.'))
    }
  })
}

// 実施手術名の年次ツリーとの整合性
//
export async function ValidateProcedure (item, category, year) {
  const checkYear = year !== undefined ? year : item.DateOfProcedure.substr(0, 4)
  const checkCategory = category !== undefined ? category : item.TypeOfProcedure

  const tree = new ProceduerTree()
  const treeList = tree.flatten( checkCategory, checkYear)

  return new Promise((resolve, reject) => {
    for (const procedure of item.Procedures) {
      if (procedure.UserTyped !== true) {
        if (treeList.indexOf(procedure.Text) >= 0) {
          resolve()
        }
      }
    }
    reject(new Error('選択入力された実施手術のマスタが更新されています.再入力をお願いします.'))
  })
}

