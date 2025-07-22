import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigurationTask, ConfigurationResponse, ConfigurationResponseData, ApiRequestData, ChatMessage, OpenAIStreamResponse, ApiError } from '../types/openai'
import { useApiKeyStore } from './apiKeyStore';

export const useDeepSeekStore = defineStore('deepseek', () => {
  // API endpoint for DeepSeek
  const DEEPSEEK_API_URL = 'https://deepseek.saasbakers.com/api/generate';
  const MODEL_NAME = 'deepseek-coder-v2:latest';
  
  // Get bot API key from API key store
  const botApiKey = useApiKeyStore().apiKey;
  console.log('Bot API key available:', !!botApiKey);
  
  // For DeepSeek, we don't need a separate API key as it appears to be an open endpoint
  const apiKey = ref<string | null>('deepseek-default'); // Placeholder since DeepSeek endpoint may not require auth
  
  // Reactive state
  const connected = ref(true); // DeepSeek API is available by default
  const error = ref<string | null>(null);
  const rateLimited = ref(false);

  // Configuration tool function definition (same as OpenAI for compatibility)
  const configureChatbotTool = {
    type: "function" as const,
    name: "configure_chatbot",
    description: "Handles configuration updates for the chatbot, such as language, logo, and color scheme.",
    strict: true,
    parameters: {
      type: "object",
      required: ["tasks"],
      properties: {
        tasks: {
          type: "array",
          description: "Array of tasks to be performed for configuration updates",
          items: {
            type: "object",
            properties: {
              key: {
                type: "string",
                description: "Configuration property to be updated, e.g., language, logo, color scheme"
              },
              value: {
                type: "string",
                description: "New value for the specified configuration property"
              }
            },
            additionalProperties: false,
            required: ["key", "value"]
          }
        }
      },
      additionalProperties: false
    }
  };

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
      "setOfflineHours"
    ],
    require_approval: "never" as const
  }

  function setApiKey(key: string) {
    console.log('Setting API key for DeepSeek (not required for this endpoint)');
    apiKey.value = key;
    localStorage.setItem('deepseek_api_key', key);
    connected.value = true;
    error.value = null;
  }

  // Handle configuration API requests (same logic as OpenAI)
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
          'Authorization': `Bearer ${botApiKey}` // Use bot API key for auth
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
      console.error('Configuration API error:', apiError);
      return {
        success: false,
        message: `Error updating ${task.key}: ${apiError.message || 'Network error'}`
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

  // Custom streaming function for DeepSeek API
  async function streamChat(messages: ChatMessage[]): Promise<AsyncIterable<OpenAIStreamResponse>> {
    console.log('🔍 DEBUG: DeepSeek client state:', {
      connected: connected.value,
      apiUrl: DEEPSEEK_API_URL,
      model: MODEL_NAME
    });

    try {
      console.log('🚀 Preparing to stream chat with DeepSeek API:', messages);
      
      // Extract system message for prompt
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');
      
      // Build the prompt for DeepSeek
      let prompt = '';
      
      // Add system instructions if available
      if (systemMessage) {
        prompt += `System: ${systemMessage.content}\n\n`;
      }
      
      // Add conversation history
      userMessages.forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      
      // Add assistant prompt
      prompt += 'assistant: ';
      
      console.log('📤 Sending request to DeepSeek API with prompt length:', prompt.length);
      
      // Make request to DeepSeek API
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: prompt,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received from DeepSeek API');
      }

      console.log('✅ Stream received from DeepSeek API');
      
      // Create async generator to handle streaming response
      return (async function* () {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('✅ DeepSeek stream completed');
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              
              try {
                // DeepSeek typically returns JSON with "response" field
                const data = JSON.parse(line);
                
                if (data.response) {
                  yield {
                    type: 'response.output_text.delta',
                    delta: data.response
                  } as OpenAIStreamResponse;
                }
                
                // Check if stream is done
                if (data.done === true) {
                  console.log('✅ DeepSeek indicated stream is done');
                  break;
                }
              } catch (parseError) {
                // If line is not JSON, treat as raw text
                if (line.trim()) {
                  yield {
                    type: 'response.output_text.delta',
                    delta: line
                  } as OpenAIStreamResponse;
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      })();
      
    } catch (e: unknown) {
      const streamChatError = e as ApiError;
      console.error('❌ Error in DeepSeek streamChat:', streamChatError);
      
      if (streamChatError.message?.includes('429')) {
        rateLimited.value = true;
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      error.value = streamChatError.message || 'Unknown error occurred';
      throw streamChatError;
    }
  }

  return {
    apiKey,
    connected,
    error,
    rateLimited,
    setApiKey,
    streamChat,
    processConfigurationTool,
    configureChatbotTool
  };
}); 