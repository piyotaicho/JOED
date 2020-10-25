<template>
  <div class="utility">
    <div class="utility-switches wide-label">
      <div><div class="label"><i class="el-icon-s-tools" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例表示画面の設定
      </div></div>
      <InputSwitchField
        v-model="displayDialogInList"
        title="リスト表示の起動時のメッセージボックスを表示する"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="saveCurrentView"
        title="現在のリスト表示設定を初期設定にする"
        :options="{'しない': false, 'する': true}" />

      <div><div class="label"><i class="el-icon-s-tools" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例編集画面の設定
      </div></div>
      <InputSwitchField
        v-model="skipJSOGIdEntry"
        title="日産婦の腫瘍登録症例番号の入力"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="skipNCDIdEntry"
        title="ロボット支援下手術におけるNCD症例番号の入力"
        :options="{'しない': false, 'する': true}" />
    </div>

    <div>
      <el-button type="primary" :disabled="!changed" @click="CommitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import Popups from 'depmodules/Popups'

export default {
  name: 'SettingOfView',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      displayDialogInList: false,
      skipJSOGIdEntry: false,
      skipNCDIdEntry: false,
      saveCurrentView: false,

      preserve: ''
    })
  },
  created () {
    const settings = this.$store.getters['system/Settings']
    this.displayDialogInList = settings.ShowStartupDialog
    this.skipJSOGIdEntry = !settings.EnterJSOGId
    this.skipNCDIdEntry = !settings.EnterNCDId
    this.saveCurrentView = false

    this.preserve = [this.displayDialogInList, this.skipJSOGIdEntry, this.skipNCDIdEntry, this.saveCurrentView].join('|')
  },
  computed: {
    changed () {
      return this.preserve !==
        [this.displayDialogInList, this.skipJSOGIdEntry, this.skipNCDIdEntry, this.saveCurrentView].join('|')
    }
  },
  methods: {
    async CommitSettings () {
      this.$store.commit('system/SetPreferences', {
        ShowStartupDialog: this.displayDialogInList,
        EnterJSOGId: !this.skipJSOGIdEntry,
        EnterNCDId: !this.skipNCDIdEntry
      })
      await this.$store.dispatch('system/SavePreferences')
      Popups.information('設定が変更されました.')
    }
  }
}
</script>
