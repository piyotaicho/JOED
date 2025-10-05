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
        props: route => ({
          ItemIndex: parseInt(route.query.ItemIndex),
          ItemValue: route.query.ItemValue,
          year: route.query.year
        })
      },
      {
        name: 'procedure',
        path: 'procedure',
        component: () => import('@/views/VEditProcedure.vue'),
        props: route => ({
          ItemIndex: parseInt(route.query.ItemIndex),
          ItemValue: route.query.ItemValue,
          year: route.query.year
        })
      },
      {
        name: 'AE',
        path: 'AE',
        component: () => import('@/views/VEditAE.vue'),
        props: route => ({
          ItemIndex: parseInt(route.query.ItemIndex),
          ItemValue: route.query.ItemValue,
          year: route.query.year
        })
      }
    ]
  },
  {
    name: 'utilities',
    path: '/utilities',
    component: () => import('@/views/VUtilities.vue'),
    meta: { requireLogin: true },
    children: [
      {
        name: 'export',
        path: 'export',
        component: () => import('@/views/VUtilities.vue'),
      },
      {
        name: 'import',
        path: 'import',
        component: () => import('@/views/VUtilities.vue'),
      }
    ]
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('@/views/VSettings.vue'),
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
