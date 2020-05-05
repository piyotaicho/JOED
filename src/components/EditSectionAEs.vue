<template>
  <div class="section">
    <span class="section-title">合併症 ： </span>
    <span>
      <label>
        <input type="checkbox" v-model="ItemOption">
        合併症なし
      </label>
    </span>
    <draggable handle=".handle" v-model="ItemContainer">
      <div class="list-item"
        v-for="(item, index) in ItemContainer"
        :key="index">
        <ItemOfSection :item="item" @click="RemoveItem(index)" v-slot="slotProps">
          <span class="w20">{{ slotProps.item.Category }}</span>
          <span class="w30">
            {{ (slotProps.item.Category === '出血')
              ? (slotProps.item.BloodCount === '不明'
                ? '出血量不明'
                : slotProps.item.BloodCount + 'ml')
              : slotProps.item.Title[0] }}
          </span>
          <span class="w20">( Grade : {{slotProps.item.Grade}} )</span>
        </ItemOfSection>
      </div>
    </draggable>
    <span class="new-entry-button" @click="AddNewItem()"></span>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'EditSectionAEs',
  mixins: [EditSectionMixins]
}
</script>
