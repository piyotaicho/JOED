<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object
  }
})
</script>

<template>
  <div class="AE-popper">
    <div>合併症の内容: {{ props.item.Category }}</div>
    <template v-if="props.item.Category === '出血'">
      <div>出血量: {{ (props.item.BloodCount === '不明') ? '不明' : props.item.BloodCount + 'ml'}}</div>
    </template>
    <template v-else>
      <div v-if="props.item.Title">発生した合併症: {{ props.item.Title.join(', ') }}</div>
      <div v-if="props.item.Cause">原因: {{ props.item.Cause.join(', ') }}</div>
      <div v-if="props.item.Location">部位: {{ props.item.Location.join(', ') }}</div>
    </template>
    <div>合併症の程度: Grade {{ props.item.Grade }}</div>
    <div>転帰: {{ props.item.Course.join(', ') }}</div>
  </div>
</template>

<style lang="sass">
// override element's style
.el-tooltip__popper
  font-size: 0.85rem
  line-height: 1.15rem

div.AE-popper
  max-width: 30rem
  div:nth-child(2),:nth-last-child(2)
    margin-top: 0.5rem
</style>
