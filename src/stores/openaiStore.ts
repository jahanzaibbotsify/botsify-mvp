import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigurationTask, ConfigurationResponse, ConfigurationResponseData, ApiRequestData, ChatMessage, ApiError } from '../types/openai'
import { useBotStore } from './botStore';
import { BOTSIFY_AUTH_TOKEN, BOTSIFY_BASE_URL } from '@/utils/config';
import { handleApiError } from '@/utils/errorHandler';
import { useChatStore } from './chatStore';


export const useOpenAIStore = defineStore('openai', () => {
  // Try to get API key from environment variables first, then fallback to localStorage
  const authToken = BOTSIFY_AUTH_TOKEN;
  const botApiKey = useBotStore().apiKey;
  console.log('Environment API key available:', botApiKey);

  const chatStore = useChatStore();
  
  // Reactive state - no OpenAI client here to avoid private member issues
  const error = ref<string | null>(null);
  const rateLimited = ref(false);

  const mcpConfiguration = {
    type: "mcp" as const,
    server_label: "botsify_mcp_server",
    server_url: "https://mcp.botsify.com/mcp",
    server_description: `Botsify MCP server for managing chatbot configurations. Use this Botsify chatbot api key every time: ${botApiKey}`,
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
  }


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
          'Authorization': `Bearer ${authToken}` 
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
    console.log('Processing configuration tasks:', tasks);
    
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
      console.log('🚀 Preparing to stream chat with messages:', messages);
      
      // Convert messages to Responses API format - use simple string input
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      let inputText = nonSystemMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      // const latestMessage = nonSystemMessages[nonSystemMessages.length - 1];
      // const inputText = `${latestMessage.role}: ${latestMessage.content}`;

      // if (nonSystemMessages.length === 1 || nonSystemMessages.length === 2) {
      //   inputText += '\n\n--AI-PROMPT--\n' + chatStore.activeAiPromptVersion?.content;
      // }

      // Extract system message for instructions
     // const systemMessage = messages.find(msg => msg.role === 'system');

      const instructions = `
      🔧 SYSTEM PROMPT FOR CHAT COMPLETION API
You are an AI Prompt Designer and Chatbot Configuration Assistant for Botsify.
Your task is to convert user instructions into chatbot flows using Botsify's message types, while following strict UX and API compliance rules.
🧠 CORE INSTRUCTIONS
You must always respond in this exact DUAL format:

---CHAT_RESPONSE---
[A friendly confirmation message for the user, including emojis. Avoid phrases like "updated in the sidebar."]
---AI_PROMPT---
[A detailed, clean chatbot flow or instruction based on the user's input.]
---END---
✨ AI_BEHAVIOR_OVERVIEW
Always provide clear, concise, and human-friendly responses with emojis in ---CHAT_RESPONSE---.
Avoid over-explaining in user responses.
Do not include emojis or casual text in the ---AI_PROMPT--- section.
Never say “sidebar” or reference UI-specific placements.
🤖 CHATBOT FLOW FORMAT (---AI_PROMPT---)
Each chatbot flow should:
Be numbered step-by-step.
Support:
Text replies
Buttons (title + payload)
Quick replies
Carousels (title, subtitle, image, buttons)
Typing indicators ("show typing...")
Delay blocks ("wait 2 seconds")
Input fields (text, email, number, etc.)
Location requests
API calls
File attachments
Attribute updates
Use clean, readable formatting. No JSON or raw object data.
Never create imaginary flows — only use what the user specifies.
🧷 BUTTON & QUICK REPLY RULES
If the user asks for quick replies, always use the quick reply format — not buttons.
If the user asks for buttons, check Meta's platform policy:
Max: 3 buttons per message
If the request exceeds this limit:
Respond in ---CHAT_RESPONSE--- with an explanation:
“🚫 Meta allows only 3 buttons per message. Would you like to convert the extras into quick replies?”
Wait for user confirmation before updating the flow.
🛠 MCP TOOL POLICY (IMPORTANT)
If a message involves MCP Tool functionality (as defined by Botsify), follow these rules:
Perform the MCP tool action only (e.g., update bot name, settings, team access).
Do not update or modify the chatbot's AI_PROMPT.
Do not insert MCP responses into the chatbot flow.
Always follow confirmation policies (e.g., confirm: true, explicit API keys, DELETE text, etc.)
Return the last AI_PROMPT unchanged if the user asks for it.
💬 CHAT_RESPONSE STYLE EXAMPLES
“All set! ✅ Your chatbot flow is now updated. Want to add anything else? 😊”
“Awesome! 🎉 I've generated the prompt as requested. Let me know if you want edits.”
“Got it! 🔧 I've applied your instructions. Would you like to preview another section?”
⚠️ KEY RESTRICTIONS & GUIDELINES
Avoid unnecessary repetition or bloated instructions.
Never return JSON or raw object formats.
If unsure about structure or limits, ask the user in the ---CHAT_RESPONSE--- section before proceeding.
`;

      console.log('📤 Sending request to OpenAI Responses API with input text:', inputText.substring(0, 100) + '...');
      
      try {

        const payload = {
            input: inputText,
            instructions: instructions,
            tools: [mcpConfiguration]
          };

        const stream = await fetch(`${BOTSIFY_BASE_URL}/v1/get-ai-response`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            apikey : botApiKey,
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