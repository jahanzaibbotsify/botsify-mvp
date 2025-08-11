import {RouteRecordRaw, createRouter, createWebHistory, useRoute} from 'vue-router'
import {getCurrentApiKey} from "@/utils/apiKeyUtils.ts";
import {useBotStore} from "@/stores/botStore.ts";
import {axiosInstance} from "@/utils/axiosInstance.ts";
import {useRoleStore} from "@/stores/roleStore.ts";
import {useWhitelabelStore} from "@/stores/whitelabelStore.ts";
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

async function getBotDetails() {
  const route = useRoute();
  const apikey =  route?.params?.id || getCurrentApiKey();
  if (!apikey) {
    router.push('/select-agent')
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

    await getBotDetails();
    
    next()
  } catch (error) {
    console.error('Error in navigation guard:', error)
    next()
  }
})

export default router
export { routes }