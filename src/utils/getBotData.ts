import { axiosInstance } from './axiosInstance';
import { useRoleStore } from '@/stores/roleStore';
import { useWhitelabelStore } from '@/stores/whitelabelStore';
import { useBotStore } from '@/stores/botStore';
import { useChatStore } from '@/stores/chatStore';
import { useConversationStore } from '@/stores/conversationStore';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentApiKey } from './apiKeyUtils';

let isBotDataLoaded = false;

export async function getBotData() {
  const router = useRouter();
  const route = useRoute();

  if (isBotDataLoaded) return;

  const paramKey = route.name === 'agent' ? route.params?.id as string : '';
  const apikey = paramKey || getCurrentApiKey() || '';

  if (!apikey || apikey === 'undefined' || apikey === 'null') {
    console.error('❌ No API key found');
    router.push('/select-agent');
  }

  if(typeof route.name === 'undefined'){
    router.replace({ name: 'agent', params: { id: apikey } });
  }

  try {
    const response = await axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`);
    const data = response.data.data;

    const roleStore = useRoleStore();
    const whitelabelStore = useWhitelabelStore();
    const botStore = useBotStore();
    const chatStore = useChatStore();
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

    // Chat
    // if (!chatStore.chats.length) {
      chatStore.loadFromStorage(data.bot.chat_flow, data.versions);
    // }

    // Firebase
    if (!conversationStore.isFirebaseConnected) {
      try {
        console.log('🔥 Initializing Firebase...');
        conversationStore.initializeFirebase();
        console.log('✅ Firebase initialized successfully');
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
    
    isBotDataLoaded = true;
    return data;

  } catch (error) {
    console.error('❌ Failed to get bot details:', error);
    return router.replace({ name: 'Unauthenticated' });
  }
}

