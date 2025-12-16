<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import { alert as alertPopup, confirm, confirmYesNo, prompt } from '@/modules/Popups'
import InputSwitchField from './Molecules/InputSwitchField.vue'
import { ElLoading } from 'element-plus'
import { relaunchApp } from 'depmodules/config'

const store = useStore()

const removeBackupFiles = ref(false)

const backupDatabase = async () => {
  // システム設定を取得
  const settings = await store.dispatch('system/LoadPreferences')
  // ドキュメントをデータベースからダンプ
  const documents = await store.dispatch('dbDump')

  // バックアップJSON文字列を作成(整形なし)
  const outputText = JSON.stringify([
    { Settings: settings },
    ...documents
  ])

  // ファイルとしてダウンロード
  if (await confirm('保存されるデータには要配慮個人情報が含まれています.\n出力されたファイルの取扱は厳重に行ってください.')) {
    const temporaryElementA = document.createElement('A')
    temporaryElementA.href = URL.createObjectURL(new Blob([outputText], { type: 'application/json' }))
    temporaryElementA.download = `joed-whole-backup-${new Date().toISOString().slice(0,10)}.json`
    temporaryElementA.style.display = 'none'
    document.body.appendChild(temporaryElementA)
    temporaryElementA.click()
    document.body.removeChild(temporaryElementA)
  }
}

const restoreDatabase = async () => {
  // データベースが空であることを確認
  if (store.getters['TotalNumberOfCases'] > 0) {
    await alertPopup('情報が既に存在しています.\n先にデータベースを初期化してください.')
    return
  }

  // 一時的にファイル入力要素を作成
  const temporaryElementInput = document.createElement('INPUT')
  temporaryElementInput.type = 'file'
  temporaryElementInput.accept = 'application/json'
  temporaryElementInput.style.display = 'none'
  document.body.appendChild(temporaryElementInput)
  temporaryElementInput.onchange = async () => {
    try {
      const file = temporaryElementInput.files[0]
      const text = await file.text()
      const data = JSON.parse(text)

      const settingIndex = data.findIndex(item => item.Settings)
      if (!Array.isArray(data) || data.length < 1 || settingIndex < 0) {
        throw new Error('不正なファイルです.')
      }

      if (await confirmYesNo('データベースの内容はバックアップファイルの内容で上書きされます.\nこの操作は元に戻せません.')) {
        const loading = ElLoading.service({ fullscreen: true, text: 'データベースを復元中...' })
        // システム設定を復元し保存
        const settings = data.splice(settingIndex, 1)[0].Settings
        store.commit('system/SetPreferences', settings)
        await store.dispatch('system/SavePreferences')

        // ドキュメントを復元
        let count = 1
        for (const document of data) {
          loading.text = `データベースを復元中... (${count}/${data.length})`
          await store.dispatch('dbInsert', {Document: document})
          count++
        }

        loading.close()

        await alertPopup('データベースの復元が完了しました.\nアプリケーションをリロードします.')
        relaunchApp()
      }
    } catch (error) {
      await alertPopup(`処理を中止しました.\n${error.message}`)
    } finally {
      document.body.removeChild(temporaryElementInput)
    }
  }
  temporaryElementInput.click()
}

const dropDatabase = async () => {
  const passphrase = ['DELETE', 'delete', '削除', 'バルス'][Math.floor(Math.random() * 4)]

  if (await confirmYesNo('この操作はデータベースの内容を完全に削除します.\nこの操作は元に戻せません.')) {
    const input = await prompt(`続行するには "${passphrase}" と入力してください.`)
    if (input === passphrase || input === `"${passphrase}"`) {
      await store.dispatch('dbDrop', removeBackupFiles.value)
      await alertPopup('データベースが完全に削除されました. \nアプリケーションをリロードします.')
      relaunchApp()
    } else {
      await alertPopup('操作がキャンセルされました.')
    }
  }
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <div>
        <div class="label w60">
          システム設定・データベースのバックアップ取得
        </div>
        <div class="field w40">
          <el-button type="primary" @click="backupDatabase">実行</el-button>
        </div>
      </div>

      <div>
        <div class="label w60">
          システム設定・データベースをバックアップから復元
        </div>
        <div class="field w40">
          <el-button type="danger" @click="restoreDatabase" :disabled="store.getters['TotalNumberOfCases'] > 0">実行</el-button>
        </div>
      </div>

      <div>
        <div class="label w80" style="color: var(--color-danger); margin-top: 2rem;">
          以下の操作はデータを失う可能性があります。<br/>必要ならば実行前にバックアップを取得してください。
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <div class="label w60">
          データベースの完全削除
        </div>
        <div class="field w40">
          <el-button type="danger" @click="dropDatabase">実行</el-button>
        </div>
      </div>
      <InputSwitchField
        title="バックアップファイルの削除設定"
        v-model="removeBackupFiles"
        :options="[{ text: '残す' }, { text: '削除する' }]"
        :class-override="['label w60', 'field w40']"/>

    </div>
  </div>
</template>
