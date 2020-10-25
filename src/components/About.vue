<template>
  <div>
    <h2>ABOUT JOED5</h2>
    <hr />
    <ul>
      <li><ExtLink url="https://github.com/piyotaicho/JOED/">JOED</ExtLink>-5 : {{ApplicationVersion}}</li>
      <template v-if="LibraryVersions.electron">
        <li>Electron : {{LibraryVersions.electron}}</li>
        <li>Chrome : {{LibraryVersions.chrome}}</li>
        <li>node : {{LibraryVersions.node}}</li>
        <li>V8 : {{LibraryVersions.V8}}</li>
      </template>
    </ul>
    <hr />
    <span>JOED5は以下のオープンソースコンポーネント及びその下位コンポーネントを用いて作成されています.</span>
    <ul>
      <li v-for="(item, index) of List" :key="index">
        {{item.name}} (<ExtLink :url="item.href" />) - License : {{item.license}}
      </li>
    </ul>
  </div>
</template>

<script>
import ExtLink from '@/components/Atoms/ExtLink'

export default {
  name: 'About',
  components: {
    ExtLink
  },
  data () {
    return ({
      List: [
        // { name: '', href: '', license: '' },
        { name: 'Vue.js', href: 'https://vuejs.org/', license: 'MIT' },
        { name: 'Vue cli 3', href: 'https://cli.vuejs.org/', license: 'MIT' },
        { name: 'Vuex', href: 'https://vuex.vuejs.org/', license: 'MIT' },
        { name: 'Vue Router', href: 'https://router.vuejs.org/', license: 'MIT' },
        { name: 'Element', href: 'https://element.eleme.io/', license: 'MIT' },
        { name: 'nedb', href: 'https://github.com/louischatriot/nedb', license: 'MIT' },
        { name: 'Vue.Draggable', href: 'https://github.com/SortableJS/Vue.Draggable', license: 'MIT' },
        { name: 'Datepicker', href: 'https://github.com/charliekassel/vuejs-datepicker', license: 'MIT' },
        { name: 'Vue-infinite-loading', href: 'https://github.com/PeachScript/vue-infinite-loading', license: 'MIT' },
        { name: 'cross-platform-yu-gothic', href: 'https://github.com/rxon/cross-platform-yu-gothic', license: 'MIT' },
        { name: 'js-xxhash', href: 'https://github.com/pierrec/js-xxhash', license: 'MIT' },
        { name: 'Difflib.js', href: 'https://github.com/qiao/difflib.js', license: 'PSF' },
        { name: 'encoding.js', href: 'https://github.com/polygonplanet/encoding.js', license: 'MIT' }
      ]
    })
  },
  created () {
    if (process.env.VUE_APP_MODE === 'electron') {
      this.List.push(...[
        { name: 'electron', href: 'https://www.electronjs.org/', license: 'MIT' },
        { name: 'electron builder', href: 'https://www.electron.build/', license: 'MIT' },
        { name: 'electron store', href: 'https://github.com/sindresorhus/electron-store', license: 'MIT' }
      ])
    }
  },
  computed: {
    ApplicationVersion () {
      return process.env.VUE_APP_VERSION || '5.DEVELOPMENT'
    },
    LibraryVersions () {
      return process.versions || { electron: 'undefined', node: 'undefined', V8: 'undefined', chrome: 'undefined' }
    }
  }
}
</script>
