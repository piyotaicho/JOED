<template>
  <el-tooltip placement="top-start" :open-delay="700">
    <div slot="content">
      <DescriptionOfAE :item="item"/>
    </div>

    <div class="section-item" tabindex="0" @keydown.delete="RemoveItem">
      <span class="w20">{{ item.Category }}</span>
      <span class="w30">
        {{ (item.Category === '出血')
          ? (item.BloodCount === '不明'
            ? '出血量不明'
            : item.BloodCount + 'ml')
          : ' … ' + ((item.Title&&item.Title[0])
            ||(item.Cause&&item.Cause[0])) }}
      </span>
      <span class="w20">( Grade : {{item.Grade}} )</span>
      <i class="remove-button el-icon-delete" @click="RemoveItem" />
    </div>
  </el-tooltip>
</template>

<script>
import DescriptionOfAE from '@/components/Molecules/DescriptionOfAE'

export default {
  name: 'SectionAEItem',
  components: { DescriptionOfAE },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    RemoveItem () {
      this.$emit('remove')
    }
  }
}
</script>
