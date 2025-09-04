import { createRouter, createWebHashHistory } from 'vue-router'
import Store from '@/store/index'

import ViewLogin from '@/views/VLogin.vue'

const routes = [
  {
    name: 'login',
    path: '/',
    component: ViewLogin
  },
  {
    name: 'list',
    path: '/list',
    component: () => import('@/views/VList.vue'), // VList,
    meta: { requireLogin: true }
  },
  {
    name: 'edit',
    path: '/edit/:uid',
    component: () => import('@/views/VEdit.vue'), // VEdit,
    props: true,
    meta: { requireLogin: true },
    children: [
      {
        name: 'diagnosis',
        path: 'diagnosis',
        component: () => import('@/views/VEditDiagnosis.vue'),
        props: true
      },
      {
        name: 'procedure',
        path: 'procedure',
        component: () => import('@/views/VEditProcedure.vue'),
        props: true
      },
      {
        name: 'AE',
        path: 'AE',
        component: () => import('@/views/VEditAE.vue'),
        props: true
      }
    ]
  },
  {
    name: 'utilities',
    path: '/utilities',
    component: () => import('@/views/VUtilities.vue'), // ViewUtilites,
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
    component: () => import('@/views/VSettings.vue'), // VSettings,
    meta: { requireLogin: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/' || Store.getters['password/isAuthenticated']) {
    if (window?.API) {
      window.API.SwitchMenu(to.name)
    }
    next()
  } else {
    if (window?.API) {
      window.API.SwitchMenu('login')
    }
    next('/')
  }
})

export default router
