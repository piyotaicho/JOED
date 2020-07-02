<template>
  <div id="welcome-banner" @click="Close">
    <div id="welcome-banner-title">JOED5へようこそ</div>
    <div id="welcome-banner-text">
      症例合併症登録にご協力頂きありがとうございます。<br/>
      症例登録は、右上の<span class="welcome-banner-elementIcon">&#xe6d9;</span>ボタンを押して開始して下さい.
      リストのソート・初期設定など各種機能は左上の<span class="welcome-banner-elementIcon">&#xe798;</span>ボタンからご利用いただけます.<br/>
      <br />
      お問い合わせは学会の症例登録ページからおねがいいたします.<br />
    </div>
    <div id="welcome-banner-footer">
      日本産科婦人科内視鏡学会 調査普及委員会
    </div>
    <div id="welcome-banner-closebutton">&#xe6db;</div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeBanner',
  methods: {
    Close () {
      this.$store.commit('HideWelcome')
    }
  }
}
</script>
<style lang="sass">
#welcome-banner
  position: absolute
  width: 600px
  z-index: 9999
  left: 150px
  top: 200px
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

#welcome-banner-footer
  padding-top: 1.4rem
  font-size: 0.95rem
  text-align: right
  padding-right: 1.2rem
  color: #252525 // $--color-text-regular

#welcome-banner-closebutton
  position: absolute
  right: 1rem
  top: 1rem
  width: 1rem
  height: 1rem
  font-family: 'element-icons'
  font-size: 0.7rem

.welcome-banner-elementIcon
  font-family: 'element-icons'
  padding-left: 0.12rem
  padding-right: 0.12rem
</style>
