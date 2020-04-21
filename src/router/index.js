import Vue from 'vue'
import VueRouter from 'vue-router'
import ViewLoginAndAuthenticate from '@/views/VLoginAndAuthenticate'
import ViewListOfCaseitems from '@/views/VListOfCaseitems'
import ViewEditItem from '@/views/VEditItem'
import ViewEditItemDiagnosis from '@/views/VEditItemDiagnosis'
import ViewEditItemProcedure from '@/views/VEditItemProcedure'
import ViewEditItemAE from '@/views/VEditItemAE'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: ViewLoginAndAuthenticate
  },
  {
    name: 'list',
    path: '/list',
    component: ViewListOfCaseitems
  },
  {
    name: 'edit',
    path: '/edit/:uid',
    component: ViewEditItem,
    props: true,
    children: [
      {
        name: 'diagnosis',
        path: 'diagnosis',
        component: ViewEditItemDiagnosis,
        props: true
      },
      {
        name: 'procedure',
        path: 'procedure',
        component: ViewEditItemProcedure,
        props: true
      },
      {
        name: 'AE',
        path: 'AE',
        component: ViewEditItemAE,
        props: true
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
