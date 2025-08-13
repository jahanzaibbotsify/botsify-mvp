import {RouteRecordRaw, createRouter, createWebHistory} from 'vue-router'
import {getCurrentApiKey} from "@/utils/apiKeyUtils.ts";
import {axiosInstance} from "@/utils/axiosInstance.ts";
import {useWhitelabelStore} from "@/stores/whitelabelStore.ts";
import {useBotStore} from "@/stores/botStore.ts";
import {useRoleStore} from "@/stores/roleStore.ts";
import {useAuthStore} from "@/stores/authStore.ts";

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


async function getBotDetails() {
  const apikey =  getCurrentApiKey();
  if (!apikey) {
    await router.push('/select-agent')
    return;
  } else {
    // @ts-ignore
    useBotStore().setApiKey(apikey);
  }
  return axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`)
      .then(response => {

        const roleStore = useRoleStore();
        const whitelabelStore = useWhitelabelStore();

        // Set user role and permissions
        if (response.data.data.user) {
          roleStore.setCurrentUser(response.data.data.user);

          // Set whitelabel data if user is a whitelabel client
          if (response.data.data.user.is_whitelabel_client) {
            whitelabelStore.setWhitelabelData(response.data.data.user);
            // Set favicon if present
            if (response.data.data.user.whitelabel && response.data.data.user.whitelabel.favicon) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = response.data.data.user.whitelabel.favicon;
            }
          }
        }
        const botStore = useBotStore();
        botStore.setApiKeyConfirmed(true);
        botStore.setBotId(response.data.data.bot.id);
        botStore.setUser(response.data.data.user);
        botStore.setBotName(response.data.data.bot.name);

        return response.data.data;
      })
      .catch(error => {
        console.error('API request error:', error);
        router.push('/select-agent');
        useBotStore().clearApiKey()
        return false;
      });
}

// @ts-ignore Navigation guards
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore();
    const user = authStore.user as any;
    const requiresAuth = to.meta?.requiresAuth;

    // Check if user is authenticated
    if (authStore.isAuthenticated && authStore.user?.email_verified) {
      // Authenticated users trying to access auth pages should be redirected
      if (to.path.startsWith('/auth/') || to.path === '/unauthenticated') {
        // If user has subscription, redirect to agent selection
        if (user.subs) {
          return next({ path: '/select-agent' });
        }
        // If user is verified but no subscription, redirect to plan selection
        if (user.email_verified && !user.subs) {
          // Avoid redirect loop if already on choose-plan
          if (to.path !== '/choose-plan') {
            return next({ path: '/choose-plan' });
          }
          return next();
        }
        // If user is not verified, redirect to email verification
        if (!user.email_verified) {
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
        return next({ path: '/select-agent' });
      }

      // If route doesn't require auth, allow navigation (after critical redirects above)
      if (!requiresAuth) {
        return next();
      }

      // Check email verification and subscription status
      if (!user.email_verified && !user.subs) {
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
      if (user.email_verified && !user.subs && !to.path.startsWith('/subscription/')) {
        if (to.path !== '/choose-plan') {
          return next({ path: '/choose-plan' });
        }
        return next();
      }

      // Prevent infinite redirects by checking if we're already going to the redirect path
      if (from.path === to.path) {
        return next();
      }

      // Avoid bot details fetch on routes where API key is not required
      // Running this on /choose-plan causes a redirect to /select-agent when no API key is present
      if (to.path !== '/select-agent' && to.path !== '/choose-plan') {
        getBotDetails();
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