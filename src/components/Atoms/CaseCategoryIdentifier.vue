<script setup>
import { computed } from 'vue'
import { Select } from '@element-plus/icons-vue'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  notification: {
    type: String,
  },
  checked: {
    type: Boolean,
    default: false,
  },
})

const boxColorStyle = computed(() => {
  const colorTable = {
    腹腔鏡: '#8CF700',
    腹腔鏡悪性: '#8CF700',
    ロボット: '#00F063',
    ロボット悪性: '#00F063',
    子宮鏡: '#00BBFF',
    卵管鏡: '#FFD000',
  }
  return { backgroundColor: colorTable[props.category] || '#DDDDDD' }
})

const notificationClass = computed(() =>
  props?.notification || props.notification !== '' ? ['has-notification'] : [''],
)

const malignancyClass = computed(() => {
  switch (props.category) {
    case '腹腔鏡悪性':
    case 'ロボット悪性':
      return 'category-malignancy'
    default:
      return ''
  }
})
</script>

<template>
  <div class="casecategory" :class="notificationClass" :style="boxColorStyle">
    <div :class="malignancyClass"></div>
    <el-icon style="padding-top: 0.3rem;" v-if="checked"><Select /></el-icon>
  </div>
</template>

<style lang="sass">
div.casecategory
  position: relative
  border: var(--color-primary) 2px solid
  margin: auto
  width: 1.7rem
  height: 1.7rem
  text-align: center
  vertical-align: middle

div.has-notification::after
  position: absolute
  content: ""
  top: -0.4rem
  right: -0.4rem
  width: 0.75rem
  height: 0.75rem
  background-color: var(--color-danger)
  border-radius: 50%
  z-index: 1

div.category-malignancy::after
  position: absolute
  content: ""
  background: transparent
  right: 0
  bottom: 0
  width: 0
  height: 0
  border-top: 0.5rem solid transparent
  border-left: 0.5rem solid transparent
  border-right: 0.5rem solid var(--color-primary)
  border-bottom: 0.5rem solid var(--color-primary)
</style>
