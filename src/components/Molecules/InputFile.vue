<template>
  <div style="display: inline-block;">
    <input type="file" ref="inputfile" style="display: none;" :accept="AcceptFileTypes" @change="SelectionMade" />
    <el-button type="primary" @click="OpenFileDialog" :disabled="disabled">{{ButtonText}}</el-button>
  </div>
</template>

<script>
import Encoding from 'encoding-japanese'

export default {
  name: 'InputFile',
  props: {
    ButtonText: {
      default: 'ファイルを指定'
    },
    AcceptFileTypes: {
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    OpenFileDialog () {
      this.$refs.inputfile.click()
    },
    SelectionMade (event) {
      const files = event.target.files || event.dataTransfer.files
      const reader = new FileReader()
      reader.onload = () => {
        const dataArray = new Uint8Array(reader.result)
        this.$emit('load',
          Encoding.convert(dataArray, {
            to: 'UNICODE',
            from: Encoding.detect(dataArray),
            type: 'string'
          })
        )
      }
      reader.readAsArrayBuffer(files[0])
    }
  }
}
</script>
