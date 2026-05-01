import appService from '@/service/app.service'
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

router.beforeEach((to, _) => {
  if (to.name !== 'login' && !appService.logined()) {
    return '/login'
  } else if (to.name === 'login' && appService.logined()) {
    return '/home'
  } else {
    return
  }
})

export default router
