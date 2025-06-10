import { RouteRecordRaw } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: ChatLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue')
      },
      {
        path: '/chat/:id',
        name: 'chat',
        component: () => import('../views/ChatView.vue'),
        props: true
      },
      {
        path: '/pricing',
        name: 'pricing',
        component: () => import('../views/PricingView.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue')
      }
    ]
  }
]

export default routes