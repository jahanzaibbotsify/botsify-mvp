import { RouteRecordRaw } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'
import NotFound from '@/views/NotFound.vue';
import Unauthenticated from '@/views/Unauthenticated.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    component: ChatLayout,
    children: [
      {
        path: '/agent/:id?',
        name: 'agent',
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
  },
  {
    path: '/unauthenticated',
    name: 'Unauthenticated',
    component: Unauthenticated
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  }
]

export default routes