import { axiosInstance } from './axiosInstance';
import { useRoleStore } from '@/stores/roleStore';
import { useWhitelabelStore } from '@/stores/whitelabelStore';
import { useBotStore } from '@/stores/botStore';
import { useChatStore } from '@/stores/chatStore';
import { useConversationStore } from '@/stores/conversationStore';
import { usePublishStore } from '@/stores/publishStore';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentApiKey } from './apiKeyUtils';

// let isBotDataLoaded = false;

export async function getBotData() {
  const router = useRouter();
  const route = useRoute();
  const botStore = useBotStore();

  // Check if bot data is already loaded in the store
  // if (isBotDataLoaded || botStore.apiKeyConfirmed) {
  //   return;
  // }

  const paramKey = route.name === 'agent' ? route.params?.id as string : '';
  const apikey = paramKey || getCurrentApiKey() || '';

  if (!apikey || apikey === 'undefined' || apikey === 'null') {
    console.error('❌ No API key found');
    router.push('/select-agent');
    return;
  }

  // Set API key in store since this is called from router guard
  botStore.setApiKey(apikey);

  // Clean up chat store state before loading new agent data
  const chatStore = useChatStore();
  chatStore.clearAllData();

  // Reset publish store state for new agent
  const publishStore = usePublishStore();
  publishStore.resetStore();

  // Clear old data first to prevent showing old agent data briefly
  const roleStore = useRoleStore();
  const whitelabelStore = useWhitelabelStore();
  roleStore.clearUser();
  whitelabelStore.clearWhitelabelData();
  botStore.clearAllData();

  try {
    const response = await axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`);
    const data = response.data.data;

    const botStore = useBotStore();
    const conversationStore = useConversationStore();
    
    // User + Role
    if (data.user) {
      roleStore.setCurrentUser(data.user);

      // Whitelabel
      if (data.user.is_whitelabel_client) {
        whitelabelStore.setWhitelabelData(data.user);
        if (data.user.whitelabel?.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.user.whitelabel.favicon;
        }
      }
    }

    // Bot
    botStore.setApiKeyConfirmed(true);
    botStore.setBotId(data.bot.id);
    botStore.setUser(data.user);
    botStore.setBotName(data.bot.name);
    
         // Set global flag to prevent duplicate calls
    //  isBotDataLoaded = true;

     // Chat
     // if (!chatStore.chats.length) {
       chatStore.loadFromStorage(data.bot.chat_flow, data.versions);
     // }

     // Sync the active version with the loaded data to ensure consistency
     if (data.versions && data.versions.length > 0) {
       chatStore.syncActiveVersionWithData(data.versions);
     }

     // Firebase
     if (!conversationStore.isFirebaseConnected) {
       try {
         conversationStore.initializeFirebase();
       } catch (error) {
         console.error('❌ Error initializing Firebase:', error);
       }
     }

     // Route restrictions
     if (route.name === 'conversation' && !roleStore.hasSubscription) {
       router.replace({ name: 'agent', params: { id: apikey } });
     }

     if (roleStore.isLiveChatAgent && route.name !== 'conversation') {
       router.replace({ name: 'conversation' });
     }
     
     return data;

  } catch (error) {
    console.error('❌ Failed to get bot details:', error);
    return router.replace({ name: 'Unauthenticated' });
  }
}

/**
 * Initialize stores for views that don't have agent route context
 * This function is used by UserView and ConversationView to ensure stores are properly initialized
 */
export async function initializeStores() {
  const botStore = useBotStore();
  const roleStore = useRoleStore();
  const whitelabelStore = useWhitelabelStore();
  
  console.log('🔧 initializeStores called');
  console.log('🔧 Current botStore.apiKeyConfirmed:', botStore.apiKeyConfirmed);
  console.log('🔧 Current roleStore.currentUser:', !!roleStore.currentUser);
  
  // Check if stores are already initialized
  if (botStore.apiKeyConfirmed && roleStore.currentUser) {
    console.log('🔧 Stores already initialized, returning');
    return; // Already initialized
  }

  // Clear old data first to prevent showing old agent data briefly
  console.log('🔧 Clearing old data...');
  roleStore.clearUser();
  botStore.clearAllData();
  whitelabelStore.clearWhitelabelData();
  
  // Try to get API key from bot store first, then localStorage
  let apikey = botStore.apiKey || getCurrentApiKey();
  
  console.log('🔧 API key found:', apikey ? 'Yes' : 'No');
  
  if (!apikey || apikey === 'undefined' || apikey === 'null') {
    console.error('❌ No API key found in store or localStorage');
    return;
  }

  try {
    console.log('🔧 Making API call to get bot data...');
    const response = await axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`);
    const data = response.data.data;

    console.log('🔧 API response received:', data ? 'Yes' : 'No');
    console.log('🔧 User data:', data?.user ? 'Yes' : 'No');

    const whitelabelStore = useWhitelabelStore();
    
    // User + Role
    if (data.user) {
      console.log('🔧 Setting current user in role store...');
      roleStore.setCurrentUser(data.user);

      // Whitelabel
      if (data.user.is_whitelabel_client) {
        console.log('🔧 Setting whitelabel data...');
        whitelabelStore.setWhitelabelData(data.user);
        if (data.user.whitelabel?.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.user.whitelabel.favicon;
        }
      }
    }

    // Bot
    console.log('🔧 Setting bot data...');
    botStore.setApiKey(apikey);
    botStore.setApiKeyConfirmed(true);
    botStore.setBotId(data.bot.id);
    botStore.setUser(data.user);
    botStore.setBotName(data.bot.name);
    
    console.log('🔧 Stores initialized successfully');
    return data;

  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    return null;
  }
}

