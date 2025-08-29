import {RouteRecordRaw, createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from "@/stores/authStore.ts";
import { getCurrentApiKey } from '@/utils/apiKeyUtils';
import { whitelabelService } from '@/services/whitelabelService';

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
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/auth/AuthCallbackView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/choose-plan',
    name: 'choose-plan',
    component: () => import('../views/auth/PricingView.vue'),
    meta: { requiresAuth: false }
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
    path: '/test-agent/:apikey?',
    name: 'test-agent',
    component: () => import('../views/TestAgentView.vue'),
    props: true
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
    const authStore = useAuthStore();
    const user = authStore.user as any;
    const requiresAuth = to.meta?.requiresAuth;

    // Check whitelabel registration restriction for signup page
    if (to.name === 'signup') {
      if (!whitelabelService.isRegistrationAllowed()) {
        // Redirect to login if registration is not allowed
        return next({ path: '/auth/login' });
      }
    }

    // Check if user is authenticated
    if (authStore.isAuthenticated && (user.email_verified || user.is_appsumo || user.is_bot_admin || user.subs || user.source === 'botsify_landing')) {
      // Authenticated users trying to access auth pages should be redirected
      if (to.path.startsWith('/auth/') || to.path === '/unauthenticated') {
        // If user has subscription, redirect to agent selection
        if (user.subs) {
          return next({ path: '/' });
        }
        // If user is verified but no subscription, redirect to plan selection
        if (user.email_verified && !user.subs && !user.is_appsumo && !user.is_bot_admin && user.source !== 'botsify_landing') {
          // Avoid redirect loop if already on choose-plan
          if (to.path !== '/choose-plan') {
            return next({ path: '/choose-plan' });
          }
          return next();
        }
        // If user is not verified, redirect to email verification
        if (!user.email_verified && !user.is_appsumo && !user.is_bot_admin && user.source !== 'botsify_landing') {
          // Avoid redirect loop if already on verify-email
          if (!to.path.startsWith('/auth/verify-email')) {
            return next({ path: `/auth/verify-email?email=${encodeURIComponent(user.email || '')}` });
          }
          return next();
        }
        // Allow other auth pages through only if none of the above redirects applied
        return next();
      }

      // For subscribed users, never allow /choose-plan even if the route is public
      if (user.subs && to.path === '/choose-plan') {
        if (from.path === '/select-agent') {
          return next();
        }
        return next({ path: '/' });
      }

      // If route doesn't require auth, allow navigation (after critical redirects above)
      if (!requiresAuth) {
        return next();
      }

      // Check email verification and subscription status
      if (!user.email_verified && !user.subs && !user.is_appsumo && !user.is_bot_admin && user.source !== 'botsify_landing') {
        if (!to.path.startsWith('/auth/verify-email')) {
          return next({ path: `/auth/verify-email?email=${encodeURIComponent(user.email || '')}` });
        }
        return next();
      }

      // Allow access to subscription-related routes even without subscription
      if (to.path.startsWith('/subscription/')) {
        return next();
      }

      // If email is verified but no subscription, redirect to plan selection
      // Only redirect if we're not already going to choose-plan to prevent infinite loops
      if (user.email_verified && !user.subs && !user.is_appsumo && !user.is_bot_admin && user.source !== 'botsify_landing' && !to.path.startsWith('/subscription/')) {
        if (to.path !== '/choose-plan') {
          return next({ path: '/choose-plan' });
        }
        return next();
      }

      
      if(typeof to.name === 'undefined'){
        router.replace({ name: 'agent', params: { id: getCurrentApiKey() } });
      }
      // Prevent infinite redirects by checking if we're already going to the redirect path
      if (from.path === to.path) {
        return next();
      }
     
      // Allow navigation to proceed
      return next();
    } else {
      // Unauthenticated users
      // If route doesn't require auth, allow navigation
      if (!requiresAuth) {
        return next();
      }


      // Redirect unauthenticated users to login
      return next({ path: '/auth/login' });
    }
  } catch (error) {
    console.error('Error in navigation guard:', error);
    return next();
  }
})

export default router
export { routes }