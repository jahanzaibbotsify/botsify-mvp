import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ConfigurationTask, ConfigurationResponse, ConfigurationResponseData, ApiRequestData, ChatMessage, ApiError } from '../types/openai'
import { useBotStore } from './botStore';
import { BOTSIFY_BASE_URL, getInitialToken } from '@/utils/config';
import { handleApiError } from '@/utils/errorHandler';
import {useAuthStore} from "@/stores/authStore.ts";


export const useOpenAIStore = defineStore('openai', () => {
  // Try to get API key from environment variables first, then fallback to localStorage
  // Reactive state - no OpenAI client here to avoid private member issues
  const error = ref<string | null>(null);
  const rateLimited = ref(false);

  // Get current API key reactively
  const getCurrentApiKey = () => {
    return useBotStore().apiKey;
  };

  // Make mcpConfiguration reactive to API key changes
  const mcpConfiguration = computed(() => ({
    type: "mcp" as const,
    server_label: "botsify_mcp_server",
    server_url: "https://mcp.botsify.com/mcp",
    server_description: `The server is designed to work seamlessly with Botsify's infrastructure, supporting easy integration, rapid deployment, and centralized configuration management for all Botsify-powered chatbots and virtual agents.`,
    headers: {
      Authorization: `Bearer ${useAuthStore().accessToken}`,
      'X-BOT-API-KEY': getCurrentApiKey()
    },
    allowed_tools: [
      "updateBotSettings",
      "updateBotGeneralSettings",
      "getBotsifyChatBotApiKey",
      "getTeamMembers",
      "toggleBotAccessForTeamMember",
      "resendInvitationToTeamMember",
      "toggleBotNotificationForTeamMember",
      "getTeamMember",
      "createTeamMember",
      "updateTeamMember",
      "deleteTeamMember",
      "getOfflineHours",
      "setOfflineHours",
      "getChatBotMenu",
      "setChatBotMenu",
      "createPageMessage",
      "updatePageMessage",
      "deletePageMessage",
      "getAllPageMessages"
    ],
    require_approval: "never" as const
  }));


  // Handle configuration API requests
  async function handleConfigurationRequest(task: ConfigurationTask): Promise<ConfigurationResponse> {
    console.log('Processing configuration task:', task);
    
    try {
      let apiEndpoint = '';
      let requestData: ApiRequestData;
      
      // Switch cases for different configuration types
      switch (task.key) {
        case 'change_language':
        case 'language':
          apiEndpoint = 'https://api.botsify.com/chatbot/language';
          requestData = {
            language: task.value,
            action: 'update_language'
          };
          break;
          
        case 'change_logo':
        case 'logo':
          apiEndpoint = 'https://api.botsify.com/chatbot/logo';
          requestData = {
            logo_url: task.value,
            action: 'update_logo'
          };
          break;
          
        case 'change_color':
        case 'color_scheme':
        case 'theme':
          apiEndpoint = 'https://api.botsify.com/chatbot/theme';
          requestData = {
            color_scheme: task.value,
            action: 'update_theme'
          };
          break;
          
        case 'toggle_chatbot':
        case 'chatbot_status':
          apiEndpoint = 'https://api.botsify.com/chatbot/status';
          requestData = {
            status: task.value,
            action: 'toggle_status'
          };
          break;
          
        case 'update_welcome_message':
        case 'welcome_message':
          apiEndpoint = 'https://api.botsify.com/chatbot/welcome';
          requestData = {
            message: task.value,
            action: 'update_welcome'
          };
          break;
          
        case 'change_name':
        case 'chatbot_name':
          apiEndpoint = 'https://api.botsify.com/chatbot/name';
          requestData = {
            name: task.value,
            action: 'update_name'
          };
          break;
          
        default:
          return {
            success: false,
            message: `Unknown configuration key: ${task.key}`
          };
      }
      
      // Make API request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getInitialToken()}` 
        },
        body: JSON.stringify(requestData)
      });
      
      const responseData: ConfigurationResponseData = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: `Successfully updated ${task.key} to "${task.value}"`,
          data: responseData
        };
      } else {
        return {
          success: false,
          message: `Failed to update ${task.key}: ${(responseData as { message?: string }).message || 'Unknown error'}`
        };
      }
      
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = handleApiError(apiError, 'Configuration API');
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Process configuration tool call
  async function processConfigurationTool(tasks: ConfigurationTask[]): Promise<string> {
    const results: ConfigurationResponse[] = [];
    
    // Process all tasks
    for (const task of tasks) {
      const result = await handleConfigurationRequest(task);
      results.push(result);
    }
    
    // Generate response message
    const successfulTasks = results.filter(r => r.success);
    const failedTasks = results.filter(r => !r.success);
    
    let responseMessage = '';
    
    if (successfulTasks.length > 0) {
      responseMessage += `✅ Successfully completed ${successfulTasks.length} configuration update(s):\n`;
      successfulTasks.forEach(task => {
        responseMessage += `• ${task.message}\n`;
      });
    }
    
    if (failedTasks.length > 0) {
      responseMessage += `\n❌ Failed to complete ${failedTasks.length} configuration update(s):\n`;
      failedTasks.forEach(task => {
        responseMessage += `• ${task.message}\n`;
      });
    }
    
    return responseMessage.trim();
  }

  async function streamChat(messages: ChatMessage[]): Promise<Response>  {

    try {
      // Convert messages to Responses API format - send only the last message
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      const latestMessage = nonSystemMessages[nonSystemMessages.length - 1];
      let inputText = `${latestMessage.role}: ${latestMessage.content}`;
      try {

        const payload = {
            input: inputText,
            tools: [mcpConfiguration.value]
          };

        const stream = await fetch(`${BOTSIFY_BASE_URL}/v1/get-ai-response`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getInitialToken()}`
          },
          body: JSON.stringify({
            apikey : getCurrentApiKey(),
            payload: payload
          })
        });
        if (!stream.ok) throw new Error('No response for streaming');
        return stream;

      } catch (apiError: unknown) {
        const streamError = apiError as ApiError;
        throw new Error(handleApiError(streamError, 'get-ai-response API'));
      }
    } catch (e: unknown) {
      const streamChatError = e as ApiError;
      
      if (streamChatError.status === 429) {
        rateLimited.value = true;
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Use standardized error handling
      const errorMessage = handleApiError(streamChatError, 'streamChat');
      error.value = errorMessage;
      throw new Error(errorMessage);
    }
  }


  return {
    error,
    rateLimited,
    streamChat,
    processConfigurationTool
  };
});