<template>
    <div class="overlay">
      <div class="overlay-content">
        <div class="title-box">
          <span>実施術式</span>
        </div>
        <div class="filter-box">
          <div class="w20 box">
            <div><span>[カテゴリ]</span></div>
            <select v-model="Category"
              size="8"
              v-on:change="TargetOrgan = '', SelectedItem = ''">
              <option v-for="(item,key,index) in GetCategories"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w20 box">
            <div><span>[対象臓器]</span></div>
            <select v-model="TargetOrgan"
              size="8"
              v-on:change="SelectedItem = ''">
              <option v-if="GetTargetOrgans.length===0" value=""/>
              <option v-for="(item,key,index) in GetTargetOrgans"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w60 box">
            <div><span>[候補病名]</span></div>
            <select v-model="SelectedItem"
              size="8"
              v-on:change="EditableItem = SelectedItem; ItemEdited = false"
              v-on:dblclick="CommitChanges">
              <option v-if="GetCandidateItems.length===0" value=""/>
              <option v-for="(item,key,index) in GetCandidateItems"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
        </div>
        <div class="bottom-box">
          <div class="controls">
            <div class="w20">
              <span>入力病名 : </span>
            </div>
            <div class="w60">
              <input type="Text" v-model.lazy="EditableItem" v-on:keydown.enter="SubmitOnEnterkey"/>
            </div>
            <div class="w20"> [SEARCH] </div>
          </div>
          <div>
            <span v-on:click="GoBack"> [編集の取り消し] </span>
            <span v-on:click="CommitChanges"> [編集内容の登録] </span>
            <span v-if="this.ItemIndex >= 0" v-on:click="EraseItem" style="color: red"> [このエントリを削除] </span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'

const ItemTree = {
  腹腔鏡: {
    子宮: [
      '子宮内膜症(チョコレート嚢胞含む)',
      '異所性妊娠',
      '付属器癒着',
      '機能性不妊症(腹腔内検査)',
      '子宮筋腫',
      '子宮腺筋症',
      '子宮奇形',
      '骨盤臓器脱',
      '骨盤腹膜炎'
    ],
    付属器: [
      '子宮内膜症(チョコレート嚢胞含む)',
      '良性卵巣腫瘍',
      '多嚢胞性卵巣症候群',
      '異所性妊娠',
      '卵管閉塞・卵管留水(血)症',
      '付属器癒着',
      '卵巣出血',
      '機能性不妊症(腹腔内検査)',
      '上記以外の付属器良性疾患'
    ],
    その他: [
      '子宮内膜症(チョコレート嚢胞含む)',
      '異所性妊娠',
      '付属器癒着',
      '機能性不妊症(腹腔内検査)',
      '子宮筋腫',
      '先天性腟欠損症',
      '骨盤臓器脱',
      '骨盤腹膜炎'
    ]
  },
  腹腔鏡悪性: {
    子宮: [
      '子宮頸部前癌病変(CIN、CIS、AIS)',
      '子宮頸癌',
      '子宮体部前癌病変(子宮内膜異型増殖症)',
      '子宮体癌',
      '予防的内性器摘出術適応',
      '上記以外の子宮頸部腫瘍(子宮頸部嚢胞性病変、LEGH等)',
      '上記以外の子宮体部腫瘍(APAM、STUMP等)',
      '術後合併症の修復'
    ],
    付属器: [
      '境界悪性卵巣腫瘍',
      '卵巣がん(卵管癌・腹膜癌含む)',
      '予防的内性器摘出術適応',
      '妊孕性温存のための卵巣摘出',
      '転移性卵巣癌',
      '術後合併症の修復'
    ],
    その他: [
      '上記以外の悪性腫瘍',
      '術後合併症の修復'
    ]
  },
  子宮鏡: {
    子宮: [
      '子宮粘膜下筋腫',
      '子宮内膜ポリープ',
      'アッシャーマン症候群',
      '子宮腟異物',
      '子宮奇形',
      '過多月経',
      '子宮頸管ポリープ',
      '子宮体部前癌病変',
      '胎盤ポリープ・胎盤違残',
      '異所性妊娠',
      '上記以外の子宮体部腫瘍',
      '帝王切開瘢痕部症候群',
      '上記以外の子宮頸部腫瘍'
    ]
  },
  卵管鏡: {
    卵管: [
      '卵管閉鎖',
      '卵管狭窄',
      '卵管留水(血)症',
      '機能性不妊'
    ]
  }
}

export default {
  mixins: [
    EditItemMixins
  ],
  computed: {
    GetCategories () {
      return Object.keys(ItemTree)
    },
    GetTargetOrgans () {
      return (ItemTree[this.Category]) ? Object.keys(ItemTree[this.Category]) : []
    },
    GetCandidateItems () {
      return (this.Category !== '' && this.TargetOrgan !== '') ? ItemTree[this.Category][this.TargetOrgan] : []
    }
  },
  methods: {
    EmitItem (value) {
      this.$emit('data-change',
        '手術診断', this.ItemIndex, value
      )
    }
  }
}
</script>

<style lang="sass" scoped>
  div.title-box
    padding: 8px
    font-size: 24px
  div.filter-box
    display: flex
    padding-top: 0.8em
    padding-bottom: 0.8em
    div.box
      padding: 8px
      margin: 8px 0.5em
      select
        margin-top: 0.5em
        padding-left: 8px
        padding-right: 8px
        width: 100%
        option
          height: 1.3em
          padding-top: 0.2em
          padding-bottom: 0.2em
  div.bottom-box
    border: 1px solid black
    padding: 8px
    div.controls
      display: flex
      height: 1.8em
      div
        input
          width: 95%
          height: 1.3em
          padding-top: 2px
          padding-bottom: 2px
          margin-left: 8px
          margin-right: 8px
</style>
