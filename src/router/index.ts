import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'index',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/home/IndexView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/IndexView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const publicPages = new Set(['home', 'login'])

router.beforeEach((to) => {
  if (publicPages.has(String(to.name))) {
    return true
  }

  return true
})

export default router
