import { RouteRecordRaw } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'
import NotFound from '@/views/NotFound.vue';
import Unauthenticated from '@/views/Unauthenticated.vue';
import { useRoleStore } from '@/stores/roleStore';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    component: ChatLayout,
    children: [
      {
        path: '',
        name: 'default',
        redirect: (to) => {
          console.log(to);
          // Default route based on user role
          const roleStore = useRoleStore();
          if (roleStore.isLiveChatAgent) {
            return { name: 'conversation' };
          } else {
            return { name: 'agent', params: { id: 'default' } };
          }
        }
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