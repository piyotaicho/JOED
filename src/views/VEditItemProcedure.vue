<template>
    <div class="overlay">
      <div class="overlay-content">
        <div class="title-box">
          <span>実施手術</span>
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
            <div><span>[候補術式]</span></div>
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
              <span>入力術式 : </span>
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
      '子宮内膜症病巣除去術',
      '子宮付属器癒着剥離術',
      '異所性妊娠手術(その他)',
      '腟式子宮全摘出術(LAVH)',
      '子宮腟上部切断術(腹腔鏡下)',
      '子宮全摘出術(TLH、LH)',
      '子宮筋腫核出術(腹腔鏡下)',
      '子宮筋腫核出術(腹腔鏡補助下)',
      '子宮腺筋症病巣除去術(腹腔鏡下)',
      '腹腔内観察',
      '骨盤臓器脱修復術',
      '仙骨腟固定術',
      '術後合併症の修復術',
      '他の悪性疾患の予防的切除術'
    ],
    付属器: [
      '子宮内膜症病巣除去術',
      '子宮付属器嚢胞摘出術(チョコレート嚢胞)',
      '子宮付属器嚢胞摘出術(その他)',
      '子宮付属器切除術(チョコレート嚢胞)',
      '子宮付属器切除術(その他)',
      '子宮付属器癒着剥離術',
      '卵巣多孔術(開孔術)',
      '卵管結紮術',
      '卵管形成術',
      '異所性妊娠手術(卵管摘出術)',
      '異所性妊娠手術(卵管線状切開術)',
      '異所性妊娠手術(その他)',
      '腹腔内観察',
      '上記以外の付属器手術',
      '卵管切除術',
      'チョコレート嚢胞エタノール固定術',
      '術後合併症の修復術',
      '他の悪性疾患の予防的切除術'
    ],
    その他: [
      '子宮内膜症病巣除去術',
      '子宮付属器癒着剥離術',
      '異所性妊娠手術(その他)',
      '造腟術',
      '腹腔内観察',
      '異所性妊娠',
      '骨盤臓器脱修復術',
      '仙骨腟固定術',
      '術後合併症の修復術',
      '他の悪性疾患の予防的切除術'
    ]
  },
  腹腔鏡悪性: {
    子宮: [
      '腹腔鏡下単純子宮全摘出術',
      '腹腔鏡下準広汎子宮全摘出術',
      '腹腔鏡下広汎子宮全摘出術',
      '腹腔鏡下子宮頸部摘出術',
      '腹腔鏡下リンパ節生検・郭清',
      '治療のために開腹手術へ移行(合併症を除く)',
      'SecondLookOperation',
      '術後合併症の修復術'
    ],
    付属器: [
      '腹腔鏡下病変生検・審査腹腔鏡',
      '治療のために開腹手術へ移行(合併症を除く)',
      '腹腔鏡下付属器摘出術',
      '腹腔鏡下リンパ節生検・郭清',
      'SecondLookOperation',
      '術後合併症の修復術'
    ],
    その他: [
      '腹腔鏡下病変生検・審査腹腔鏡',
      '治療のために開腹手術へ移行(合併症を除く)',
      'SecondLookOperation',
      '術後合併症の修復術'
    ]
  },
  ロボット: {
    子宮: [
      '子宮全摘出術(ロボット支援下)',
      '骨盤臓器脱修復術(ロボット支援下)',
      'ロボット支援下その他'
    ],
    付属器: [
      'ロボット支援下その他'
    ],
    その他: [
      '骨盤臓器脱修復術(ロボット支援下)',
      '仙骨腟固定術(ロボット支援下)',
      'ロボット支援下その他'
    ]
  },
  ロボット悪性: {
    子宮: [
      'ロボット支援下単純子宮全摘出術',
      'ロボット支援下準広汎子宮全摘出術',
      'ロボット支援下広汎子宮全摘出術',
      'ロボット支援下子宮頸部摘出術',
      'ロボット支援下リンパ節生検・郭清',
      '治療のために開腹手術へ移行(合併症を除く)',
      'SecondLookOperation',
      '術後合併症の修復術'
    ]
  },
  子宮鏡: {
    子宮: [
      '子宮筋腫核出術',
      '子宮内膜ポリープ摘出術',
      '子宮内腔癒着剥離術',
      '子宮形成術',
      '子宮内膜焼灼術',
      '胎盤ポリープ・胎盤違残摘出術',
      '子宮鏡検査・内膜剥爬術',
      '異物除去術',
      '子宮頸管ポリープ切除術',
      '子宮鏡下子宮中隔切除術',
      '上記以外の子宮体部腫瘍切除術'
    ]
  },
  卵管鏡: {
    卵管: [
      '卵管鏡下卵管形成術(単独)',
      '卵管鏡下卵管形成術(腹腔鏡併用)'
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
    CommitChanges () {
      if (this.Category !== '' && this.TrimmedEditableItem !== '') {
        this.EmitItem(this.IsItemEdited
          ? { [this.Category]: { Text: this.TrimmedEditableItem, UserTyped: true } }
          : { [this.Category]: { [this.TargetOrgan]: { Text: this.TrimmedEditableItem } } })
        this.GoBack()
      }
    },
    EmitItem (value) {
      this.$emit('data-change',
        '実施手術', this.ItemIndex, value
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
