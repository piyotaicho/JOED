<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: String
  }
})

const item = computed(() => JSON.parse(props.item || '{}'))
</script>

<template>
  <div class="AE-popper">
    <div>合併症の内容: {{ item.Category }}</div>
    <template v-if="item.Category === '出血'">
      <div>出血量: {{ (item.BloodCount === '不明') ? '不明' : item.BloodCount + 'ml'}}</div>
    </template>
    <template v-else>
      <div v-if="item.Title">発生した合併症: {{ item.Title.join(', ') }}</div>
      <div v-if="item.Cause">原因: {{ item.Cause.join(', ') }}</div>
      <div v-if="item.Location">部位: {{ item.Location.join(', ') }}</div>
    </template>
    <div>合併症の程度: Grade {{ item.Grade }}</div>
    <div>転帰: {{ item.Course.join(', ') }}</div>
  </div>
</template>

<style lang="sass">
// override element's style
.el-tooltip__popper
  font-size: 0.85rem
  line-height: 1.15rem

div.AE-popper
  max-width: 40rem
  div:nth-child(2),:nth-last-child(2)
    margin-top: 0.5rem
</style>
