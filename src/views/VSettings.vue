<template>
  <div>
    <el-tabs v-model="SelectedTab" tab-position="left" @tab-click="TabClick">
      <el-tab-pane name="list">
        <template v-slot:label>
          <span><i class="el-icon-d-arrow-left" /> 戻る</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="施設情報の設定" name="institute">
        <SettingOfInstutute/>
      </el-tab-pane>
      <el-tab-pane label="パスワード認証の設定" name="authentication">
        <SettingOfAuthentication/>
      </el-tab-pane>
      <el-tab-pane label="表示・入力の設定" name="view">
        <SettingOfView/>
      </el-tab-pane>
      <el-tab-pane label="ライセンス表記" name="about">
        <About/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SettingOfInstutute from '@/components/SettingOfInstitute'
import SettingOfAuthentication from '@/components/SettingOfAuthentication'
import SettingOfView from '@/components/SettingOfView'
import About from '@/components/About'

export default {
  name: 'VSettings',
  components: {
    SettingOfInstutute, SettingOfAuthentication, SettingOfView, About
  },
  data () {
    return ({
      SelectedTab: 'institute'
    })
  },
  mounted () {
    document.addEventListener('keydown', this.EventLister, true)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.EventLister, true)
  },
  methods: {
    EventLister (event) {
      if (this.$store.getters['system/Platform'] === 'darwin'
        ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
        : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
      ) {
        if (event.code === 'KeyU') {
          this.TabClick({ index: 0 })
        }
      }
    },
    TabClick (tab) {
      if (Number(tab.index) === 0) {
        this.$router.push({ name: 'list' })
      }
    }
  }
}
</script>
