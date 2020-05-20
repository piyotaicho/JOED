<template>
  <div>
    <div id="sort-overlay" @click="closeMenu">
    </div>
    <div id="sort-menu">
      <div class="menu-title"><span>ソートの設定</span></div>
      <div class="menu-item"><span>[.]</span><span>登録順</span><span>昇順/降順</span></div>
      <div class="menu-item"><span>[.]</span><span>手術日</span><span>昇順/降順</span></div>
      <div class="menu-item"><span>[.]</span><span>年齢</span><span>昇順/降順</span></div>
      <div><span @click="closeMenu">[閉じる]</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewListSort',
  methods: {
    closeMenu () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>

<style lang="sass">
div#sort-overlay
  z-index: 90
  position: absolute
  top: 32px
  left: 0
  bottom: 0
  right: 0
  opacity: 1
div#sort-menu
  z-index: 99
  position: absolute
  top: 32px
  left: 100px
  width: 300px
  min-height: 200px
  background: #dbdbdb
  opacity: 1
  border: 1px solid black
  border-top-color: #dbdbdb
  padding: 5px
  display: flex
  flex-direction: column
</style>
