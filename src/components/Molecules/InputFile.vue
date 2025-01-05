<script setup>
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

<template>
  <div style="display: inline-block;">
    <input type="file" ref="inputfile" style="display: none;" :accept="props.AcceptFileTypes" @change="selectionMade" />
    <el-button type="primary" @click="openFileDialog" :disabled="props.disabled">{{ButtonText}}</el-button>
  </div>
</template>
