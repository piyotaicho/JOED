// Unlink unused files in electron distribution
// called by electronBuilder - afterpack
exports.default = async function (context) {
  if (process.platform === 'win32') {
    const fs = require('fs')
    const path = require('path')

    // unlink ununsed locales, other than 'en-US'
    const localeDir = path.resolve(context.appOutDir, './locales')
    await new Promise((resolve, reject) => {
      fs.readdir(localeDir, (error, files) => {
        if (error) {
          reject(error)
        } else {
          resolve(files)
        }
      })
    }).then(files => {
      if (files && files.length) {
        for (const file of files) {
          if (!/en-US\.pak/.test(file)) {
            fs.unlinkSync(path.resolve(localeDir, file))
          }
        }
      }
    })

    // unlink electron license files
    fs.unlinkSync(path.resolve(context.appOutDir, './LICENSE.electron.txt'))
    fs.unlinkSync(path.resolve(context.appOutDir, './LICENSES.chromium.html'))
  }
}
