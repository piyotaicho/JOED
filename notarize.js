const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
    console.dir(context)
    const { electronPlatformName, appOutDir } = context
    if (electronPlatformName !== 'darwin') {
      return
    }
    console.log('notarizing')

    const appName = context.packager.appInfo.productFilename
  
    const retval = await notarize({
      appBundleId: 'jp.jsgoe.joed5',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
    })
    console.log('notarize done.')
    return retval
}
