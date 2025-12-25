<script setup>
import TheWrapper from '@/components/Atoms/TheWrapper.vue'

const props = defineProps({
  buttonLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click', 'buttonClick'])

const onClick = () => emit('click')
const onButtonClick = () => emit('buttonClick')
</script>

<template>
    <TheWrapper alpha="60" @click="onClick()">
      <div>
        <div id="preview">
          <div>
            画面のクリックで表示を終了します. <el-button v-if="props.buttonLabel !== ''" type="primary" @click.stop="onButtonClick()">{{props.buttonLabel}}</el-button>
          </div>
          <pre><slot></slot></pre>
        </div>
      </div>
    </TheWrapper>
</template>

<style lang="sass">
div#preview
  position: relative
  height: 80%
  overflow-y: none
  overflow-x: hidden
  margin: 1rem 4rem
  padding: 1rem
  box-sizing: border-box
  width: calc(100% - 8rem)
  border: 2px solid var(--color-text-primary)
  border-radius: 0.5rem
  background: var(--background-color-list)
div#preview div
  box-sizing: content-box
  height: 100%
  border-bottom: 0.12rem solid var(--color-text-primary)
  line-height: 2rem
  padding-bottom: 1.7rem
div#preview pre
  overflow-x: hidden
  text-overflow: ellipsis
div#preview button
  position: absolute
  right: 2rem
</style>
