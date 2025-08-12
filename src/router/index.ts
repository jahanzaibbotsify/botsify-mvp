import {RouteRecordRaw, createRouter, createWebHistory} from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Auth Routes (with AuthLayout)
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('../views/auth/SignupView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('../views/auth/ForgotPasswordView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('../views/auth/ResetPasswordView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('../views/auth/VerifyEmailView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'set-password',
        name: 'set-password',
        component: () => import('../views/auth/SetPasswordView.vue'),
        meta: { requiresAuth: false }
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
    path: '/choose-plan',
    name: 'choose-plan',
    component: () => import('../views/auth/PricingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription/success/:planId',
    name: 'subscription-success',
    component: () => import('@/views/auth/SubscriptionSuccessView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/select-agent',
    name: 'agent-selection',
    component: () => import('../views/auth/AgentSelectionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/agent-landing',
    name: 'agent-landing',
    component: () => import('../views/AgentLandingView.vue'),
    meta: { requiresAuth: false }
  },
  // Main App Routes  
  {
    path: '',
    component: () => import('../layouts/ChatLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/agent/:id',
        name: 'agent',
        component: () => import('../views/ChatView.vue'),
        props: true,
        meta: { requiresAuth: true }
      },
      {
        path: '/conversation/:id?',
        name: 'conversation',
        component: () => import('../views/ConversationView.vue'),
        props: true,
        meta: { requiresAuth: true }
      },
      {
        path: '/conversations',
        name: 'conversations',
        component: () => import('../views/ConversationView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/UserView.vue')
      },
      // {
      //   path: '/settings',
      //   name: 'settings',
      //   component: () => import('../views/SettingsView.vue')
      // },
      {
        path: '/data-analysis',
        name: 'data-analysis',
        component: () => import('../views/DataAnalysisView.vue')
      },
      {
        path: '/test-data-analysis',
        name: 'test-data-analysis',
        component: () => import('../views/TestDataAnalysis.vue')
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
    component: () => import('@/views/Unauthenticated.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});


// @ts-ignore Navigation guards
router.beforeEach(async (to, from, next) => {
  try {
    const { checkAuthFlow } = await import('@/utils/authFlow')

    const requiresAuth = to.meta?.requiresAuth;

    if (!requiresAuth) {
      return next()
    }

    const authFlow = checkAuthFlow();
    
    // Prevent infinite redirects by checking if we're already going to the redirect path
    // Also prevent redirecting from subscription-success to choose-plan
    if (
      authFlow.shouldRedirect && 
      authFlow.redirectPath !== to.path &&
      !(to.name === 'subscription-success' && authFlow.redirectPath === '/choose-plan')
    ) {
      return next({ path: authFlow.redirectPath, replace: true })
    }
    
    next()
  } catch (error) {
    console.error('Error in navigation guard:', error)
    next()
  }
})

export default router
export { routes }