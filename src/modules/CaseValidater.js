export function ValidateCase (item = {}) {
  let Year = ''

  return new Promise((resolve) => { resolve() })
    .then(_ => {
      return new Promise((resolve, reject) => {
        if (item.Age > 0 &&
          item.InstitutionalPatientId &&
          item.DateOfProcedure &&
          item.ProcedureTime
        ) {
          Year = item.DateOfProcedure.substr(0, 4)
          resolve()
        } else {
          reject(new Error('基本情報の入力が不十分です.'))
        }
      })
    })
    .then(_ => {
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
    })
    .then(_ => {
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
          resolve()
        } else {
          reject(new Error('主たる術後診断と主たる実施術式のカテゴリが一致していません.'))
        }
      })
    })
    .then(_ => {
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
