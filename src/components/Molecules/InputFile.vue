<template>
  <div style="display: inline-block;">
    <input type="file" ref="inputfile" style="display: none;" :accept="props.AcceptFileTypes || ''" @change="selectionMade" />
    <el-button type="primary" @click="openFileDialog" :disabled="props.disabled">{{ButtonText || 'ファイルを選択'}}</el-button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import Encoding from 'encoding-japanese'

const props = defineProps(['ButtonText', 'AcceptFileTypes', 'disabled'])
const emit = defineEmits(['load'])

const inputfile = ref()

function openFileDialog () {
  inputfile.value.click()
}

function selectionMade (event) {
  const files = event.target.files || event.dataTransfer.files
  const reader = new FileReader()
  reader.onload = () => {
    const dataArray = new Uint8Array(reader.result)
    emit('load',
      Encoding.convert(dataArray, {
        to: 'UNICODE',
        from: Encoding.detect(dataArray),
        type: 'string'
      })
    )
  }
  reader.readAsArrayBuffer(files[0])
}
</script>
