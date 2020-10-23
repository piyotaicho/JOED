import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewLogin from '@/views/VLogin'

import ViewList from '@/views/VList'

import ViewEditCase from '@/views/VEditCase'
import ViewEditItemDiagnosis from '@/views/VEditItemDiagnosis'
import ViewEditItemProcedure from '@/views/VEditItemProcedure'
import ViewEditItemAE from '@/views/VEditItemAE'

import ViewUtilites from '@/views/VUtilities'
// import ViewAbout from '@/views/VAbout'
import ViewSettings from '@/views/VSettings'
import ViewExport from '@/views/VExport'
import ViewImport from '@/views/VImport'
import Store from '@/store/index'

Vue.use(VueRouter)

const routes = [
  {
    name: 'login',
    path: '/',
    component: ViewLogin
  },
  {
    name: 'list',
    path: '/list',
    component: ViewList,
    meta: { requireLogin: true }
  },
  {
    name: 'edit',
    path: '/edit/:uid',
    component: ViewEditCase,
    props: true,
    meta: { requireLogin: true },
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
    meta: { requireLogin: true },
    children: [
      {
        name: 'export',
        path: 'export',
        component: ViewExport
      },
      {
        name: 'import',
        path: 'import',
        component: ViewImport
      }
    ]
  },
  {
    name: 'settings',
    path: '/settings',
    component: ViewSettings,
    meta: { requireLogin: true }
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/') {
    if (Store.getters['password/isAuthenticated']) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
