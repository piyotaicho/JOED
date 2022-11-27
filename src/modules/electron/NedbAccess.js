// ElectromIPCinvokeへのラッパー
// 全てのinvokeはPromiseなのでasyncで覆う
export async function Insert (payload) {
  return window.API.Insert(payload)
}

export async function Find (payload) {
  return window.API.Find(payload)
}

export async function FindOne (payload) {
  return window.API.FindOne(payload)
}

export async function FindOneByHash (payload) {
  return window.API.FindOneByHash(payload)
}

export async function Count (payload) {
  return window.API.Count(payload)
}

export async function Update (payload) {
  return window.API.Update(payload)
}

export async function Remove (payload) {
  return window.API.Remove(payload)
}
