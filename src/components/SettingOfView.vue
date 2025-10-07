<script setup>
import { reactive, computed } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'
import * as Popups from '@/modules/Popups'

const store = useStore()

const data = reactive({
  showStartupDialog: false,
  editJSOGId: false,
  editNCDId: false,
  revertView: false,

  preserve: ''
})

data.showStartupDialog = store.getters['system/ShowStartupDialog']
data.editJSOGId = store.getters['system/EditJSOGId']
data.editNCDId = store.getters['system/EditNCDId']

data.preserve = [data.showStartupDialog, data.editJSOGId, data.editNCDId, data.revertView].join('|')

const changed = computed(() => data.preserve !== [data.showStartupDialog, data.editJSOGId, data.editNCDId, data.revertView].join('|'))

async function commitSettings () {
  store.commit('system/SetPreferences', {
    ShowStartupDialog: data.showStartupDialog,
    EditJSOGId: data.editJSOGId,
    EditNCDId: data.editNCDId
  })
  if (data.revertView) {
    store.commit('system/SetView', {})
  }

  await store.dispatch('system/SavePreferences')
  data.preserve = [data.showStartupDialog, data.editJSOGId, data.editNCDId, data.revertView].join('|')

  Popups.information('設定が変更されました.')
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <div><div class="label"><i class="el-icon-arrow-down" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例表示画面の設定
      </div></div>
      <InputSwitchField
        v-model="data.showStartupDialog"
        title="リスト表示の起動時メッセージの表示"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="data.revertView"
        title="リスト表示内容の規定値を初期設定に戻す"
        :options="{'しない': false, 'する': true}" />

      <div><div class="label"><i class="el-icon-arrow-down" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例編集画面の設定
      </div></div>
      <InputSwitchField
        v-model="data.editJSOGId"
        title="日産婦腫瘍登録 症例番号の入力"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="data.editNCDId"
        title="ロボット支援下手術 NCD症例識別コードの入力"
        :options="{'しない': false, 'する': true}" />
    </div>

    <div>
      <el-button type="primary" :disabled="!changed" @click="commitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>
