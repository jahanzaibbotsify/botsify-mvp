import { axiosInstance } from './axiosInstance';
import { useRoleStore } from '@/stores/roleStore';
import { useWhitelabel } from '@/composables/useWhitelabel';
import { useBotStore } from '@/stores/botStore';
import { useChatStore } from '@/stores/chatStore';
import { useConversationStore } from '@/stores/conversationStore';
import { usePublishStore } from '@/stores/publishStore';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentApiKey } from './apiKeyUtils';
import { useMCPStore } from '@/stores/mcpStore';
import { useUserStore } from '@/stores/userStore';

// let isBotDataLoaded = false;

export async function getBotData() {
  const router = useRouter();
  const route = useRoute();
  const botStore = useBotStore();

  if(!botStore.isLoading){
    return
  }

  // Check if bot data is already loaded in the store
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
  chatStore.cleanupForAgentSwitch();
  // Reset publish store state for new agent
  const publishStore = usePublishStore();
  publishStore.resetStore();
  useUserStore().clearAllCache();
  
  try {
    const response = await axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`);
    const data = response.data.data;

    const roleStore = useRoleStore();
    const { initialize } = useWhitelabel();
    const botStore = useBotStore();
    const conversationStore = useConversationStore();
    
    // User + Role
    if (data.user) {
      roleStore.setCurrentUser(data.user);

      // Whitelabel - initialize if user has whitelabel data
      if (data.user.is_whitelabel || data.user.is_whitelabel_client) {
        // Initialize whitelabel configuration
        await initialize();
        
        // Handle favicon if available
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
    botStore.setBotId(data.bot.id);
    botStore.setUser(data.user);
    botStore.setBotName(data.bot.name);
    
    useMCPStore().connectedMCPs = data.mcp_count;
    
    
         // Set global flag to prevent duplicate calls
    //  isBotDataLoaded = true;

     // Chat
     // if (!chatStore.chats.length) {
       chatStore.loadFromStorage(data.bot.chat_flow, data.bot.bot_flow, data.versions);
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
     if (roleStore.isLiveChatAgent && route.name !== 'conversation') {
        router.replace({ name: 'conversation' });
      }
      
     if (route.name === 'conversation' && !roleStore.hasSubscription) {
       router.replace({ name: 'agent', params: { id: apikey } });
     }

     
     return data;

  } catch (error) {
    console.error('❌ Failed to get bot details:', error);
    return router.replace({ name: 'Unauthenticated' });
  } finally {
    botStore.setIsLoading(false);
  }
}