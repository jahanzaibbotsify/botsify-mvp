import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import ChatLayout from '../layouts/ChatLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import NotFound from '@/views/NotFound.vue';
import Unauthenticated from '@/views/Unauthenticated.vue';

const routes: RouteRecordRaw[] = [
  // Auth Routes (with AuthLayout)
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('../views/auth/SignupView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('../views/auth/ForgotPasswordView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('../views/auth/ResetPasswordView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('../views/auth/VerifyEmailView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'set-password',
        name: 'set-password',
        component: () => import('../views/auth/SetPasswordView.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'agentic-home',
        name: 'agentic-home',
        component: () => import('../views/auth/AgenticHomeView.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },
  // Standalone Routes (without AuthLayout)
  {
    path: '/pricing',
    name: 'pricing',
    component: () => import('../views/auth/PricingView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/select-agent',
    name: 'agent-selection',
    component: () => import('../views/auth/AgentSelectionView.vue'),
    meta: { requiresAuth: false }
  },
  // Main App Routes  
  {
    path: '',
    component: ChatLayout,
    meta: { requiresAuth: true },
    children: [
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
        path: '/conversations',
        name: 'conversations',
        component: () => import('../views/ConversationView.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/UserView.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue')
      }
    ]
  },
  // Legal Pages (standalone)
  {
    path: '/terms-conditions',
    name: 'terms-conditions',
    component: () => import('../views/legal/TermsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../views/legal/PrivacyView.vue'),
    meta: { requiresAuth: false }
  },
  // Redirect root to login
  {
    path: '/',
    redirect: '/auth/login'
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

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards (temporarily disabled for development)
router.beforeEach(async (to, from, next) => {
  // Allow access to all routes for now
  next()
})

export default router