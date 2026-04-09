// ブラウザのファイルシステムへのNeDBラッパー
// seald/nedbになって*AsyncができたのでPromise+callbackから移行
// データベースインスタンスは公開不要なのでインターフェースを簡素化した
import HHX from 'xxhashjs'
import NeDB from '@seald-io/nedb'

type DbDocument = Record<string, unknown>
type DbQuery = Record<string, unknown>
type DbProjection = Record<string, 0 | 1>
type DbSort = Record<string, 1 | -1>
type DbOptions = Record<string, unknown>

type InsertPayload = { Document?: DbDocument }
type FindPayload = { Query?: DbQuery; Projection?: DbProjection; Sort?: DbSort; Skip?: number | string; Limit?: number | string }
type FindOnePayload = { Query?: DbQuery; Projection?: DbProjection; Sort?: DbSort; Skip?: number | string; Limit?: number | string }
type FindOneByHashPayload = { Hash?: string; SALT?: number | string }
type CountPayload = { Query?: DbQuery }
type UpdatePayload = { Query?: DbQuery; Update?: DbDocument; Options?: DbOptions }
type RemovePayload = { Query?: DbQuery; Options?: DbOptions }

const DatabaseInstance = new NeDB({
  filename: 'joed.nedb',
  autoload: true
})

/**
 * ドキュメントオブジェクトを挿入する
 * @param {*} payload.Document
 * @returns newdocument
 */
export async function Insert(payload: InsertPayload): Promise<DbDocument | undefined> {
  // 空ドキュメントは登録出来ない
  if (!payload?.Document || Object.keys(payload.Document).length === 0) {
    return undefined
  }
  return DatabaseInstance.insertAsync(payload.Document)
}

/**
 * ドキュメントを検索する(複数対応)
 * @param {*} payload.Query
 * @param {*} payload.Projection
 * @param {*} payload.Sort
 * @param {*} payload.Skip
 * @param {*} payload.Limit
 * @returns
 */
export async function Find(payload: FindPayload): Promise<DbDocument[]> {
  return DatabaseInstance.findAsync(payload?.Query ? payload.Query : {})
    .projection(payload?.Projection ? payload.Projection : {})
    .sort(payload?.Sort ? payload.Sort : {})
    .skip(payload?.Skip ? Number.parseInt(String(payload.Skip)) : 0)
    .limit(payload?.Limit ? Number.parseInt(String(payload.Limit)) : 0)
}

/**
 * ドキュメントを検索する(単一対応)
 * @param {*} payload.Query
 * @param {*} payload.Projection
 * @param {*} payload.Sort
 * @param {*} payload.Skip
 * @param {*} payload.Limit
 * @returns
 */
export async function FindOne(payload: FindOnePayload): Promise<DbDocument | null> {
  return DatabaseInstance.findOneAsync(payload?.Query ? payload.Query : {})
    .projection(payload?.Projection ? payload.Projection : {})
    .sort(payload?.Sort ? payload.Sort : {})
    .skip(payload?.Skip ? Number.parseInt(String(payload.Skip)) : 0)
    .limit(payload?.Limit ? Number.parseInt(String(payload.Limit)) : 0)
}

/**
 * ハッシュ値を算出してドキュメントを検索する
 * @param {String} payload.Hash
 * @param {Number} payload.SALT
 * @returns
 */
export async function FindOneByHash(payload: FindOneByHashPayload): Promise<number | undefined> {
  if (!payload.Hash || payload.SALT === undefined || payload.SALT === null) {
    return undefined
  }

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
              String(payload.SALT)
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

/**
 * クエリに該当するドキュメント数をカウントする
 * @param {*} payload.Query
 * @returns
 */
export async function Count(payload: CountPayload): Promise<number> {
  return await DatabaseInstance.countAsync(
    payload?.Query ? payload.Query : {}
  )
}

/**
 * ドキュメントを更新する
 * @param {*} payload.Query
 * @param {*} payload.Update
 * @param {*} payload.Options
 * @returns
 */
export async function Update(payload: UpdatePayload): Promise<number> {
  // 安全のためQueryとUpdateの指定は必須
  if (!payload?.Query || Object.keys(payload.Query).length === 0 ||
      !payload?.Update || Object.keys(payload.Update).length === 0) {
    return 0
  }

  const result = await DatabaseInstance.updateAsync(
    payload?.Query ? payload.Query : {},
    payload?.Update ? payload.Update : {},
    payload?.Options ? payload.Options : {}
  )

  return typeof result === 'number' ? result : result.numAffected
}

/**
 * ドキュメントを削除する
 * @param {*} payload.Query
 * @param {*} payload.Options
 * @returns
 */
export async function Remove(payload: RemovePayload): Promise<number> {
  // 安全のためQueryの指定は必須
  if (!payload?.Query || Object.keys(payload.Query).length === 0) {
    return 0
  }

  return await DatabaseInstance.removeAsync(
    payload?.Query ? payload.Query : {},
    payload?.Options ? payload.Options : {}
  )
}

/**
 * データベースの登録内容をダンプする
 * @returns
 */
export async function Dump() {
  return await Find({
    Query: { Settings: { $exists: false } },
    Projection: { _id: 0 }
  })
}

/**
 * データベースを全削除する - removeBackupFilesはelectronとの互換性維持のための引数で無視
 * @param {boolean} removeBackupFiles - バックアップファイルも削除する
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function Drop(removeBackupFiles = false) {
  return await DatabaseInstance.dropDatabaseAsync()
}
