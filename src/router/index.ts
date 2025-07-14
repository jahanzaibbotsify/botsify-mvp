import { RouteRecordRaw } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'
import { BOTSIFY_APIKEY } from '@/utils/config'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: ChatLayout,
    children: [
      {
        path: '',
        redirect: () => {
          // Check if there are existing chats in localStorage
          try {
            const storedChats = localStorage.getItem('botsify_chats')
            const storedActiveChat = localStorage.getItem('botsify_active_chat')
            
            if (storedChats) {
              const chats = JSON.parse(storedChats)
              
              // If there's an active chat, redirect to it
              if (storedActiveChat && chats.some((chat: any) => chat.id === storedActiveChat)) {
                return `/chat/${storedActiveChat}`
              }
              
              // Otherwise, redirect to the most recent chat
              if (chats.length > 0) {
                const mostRecentChat = chats.sort((a: any, b: any) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )[0]
                return `/chat/${mostRecentChat.id}`
              }
            }
          } catch (error) {
            console.error('Error reading chats from localStorage:', error)
          }
          
          // If no existing chats, create a new one
          console.log(BOTSIFY_APIKEY, "BOTSIFY_APIKEY")
          const chatId = BOTSIFY_APIKEY;
          return `/chat/${chatId}`
        }
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