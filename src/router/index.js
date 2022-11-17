import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '@/store/index'

import ViewLogin from '@/views/VLogin'

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
    component: () => import('@/views/VList'),
    meta: { requireLogin: true }
  },
  {
    name: 'edit',
    path: '/edit/:uid',
    component: () => import('@/views/VEdit'),
    props: true,
    meta: { requireLogin: true },
    children: [
      {
        name: 'diagnosis',
        path: 'diagnosis',
        component: () => import('@/views/VEditDiagnosis'),
        props: true
      },
      {
        name: 'procedure',
        path: 'procedure',
        component: () => import('@/views/VEditProcedure'),
        props: true
      },
      {
        name: 'AE',
        path: 'AE',
        component: () => import('@/views/VEditAE'),
        props: true
      }
    ]
  },
  {
    name: 'utilities',
    path: '/utilities',
    component: () => import('@/views/VUtilities'), // ViewUtilites,
    meta: { requireLogin: true },
    children: [
      {
        name: 'export',
        path: 'export'
      },
      {
        name: 'import',
        path: 'import'
      }
    ]
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('@/views/VSettings'), // VSettings,
    meta: { requireLogin: true }
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/' || Store.getters['password/isAuthenticated']) {
    if (window?.IPC) {
      window.API.SwitchMenu(to.name)
    }
    next()
  } else {
    if (window?.IPC) {
      window.API.SwitchMenu('login')
    }
    next('/')
  }
})

export default router
