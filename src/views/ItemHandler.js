// eslint-disable-next-line no-unused-vars
export default class SelectionTree {
  constructor (initialTree = {}) {
    Object.assign(this, initialTree)
  }

  fetchCategories () {
    return Object.keys(this)
  }

  fetchTargets (category = '') {
    return category !== '' ? Object.keys(this[category]) : []
  }

  fetchSelections (category = '', target = '') {
    return (category !== '' && target !== '')
      ? this[category][target].map(value => typeof (value) === 'object' ? Object.keys(value)[0] : value)
      : []
  }

  static getPropertyValue (hashObject = {}, $propertyName = 'Text') {
    if (hashObject[$propertyName]) {
      return hashObject[$propertyName]
    } else {
      // eslint-disable-next-line prefer-const
      for (let key in hashObject) {
        const value = this.getPropertyValue(hashObject[key], $propertyName)
        if (value) {
          return value
        }
      }
      return undefined
    }
  }

  static getItemChain (hashObject = {}, $propertyName = 'Text', $temporaryArray = []) {
    if (hashObject[$propertyName] !== undefined) {
      return $temporaryArray.push(hashObject[$propertyName]) && $temporaryArray
    } else {
      // eslint-disable-next-line prefer-const
      for (let key in hashObject) {
        const newArray = this.getItemChain(hashObject[key], $propertyName, [...$temporaryArray, key])
        if (newArray.length > $temporaryArray.length) {
          return newArray
        }
      }
      return []
    }
  }
}
