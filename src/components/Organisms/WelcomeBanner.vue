<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import CloseButton from '@/components/Atoms/CloseButton'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import TheWrapper from '@/components/Atoms/TheWrapper'

const store = useStore()

const isShowStartupDialog = ref(store.getters['system/Settings'].ShowStartupDialog)

function closeDialog () {
  store.dispatch('system/SetAndSaveShowStartupDialog', isShowStartupDialog.value)
  store.commit('system/CloseStartupDialog')
}
</script>

<template>
  <div>
    <TheWrapper alpha="60">
    <div id="welcome-banner-dialog">
      <div id="welcome-banner-title">JOED5へようこそ</div>
      <div id="welcome-banner-text">
        症例・合併症登録にご協力頂きありがとうございます.<br/>
        症例登録は、右上の<span class="welcome-banner-elementIcon">&#xe6d9;</span>ボタンを押して開始して下さい.<br/>
        リストのソートなど各種機能は左上の<span class="welcome-banner-elementIcon">&#xe798;</span>ボタンからご利用いただけます.<br/>
        初期設定やファイルの入出力はメニューから利用して下さい.<br/>
        <br />
        お問い合わせは学会の症例登録ページからおねがいいたします.<br />
      </div>

      <div id="welcome-banner-control">
        <LabeledCheckbox :container.sync="isShowStartupDialog">
          次回起動時もこのメッセージを表示する
        </LabeledCheckbox>
      </div>
      <div id="welcome-banner-footer">
        日本産科婦人科内視鏡学会 調査普及委員会
      </div>
      <CloseButton @click="closeDialog" tabindex="0"/>
    </div>
    </TheWrapper>
  </div>
</template>

<style lang="sass">
#welcome-banner-dialog
  position: relative
  width: 600px
  margin: 8rem auto
  padding: 1.6rem
  border: 2px solid black
  border-radius: 1rem
  background: white

#welcome-banner-title
  font-size: 1.4rem
  font-weight: bold
  text-align: center
  padding-bottom: 0.4rem
  border-bottom: solid 1px #252525 // $--color-text-regular
  color: #252525 // $--color-text-regular

#welcome-banner-text
  padding-top: 1.2rem
  font-size: 1rem
  line-height: 1.8rem
  letter-spacing: 0.23px
  text-align: left
  color: #121212 // $--color-text-primary

#welcome-banner-control
  padding-top: 2rem
  font-size: 1rem
  line-height: 3rem
  letter-spacing: 0.2px
  text-align: center
  color: #121212 // $--color-text-primary

#welcome-banner-footer
  padding-top: 1.4rem
  font-size: 0.95rem
  text-align: right
  padding-right: 1.2rem
  color: #252525 // $--color-text-regular

.welcome-banner-elementIcon
  font-family: 'element-icons'
  padding-left: 0.12rem
  padding-right: 0.12rem
</style>
