<template>
  <div class="utility">
    <h2>JOE-D 5について</h2>

    <hr/>
    <span style="font-weight: bold;">ライセンス - MIT</span>
    <p><small>Copyright &copy; 2020-2021 Yasuhiro Yamamoto @piyotaicho and 一般社団法人日本産科婦人科内視鏡学会</small></p>
    <p>以下に定める条件に従い、本ソフトウェアおよび関連文書のファイル（以下「ソフトウェア」）の複製を取得するすべての人に対し、ソフトウェアを無制限に扱うことを無償で許可します。これには、ソフトウェアの複製を使用、複写、変更、結合、掲載、頒布、サブライセンス、および/または販売する権利、およびソフトウェアを提供する相手に同じことを許可する権利も無制限に含まれます。</p>
    <p>上記の著作権表示および本許諾表示を、ソフトウェアのすべての複製または重要な部分に記載するものとします。</p>
    <p>ソフトウェアは「現状のまま」で、明示であるか暗黙であるかを問わず、何らの保証もなく提供されます。ここでいう保証とは、商品性、特定の目的への適合性、および権利非侵害についての保証も含みますが、それに限定されるものではありません。 作者または著作権者は、契約行為、不法行為、またはそれ以外であろうと、ソフトウェアに起因または関連し、あるいはソフトウェアの使用またはその他の扱いによって生じる一切の請求、損害、その他の義務について何らの責任も負わないものとします。</p>

    <hr />
    <span style="font-weight: bold;">アプリケーションおよび主要コンポーネントのバージョン</span>
    <ul>
      <li><ExtLink url="https://github.com/piyotaicho/JOED/">JOED5</ExtLink> : {{ApplicationVersion}}</li>
      <template v-if="LibraryVersions.electron">
        <li>Electron : {{LibraryVersions.electron}}</li>
        <li>Chrome : {{LibraryVersions.chrome}}</li>
        <li>node : {{LibraryVersions.node}}</li>
        <li>V8 : {{LibraryVersions.v8}}</li>
      </template>
      <li>Vue : {{LibraryVersions.Vue}}</li>
    </ul>

    <hr/>
    <span style="font-weight: bold;">JOED5は以下のコンポーネントを核に構成されています.</span>
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
        ...(process.env.VUE_APP_ELECTRON
          ? [
              { name: 'electron', href: 'https://www.electronjs.org/', license: 'MIT' }
            ]
          : []),
        { name: 'Vuex', href: 'https://vuex.vuejs.org/', license: 'MIT' },
        { name: 'Vue Router', href: 'https://router.vuejs.org/', license: 'MIT' },
        { name: 'Element', href: 'https://element.eleme.io/', license: 'MIT' },
        { name: 'nedb', href: 'https://github.com/louischatriot/nedb', license: 'MIT' },
        { name: 'Vue.Draggable', href: 'https://github.com/SortableJS/Vue.Draggable', license: 'MIT' },
        { name: 'Datepicker', href: 'https://github.com/charliekassel/vuejs-datepicker', license: 'MIT' },
        { name: 'Vue-infinite-loading', href: 'https://github.com/PeachScript/vue-infinite-loading', license: 'MIT' },
        { name: 'xxhashjs', href: 'https://github.com/pierrec/js-xxhash', license: 'MIT' },
        { name: 'Difflib.js', href: 'https://github.com/qiao/difflib.js', license: 'PSF' },
        { name: 'encoding.js', href: 'https://github.com/polygonplanet/encoding.js', license: 'MIT' },
        ...(process.env.VUE_APP_ELECTRON
          ? [
              { name: 'electron store', href: 'https://github.com/sindresorhus/electron-store', license: 'MIT' }
            ]
          : [])
      ]
    })
  },
  computed: {
    ApplicationVersion () {
      return this.$store.getters['system/ApplicationVersion']
    },
    LibraryVersions () {
      return {
        Vue: this.$store.getters['system/VueVersion'],
        ...(process.env.VUE_APP_ELECTRON
          ? {
              electron: process.versions.electron,
              node: process.versions.node,
              v8: process.versions.v8,
              chrome: process.versions.chrome
            }
          : {})
      }
    }
  }
}
</script>
