<script setup>
import { defineEmits } from 'vue'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'

const emit = defineEmits('click')

const onClick = () => {
  emit('click')
}
</script>

<template>
    <TheWrapper alpha="60" @click="onClick()">
      <div>
        <div id="preview">
          画面のクリックで戻ります.
          <hr />
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
  margin: 1rem 4rem
  padding: 1rem
  border: 2px solid var(--color-text-primary)
  border-radius: 0.5rem
  background: var(--background-color-list)
</style>
