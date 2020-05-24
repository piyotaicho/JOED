<template>
  <div>
    <div id="sort-overlay" @click="closeMenu">
    </div>
    <div id="sort-menu">
      <div class="menu-title"><span>ソート</span></div>
      <div class="menu-item"><span>[.]</span><span>登録順</span><span>昇順/降順</span></div>
      <div class="menu-item"><span>[.]</span><span>手術日</span><span>昇順/降順</span></div>
      <div class="menu-item"><span>[.]</span><span>手術カテゴリ</span><span>昇順/降順</span></div>
      <div class="menu-item"><span>[.]</span><span>手術時間</span><span>昇順/降順</span></div>
      <div class="menu-title"><span>フィルタ</span></div>
      <div class="menu-item"><span>表示カテゴリ</span><span>腹腔鏡</span><span>腹腔鏡悪性</span></div>
      <div class="menu-item"><span></span><span>ロボット支援下</span><span>ロボット支援下悪性</span></div>
      <div class="menu-item"><span></span><span>子宮鏡</span></div>
      <div class="menu-item"><span></span><span>卵管鏡</span></div>
      <div class="menu-item"><span>表示する手術日</span><span>開始</span><span>終了</span></div>
      <div class="menu-item"><span>合併症あり のみ</span></div>
      <div class="menu-item"><span>警告あり のみ</span></div>
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
