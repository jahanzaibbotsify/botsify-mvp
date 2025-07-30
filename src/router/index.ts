import { RouteRecordRaw } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'
import NotFound from '@/views/NotFound.vue';
import Unauthenticated from '@/views/Unauthenticated.vue';
import { getDefaultRedirect } from '@/utils/apiKeyUtils';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: getDefaultRedirect
  },
  {
    path: '',
    component: ChatLayout,
    children: [
      {
        path: '',
        name: 'default',
        redirect: getDefaultRedirect
      },
      {
        path: '/agent/:id',
        name: 'agent',
        component: () => import('../views/ChatView.vue'),
        props: true
      },
      {
        path: '/conversation/:id?',
        name: 'conversation',
        component: () => import('../views/ConversationView.vue'),
        props: true
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/UserView.vue')
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