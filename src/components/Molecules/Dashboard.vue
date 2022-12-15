<template>
  <div>
    <div class="dashboard">
      <CloseButton @click="Close"/>
      <div class="dashboard-title" ref="title">{{InstituteName}}</div>
      <div class="dashboard-row">
        <span>{{YearOfMaster}}年版マスタ</span>
        <span>表示 {{ViewCount}}件 / 全 {{TotalCount}}件</span>
      </div>
    </div>
  </div>
</template>

<script>
import CloseButton from '@/components/Atoms/CloseButton'
import DiagnosisMaster from '@/modules/Masters/DiagnosisMaster'

export default {
  name: 'ListDashboard',
  components: {
    CloseButton
  },
  created () {
    const master = new DiagnosisMaster()
    this.YearOfMaster = master.Year()
  },
  data () {
    return ({
      YearOfMaster: '0000'
    })
  },
  computed: {
    InstituteName () {
      return this.$store.getters['system/InstitutionName'] || '(施設名称未設定)'
    },
    ViewCount () {
      return this.$store.getters.NumberOfCases
    },
    TotalCount () {
      return this.$store.getters.TotalNumberOfCases
    }
  },
  methods: {
    Close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="sass">
div.dashboard
  margin: 0.7rem
  margin-right: 0.5rem
  padding: 0.3rem
  border: 0.18rem solid var(--border-color-base)
  border-radius: 0.3rem

div.dashboard-title
  margin: 0.3rem 0
  font-size: 1.3rem
  line-height: 1.8rem
  font-weight: bold
  letter-spacing: 0.08rem
  overflow-wrap: break-word
  word-break: break-word

div.dashboard-row
  display: flex
  flex-direction: row
  justify-content: space-around
  font-size: 0.95rem
</style>
