import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewLoginAndAuthenticate from '@/views/VLoginAndAuthenticate'

import ViewListOfCaseitems from '@/views/VListOfCaseitems'

import ViewEditItem from '@/views/VEditItem'
import ViewEditItemDiagnosis from '@/views/VEditItemDiagnosis'
import ViewEditItemProcedure from '@/views/VEditItemProcedure'
import ViewEditItemAE from '@/views/VEditItemAE'

import ViewUtilites from '@/views/VUtilities'
import ViewAbout from '@/views/VAbout'
import ViewSettings from '@/views/VSettings'
import ViewExport from '@/views/VExport'

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
  },
  {
    name: 'utilities',
    path: '/utilities',
    component: ViewUtilites,
    children: [
      {
        name: 'about',
        path: 'about',
        component: ViewAbout,
        alias: ''
      },
      {
        name: 'settings',
        path: 'settings',
        component: ViewSettings
      },
      {
        name: 'export',
        path: 'export',
        component: ViewExport
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
