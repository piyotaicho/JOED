<script setup lang="ts">
import { ref } from 'vue'
import Encoding from 'encoding-japanese'

const props = defineProps({
  ButtonText: {
    type: String,
    default: 'ファイルを指定'
  },
  AcceptFileTypes: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits<{
  (e: 'load', content: string): void
}>()

const inputfile = ref<HTMLInputElement | null>(null)

function openFileDialog (): void {
  inputfile.value?.click()
}

function selectionMade (event: Event): void {
  const input = event.target as HTMLInputElement | null
  const files = input?.files
  if (!files || files.length === 0) {
    return
  }
  const selectedFile = files.item(0)
  if (!selectedFile) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    if (!(reader.result instanceof ArrayBuffer)) {
      return
    }
    const dataArray = new Uint8Array(reader.result)
    emit('load',
      String(Encoding.convert(dataArray, {
        to: 'UNICODE',
        from: Encoding.detect(dataArray),
        type: 'string'
      }))
    )
  }
  reader.readAsArrayBuffer(selectedFile)
}
</script>

<template>
  <div style="display: inline-block;">
    <input type="file" ref="inputfile" style="display: none;" :accept="props.AcceptFileTypes" @change="selectionMade" />
    <el-button type="primary" @click="openFileDialog" :disabled="props.disabled">{{ButtonText}}</el-button>
  </div>
</template>
