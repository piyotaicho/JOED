// ブラウザのファイルシステムへのNeDBラッパー
// seald/nedbになって*AsyncができたのでPromise+callbackから移行
// データベースインスタンスは公開不要なのでインターフェースを簡素化した
import HHX from 'xxhashjs'
import NeDB from '@seald-io/nedb'

const DatabaseInstance = new NeDB({
  filename: 'joed.nedb',
  autoload: true
})

export async function Insert(payload) {
  return DatabaseInstance.insertAsync(payload.Document)
}

export async function Find(payload) {
  return DatabaseInstance.findAsync(payload?.Query ? payload.Query : {})
    .projection(payload?.Projection ? payload.Projection : {})
    .sort(payload?.Sort ? payload.Sort : {})
    .skip(payload?.Skip ? Number.parseInt(payload.Skip) : 0)
    .limit(payload?.Limit ? Number.parseInt(payload.Limit) : 0)
}

export async function FindOne(payload) {
  return DatabaseInstance.findOneAsync(payload?.Query ? payload.Query : {})
    .projection(payload?.Projection ? payload.Projection : {})
    .sort(payload?.Sort ? payload.Sort : {})
    .skip(payload?.Skip ? Number.parseInt(payload.Skip) : 0)
    .limit(payload?.Limit ? Number.parseInt(payload.Limit) : 0)
}

// FindOneByHash
//
// @param{object}
//   .Hash - ドキュメントハッシュ文字列
//   .SALT - ハッシュキー(Number)
export async function FindOneByHash(payload) {
  const Encoder = new TextEncoder()
  const founddocument = await DatabaseInstance.findOneAsync(
    // query
    {
      $where: function () {
        if (this.PatientId && this.DateOfProcedure) {
          const recordKeys = {
            PatientId: this.PatientId,
            DateOfProcedure: this.DateOfProcedure
          }
          // 2022より64bitのシードとUint8Arrayを与える
          const hash = (this.DateOfProcedure.substring(0, 4) >= '2022')
            ? HHX.h64(
              Encoder.encode(JSON.stringify(recordKeys)).buffer,
              payload.SALT.toString()
            ).toString(36)
            : HHX.h64(
              JSON.stringify(recordKeys),
              payload.SALT
            ).toString(36)
          return hash === payload.Hash
        } else {
          return false
        }
      }
    },
    // projection
    { DocumentId: 1 }
  )

  return founddocument !== null ? founddocument?.DocumentId : undefined
}

export async function Count(payload) {
  return await DatabaseInstance.countAsync(
    payload?.Query ? payload.Query : {}
  )
}

export async function Update(payload) {
  return await DatabaseInstance.updateAsync(
    payload?.Query ? payload.Query : {},
    payload?.Update ? payload.Update : {},
    payload?.Options ? payload.Options : {}
  )
}

export async function Remove(payload) {
  return await DatabaseInstance.removeAsync(
    payload?.Query ? payload.Query : {},
    payload?.Options ? payload.Options : {}
  )
}
