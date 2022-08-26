import HHX from 'xxhashjs'

const NeDB = require('@seald-io/nedb')

export function CreateInstance (payload) {
  const config = Object.assign(
    {
      filename: '',
      autoload: true
    },
    payload)

  return new NeDB(config)
}

export async function Insert (payload, DatabaseInstance) {
  return DatabaseInstance.insertAsync(payload.Document)
}

export async function Find (payload, DatabaseInstance) {
  return DatabaseInstance.findAsync(payload?.Query ? payload.Query : {})
    .projection(payload?.Projection ? payload.Projection : {})
    .sort(payload?.Sort ? payload.Sort : {})
    .skip(payload?.Skip ? Number.parseInt(payload.Skip) : 0)
    .limit(payload?.Limit ? Number.parseInt(payload.Limit) : 0)
}

export async function FindOne (payload, DatabaseInstance) {
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
//
// return - promise(uid)
export async function FindOneByHash (payload, DatabaseInstance) {
  const HHX64 = HHX.h64(payload.SALT)

  const founddocument = await DatabaseInstance.findOneAsync(
    // query
    {
      $where: function () {
        const recordKeys = {
          PatientId: this.PatientId,
          DateOfProcedure: this.DateOfProcedure
        }
        const hash = HHX64.update(JSON.stringify(recordKeys)).digest().toString(36)
        return hash === payload.Hash
      }
    },
    // projection
    { DocumentId: 1 }
  )

  return founddocument !== null ? founddocument?.DocumentId : undefined
}

export async function Count (payload, DatabaseInstance) {
  return await DatabaseInstance.countAsync(
    payload?.Query ? payload.Query : {}
  )
}

export async function Update (payload, DatabaseInstance) {
  return await DatabaseInstance.updateAsync(
    payload?.Query ? payload.Query : {},
    payload?.Update ? payload.Update : {},
    payload?.Options ? payload.Options : {}
  )
}

export async function Remove (payload, DatabaseInstance) {
  return await DatabaseInstance.removeAsync(
    payload?.Query ? payload.Query : {},
    payload?.Options ? payload.Options : {}
  )
}
