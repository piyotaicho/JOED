import HHX from 'xxhashjs'

const _Database = require('nedb')

export function CreateInstance (payload) {
  const config = Object.assign(
    {
      filename: '',
      autoload: true
    },
    payload)

  return new _Database(config)
}

export function Insert (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    DatabaseInstance
      .insert(payload.Document, (error, newdocument) => {
        if (error) {
          reject(error)
        } else {
          resolve(newdocument)
        }
      })
  })
}

export function Find (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    const query = payload.Query ? payload.Query : {}
    const projection = payload.Projection ? payload.Projection : {}
    const sort = payload.Sort ? payload.Sort : {}
    const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0
    const limit = payload.Limit ? Number.parseInt(payload.Limit) : 0

    DatabaseInstance
      .find(query)
      .projection(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec((error, founddocuments) => {
        if (error) {
          reject(error)
        } else {
          resolve(founddocuments)
        }
      })
  })
}

export function FindOne (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    const query = payload.Query ? payload.Query : {}
    const projection = payload.Projection ? payload.Projection : {}
    const sort = payload.Sort ? payload.Sort : {}
    const skip = payload.Skip ? Number.parseInt(payload.Skip) : 0

    DatabaseInstance
      .findOne(query)
      .projection(projection)
      .sort(sort)
      .skip(skip)
      .exec((error, founddocument) => {
        if (error) {
          reject(error)
        } else {
          resolve(founddocument)
        }
      })
  })
}

// FindOneByHash
//
// @param{object}
//   .Hash - ドキュメントハッシュ文字列
//   .SALT - ハッシュキー(Number)
//
// return - promise(uid)
export function FindOneByHash (payload, DatabaseInstance) {
  const HHX64 = HHX.h64(payload.SALT)
  const hashvalue = parseInt(payload.Hash, 36)

  return new Promise((resolve, reject) => {
    DatabaseInstance
      .findOne({
        $where: function () {
          delete this._id
          const hash = HHX64.update(JSON.stringify(this)).digest().toNumber()
          return hash === hashvalue
        }
      })
      .projection({ DocumentId: 1 })
      .exec((error, founddocument) => {
        if (error) {
          reject(error)
        } else {
          resolve(founddocument !== null ? founddocument.DocumentId : undefined)
        }
      })
  })
}

export function Count (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    const query = payload.Query ? payload.Query : {}
    DatabaseInstance
      .count(query, (error, count) => {
        if (error) {
          reject(error)
        } else {
          resolve(count)
        }
      })
  })
}

export function Update (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    const query = payload.Query ? payload.Query : {}
    const update = payload.Update ? payload.Update : {}
    const options = payload.Options ? payload.Options : {}
    DatabaseInstance
      .update(query, update, options, (error, numrows) => {
        if (error) {
          reject(error)
        } else {
          resolve(numrows)
        }
      })
  })
}

export function Remove (payload, DatabaseInstance) {
  return new Promise((resolve, reject) => {
    const query = payload.Query ? payload.Query : {}
    const options = payload.Options ? payload.Options : {}
    DatabaseInstance
      .remove(query, options, (error, numrows) => {
        if (error) {
          reject(error)
        } else {
          resolve(numrows)
        }
      })
  })
}
