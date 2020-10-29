<template>
  <div>
    <el-tabs v-model="SelectedTab" @tab-click="TabClick">
      <el-tab-pane name="goback">
        <span slot="label"><i class="el-icon-d-arrow-left" /> 戻る</span>
      </el-tab-pane>
      <el-tab-pane label="施設情報の設定" name="institute">
        <SettingOfInstutute></SettingOfInstutute>
      </el-tab-pane>
      <el-tab-pane label="パスワード認証の設定" name="authentication">
        <SettingOfAuthentication></SettingOfAuthentication>
      </el-tab-pane>
      <el-tab-pane label="表示の設定" name="view">
        <SettingOfView></SettingOfView>
      </el-tab-pane>
      <el-tab-pane label="ライセンス表記" name="about">
        <About></About>
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
  methods: {
    TabClick (tab, event) {
      // 左端のタブは戻る
      if (tab.index === '0') {
        this.$router.push({ name: 'list' })
      }
    }
  }
}
</script>
