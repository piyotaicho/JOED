// Electron IPCinvoke経由でのNeDBへのラッパー
// 全てのinvokeはPromiseなのでasyncで覆う

/**
 * ドキュメントオブジェクトを挿入する
 * @param {*} payload.Document
 * @returns newdocument
 */
export async function Insert (payload) {
  // 空ドキュメントは登録出来ない
  if (!payload?.Document || Object.keys(payload.Document).length === 0) {
    return undefined
  }
  return window.API.Insert({
    Document: JSON.parse(JSON.stringify(payload.Document))
  })
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
export async function Find (payload) {
  return window.API.Find({
    Query: escapeProxyObject(payload?.Query || {}),
    Projection: JSON.parse(JSON.stringify(payload?.Projection || {})),
    Sort: JSON.parse(JSON.stringify(payload?.Sort || {})),
    Skip: payload?.Skip ? Number.parseInt(payload.Skip) : 0,
    Limit: payload?.Limit ? Number.parseInt(payload.Limit) : 0
  })
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
export async function FindOne (payload) {
  return window.API.FindOne({
    Query: escapeProxyObject(payload?.Query || {}),
    Projection: JSON.parse(JSON.stringify(payload?.Projection || {})),
    Sort: JSON.parse(JSON.stringify(payload?.Sort || {})),
    Skip: payload?.Skip ? Number.parseInt(payload.Skip) : 0
  })
}

/**
 * ハッシュ値を算出してドキュメントを検索する
 * @param {String} payload.Hash
 * @param {Number} payload.SALT
 * @returns
 */
export async function FindOneByHash (payload) {
  if (!payload?.Hash || !payload?.SALT) {
    return null
  }
  return window.API.FindOneByHash({
    Hash: payload.Hash,
    SALT: payload.SALT
  })
}

/**
 * クエリに該当するドキュメント数をカウントする
 * @param {*} payload.Query
 * @returns
 */
export async function Count (payload) {
  return window.API.Count({
    Query: escapeProxyObject(payload?.Query || {}),
  })
}

/**
 * ドキュメントを更新する
 * @param {*} payload.Query
 * @param {*} payload.Update
 * @param {*} payload.Options
 * @returns
 */
export async function Update (payload) {
  // 安全のためQueryとUpdateの指定は必須
  if (!payload?.Query || Object.keys(payload.Query).length === 0 ||
      !payload?.Update || Object.keys(payload.Update).length === 0) {
    return 0
  }

  if (!payload?.Options) {
    return window.API.Update({
      Query: escapeProxyObject(payload.Query),
      Update: JSON.parse(JSON.stringify(payload.Update))
    })
  } else {
    return window.API.Update({
      Query: escapeProxyObject(payload.Query),
      Update: JSON.parse(JSON.stringify(payload.Update)),
      Options: JSON.parse(JSON.stringify(payload?.Options || {}))
    })
  }
}

/**
 * ドキュメントを削除する
 * @param {*} payload.Query
 * @param {*} payload.Options
 * @returns
 */
export async function Remove (payload) {
  // 安全のためQueryの指定は必須
  if (!payload?.Query || Object.keys(payload.Query).length === 0) {
    return 0
  }

  if (!payload?.Options) {
    return window.API.Remove({
      Query: escapeProxyObject(payload.Query)
    })
  } else {
    return window.API.Remove({
      Query: escapeProxyObject(payload.Query),
      Options: payload?.Options ? JSON.parse(JSON.stringify(payload.Options)) : {}
    })
  }
}

/**
 * データベースの登録内容をダンプする
 * @returns
 */
export async function Dump() {
  return await Find({Projection: { _id: 0 } })
}

/**
 * データベースを全削除する
 * @param {boolean} removeBackupFiles - バックアップファイルも削除する
 * @returns
 */
export async function Drop (removeBackupFiles = false) {
  return window.API.DropDatabase(removeBackupFiles)
}

/**
 * Proxy Objectを生のオブジェクトに変換
 * NeDBのクエリでRegExpオブジェクトがありJSON経由を使えないため逐次 $regex をstringに変換する
 * (backend側で元に戻す)
 * @param {*} obj
 */
function escapeProxyObject (obj) {
  // $regex: RegExp の指定があるかチェック なければjsonから生オブジェクトに変換して返す
  const jsonstr = JSON.stringify(obj)
  if (!jsonstr.includes('"$regex":{}')) {
    return JSON.parse(jsonstr)
  }

  if (obj === null && typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(item => escapeProxyObject(item))
  }
  if (typeof obj === 'object') {
    const newobj = {}
    for (const key in obj) {
      if (key === '$regex' && obj[key] instanceof RegExp) {
        newobj[key] = obj[key].toString()
      } else {
        newobj[key] = escapeProxyObject(obj[key])
      }
    }
    return newobj
  }
  return obj
}
