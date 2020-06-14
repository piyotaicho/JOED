<template>
  <div>
    <el-collapse accordion @change="AccordionChanged" :value="1">
      <el-collapse-item title="表示の順番" :name="1">
        <SortMenu></SortMenu>
      </el-collapse-item>
      <el-collapse-item title="表示のフィルタ" :name="2">
        <FilterMenu></FilterMenu>
      </el-collapse-item>
      <el-collapse-item title="検索" :name="10">
        <input type="text" />
      </el-collapse-item>
      <el-collapse-item title="ユーティリティ" :name="99">
      </el-collapse-item>
    </el-collapse>
    <el-button @click="CloseDrawer">[閉じる]</el-button>
  </div>
</template>

<script>
import SortMenu from '@/components/SortMenu'
import FilterMenu from '@/components/FilterMenu'

export default {
  name: 'Drawer',
  components: {
    SortMenu, FilterMenu
  },
  methods: {
    CloseDrawer () {
      this.$emit('close')
    },
    AccordionChanged (value) {
      if (value === 99) {
        this.$router.push({ name: 'utilities' })
      }
    }
  }
}
</script>

<style lang="sass">

</style>
