const _Database = require('nedb')

export function CreateInstance (payload) { // }, NedbDatabaseObject) {
  const config = Object.assign(
    {
      filename: '',
      autoload: true,
      compareStrings: function (a, b) { return StringCompare(a, b) }
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

const TimeStringMatch = new RegExp(/[1-9]\d?0分/)
const ExtractTime = new RegExp(/([1-9]\d?0)分(以上|未満)/)

function StringCompare (stringA = '', stringB = '') {
  if (TimeStringMatch.test(stringA) && TimeStringMatch.test(stringB)) {
    const matchA = ExtractTime.exec(stringA)
    const valueA = Number(matchA[1]) - ((matchA[2] || '以上') === '未満' ? 1 : 0)
    const matchB = ExtractTime.exec(stringB)
    const valueB = Number(matchB[1]) - ((matchB[2] || '以上') === '未満' ? 1 : 0)
    return valueA === valueB ? 0 : valueA < valueB ? -1 : 1
  } else {
    return stringA.localeCompare(stringB)
  }
}
