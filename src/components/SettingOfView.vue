<template>
  <div class="utility">
    <div class="utility-switches wide-label">
      <div><div class="label"><i class="el-icon-s-tools" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例表示画面の設定
      </div></div>
      <InputSwitchField
        v-model="showStartupDialog"
        title="リスト表示の起動時のメッセージボックスを表示する"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="revertView"
        title="表示設定の規定値を初期設定に戻す"
        :options="{'しない': false, 'する': true}" />

      <div><div class="label"><i class="el-icon-s-tools" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
        症例編集画面の設定
      </div></div>
      <InputSwitchField
        v-model="editJSOGId"
        title="日産婦腫瘍登録 症例番号の入力"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="editNCDId"
        title="ロボット支援下手術の NCD症例番号の入力"
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
      showStartupDialog: false,
      editJSOGId: true,
      editNCDId: true,
      revertView: false,

      preserve: ''
    })
  },
  created () {
    const settings = this.$store.getters['system/Settings']
    this.$set(this, 'showStartupDialog', settings.ShowStartupDialog)
    this.$set(this, 'editJSOGId', settings.EditJSOGId)
    this.$set(this, 'editNCDId', settings.EditNCDId)
    this.Preserve()
  },
  computed: {
    changed () {
      return this.preserve !==
        [this.showStartupDialog, this.editJSOGId, this.editNCDId, this.revertView].join('|')
    }
  },
  methods: {
    Preserve () {
      this.$set(this, 'preserve', [this.showStartupDialog, this.editJSOGId, this.editNCDId, this.revertView].join('|'))
    },
    async CommitSettings () {
      this.$store.commit('system/SetPreferences', {
        ShowStartupDialog: this.showStartupDialog,
        EditJSOGId: this.editJSOGId,
        EditNCDId: this.editNCDId
      })
      if (this.revertView) {
        this.$store.commit('system/SetView', {})
      }
      await this.$store.dispatch('system/SavePreferences')
      this.Preserve()

      Popups.information('設定が変更されました.')
    }
  }
}
</script>
