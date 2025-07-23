import { defineStore } from 'pinia';
import { ref } from 'vue';
import OpenAI from 'openai';
import { ConfigurationTask, ConfigurationResponse, ConfigurationResponseData, ApiRequestData, ChatMessage, ApiError } from '../types/openai'
import { useApiKeyStore } from './apiKeyStore';

let openaiClient: OpenAI | null = null;

export const useOpenAIStore = defineStore('openai', () => {
  // Try to get API key from environment variables first, then fallback to localStorage
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const botApiKey = useApiKeyStore().apiKey;
  console.log('Environment API key available:', !!envApiKey, botApiKey);
  
  const apiKey = ref<string | null>(
    envApiKey || localStorage.getItem('openai_api_key')
  );
  
  // Reactive state - no OpenAI client here to avoid private member issues
  const connected = ref(false);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);

  // Configuration tool function definition for Responses API
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

  function setApiKey(key: string) {
    console.log('Setting API key');
    apiKey.value = key;
    localStorage.setItem('openai_api_key', key);
    initClient();
  }

  function initClient() {
    if (!apiKey.value) {
      console.warn('No API key provided, client not initialized');
      connected.value = false;
      openaiClient = null;
      error.value = 'No API key provided. Please add your OpenAI API key in Settings.';
      return;
    }

    try {
      console.log('Initializing OpenAI client');
      console.warn('⚠️ SECURITY WARNING: Using dangerouslyAllowBrowser: true exposes your API key in the browser. Consider implementing a backend proxy for production use.');
      
      // Initialize non-reactive OpenAI client
      openaiClient = new OpenAI({
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true
      });
      
      connected.value = true;
      error.value = null;
      console.log('OpenAI client initialized successfully');
      console.log('Client type:', typeof openaiClient);
      console.log('Client has responses:', !!openaiClient?.responses);
    } catch (e: unknown) {
      const clientError = e as ApiError;
      console.error('Failed to initialize OpenAI client:', clientError);
      error.value = `Failed to initialize OpenAI client: ${clientError.message || 'Unknown error'}`;
      connected.value = false;
      openaiClient = null;
    }
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
          'Authorization': `Bearer ${apiKey.value}` // Assuming API key is used for auth
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

  async function streamChat(messages: ChatMessage[]): Promise<Response>  {
    // Debug: Check client state
    console.log('🔍 DEBUG: OpenAI client state:', {
      clientExists: !!openaiClient,
      clientType: typeof openaiClient,
      hasResponses: !!openaiClient?.responses,
      connected: connected.value,
      apiKeyExists: !!apiKey.value
    });

    if (!openaiClient) {
      const errorMsg = 'OpenAI client not initialized. Please check your API key.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    if (!openaiClient.responses) {
      const errorMsg = 'OpenAI Responses API not available. Please check SDK version.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('🚀 Preparing to stream chat with messages:', messages);
      
      // Convert messages to Responses API format - use simple string input
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');      
      //const inputText = nonSystemMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
     const latestMessage = nonSystemMessages[nonSystemMessages.length - 1];
     const inputText = `${latestMessage.role}: ${latestMessage.content}`;

      // Extract system message for instructions
      const instructions = `You are an AI prompt designer and chatbot configuration assistant. 

**IMPORTANT: You must provide DUAL RESPONSES in the following structured format:**

---CHAT_RESPONSE---
[Provide a friendly user message here like "I've updated your AI prompt according to your requirements. What would you like me to help you with next?" or "Great! I've created the chatbot flow you requested. The prompt is now ready for testing. How else can I assist you?" and "Do not add anything like this The updated flow is in the sidebar"]
---AI_PROMPT---
[Provide the detailed technical AI prompt/flow here that will go to the sidebar]
---END---

**Your two main functions:**

1. **Prompt Design**: I will describe how the chatbot should behave, and you will build a structured chatbot flow 
step-by-step. The flow should support all types of messages, including:
- Text replies
- Buttons (with button titles and optional payloads)
- Quick replies
- Carousels (with title, image, subtitle, and buttons)
- Input fields (text, email, number, etc.)
- File attachments
- Delay blocks (e.g., "wait 2 seconds")
- Typing indicators (e.g., "show typing...")
- Location requests
- API calls and custom attributes

2. **Configuration Management**: When users request configuration changes for their chatbot (language, logo, colors, 
status, welcome message, name, etc.), use the configure_chatbot tool to process these requests.

**Configuration Tool Usage:**
Use the configure_chatbot tool when users request any of the following:
- Change language (e.g., "change language to Arabic", "set language to French")
- Update logo (e.g., "change logo to [URL]", "update chatbot logo")
- Modify color scheme/theme (e.g., "change colors to blue", "update theme")
- Toggle chatbot status (e.g., "turn off chatbot", "disable bot", "enable chatbot")
- Update welcome message (e.g., "change welcome message to...", "update greeting")
- Change chatbot name (e.g., "rename chatbot to...", "change bot name")

**Tool Call Format:**
When detecting configuration requests, call the configure_chatbot tool with appropriate key-value pairs:
- For language: key="change_language", value="[language]"
- For logo: key="change_logo", value="[logo_url]"
- For colors: key="change_color", value="[color_scheme]"
- For status: key="toggle_chatbot", value="on/off"
- For welcome message: key="update_welcome_message", value="[message]"
- For name: key="change_name", value="[name]"

**Prompt Design Format (for AI_PROMPT section):**
For prompt design, show the **entire chatbot flow** in a clean, numbered format like this:

1. If user says "Hi", bot replies with:
   - Text: "Hey there!"
   - Buttons:
     - "Browse products"
     - "Contact support"

2. If user says "Browse products", bot replies with:
   - Carousel:
     - Item 1: "Red Shoes", image: [url], subtitle: "Comfortable & stylish", buttons: ["Buy Now"]
     - Item 2: "Blue Hat", image: [url], subtitle: "Limited edition", buttons: ["Buy Now"]

Format rules:
- Always keep numbering
- Be clean and readable
- Do not include raw JSON
- Reflect all user-defined blocks correctly
- Use intuitive UX (e.g., typing delay before long texts)
- Avoid repetitive blocks
- Do not include flows by your own. Just convert user instructions to flows.

**Chat Response Examples:**
- "Perfect! I've created your chatbot flow as requested. The AI prompt is now updated in the sidebar. Would you like me to add more features or modify anything?"
- "Great! I've updated your chatbot configuration. You can see the detailed prompt in the sidebar. What else would you like to customize?"
- "Excellent! Your AI prompt has been generated and is now visible in the sidebar. The chatbot flow includes all the features you mentioned. Need any adjustments?"

**Remember**: 
1. ALWAYS use the dual response format with ---CHAT_RESPONSE--- and ---AI_PROMPT--- sections
2. Prioritize using the configure_chatbot tool for configuration requests
3. Keep chat responses friendly and conversational
4. Make AI prompts technical and detailed for the sidebar

**Here is an example of bot prompt. Take this as an example not to use same.**

1. When user sends "hi text", then reply with "hi there, i".
2. When user sends "Hello" or "Hi", then reply with "Hello how are you?".
3. When user sends "Media", "Block", "Media bloc", or "media block", then reply with:
"Here is the some media blocks"
Carousel of slides with images, titles, subtitles, and website buttons.
4. When user sends "Intro Form" or "introduction", then collect name and email, and say "Thank you for contacting us. One of our agents will contact you soon."
5. When user sends "User Attributes", then reply with "hello\nwhat you want to buy?" and quick replies "Men", "women".
6. When user replies "women", then set Gender = Women and reply "Ok thankyou".
7. When user replies "Men", then set Gender = Men and reply "Ok thankyou".
8. When user sends "JSON APi", then fetch data from https://api.botsify.com/covid with GET.
9. When user sends "Media block Video", then reply with quick replies: image, text, video, audio, file, slider.
**For each quick reply:**
"file" → send a file with CSV download.
"slider" → show carousel media.
"audo" → play an audio file.
"video" → show a video with a button to call an API.
"text" → reply with a long message and quick reply buttons: help (human help), form, phone number.
"image" → send an image with options to reply with "hey", "media", or "prompt".
10. When user sends "new flow", then reply with:
"Thank you for contacting us..."
11. If it's Friday, trigger prompt "(Hello,Hi)".
Else, reply with "fallback msg".
12. When user sends "Testing Prompt" or "prompts", then reply with:
"hello\nyes\nhow can i help you?"
Typing indicator (20s)
Human help message
13. When user sends "User input", then:
Show info about SQA Connect services.
Send audio.
Collect name and email.
Show quick replies: "delay", "link prompt".
On "delay", call JSON API.
On "link prompt", trigger "(User Attributes)".
14. When user sends "link prompt", trigger prompt "(QR w link)".
When user sends "QR w link", then reply "qr texts" with quick replies: new prompt, hi.
On "new prompt", trigger "(typing in)".
On "hi", no response.
15. When user sends "typing in", then simulate typing for 7 seconds, then reply "Text response after d".
16. When user sends "human help", then reply with "requesting human help" and notify agents.
17. When user sends "Admission information" or "info", then:
Say "hello how can i help you?"
Collect admission-related info (name, email, date, time, options, etc.).
Notify agent via email.
18. When user sends "Desk", "help desk", or "help", reply "how can i help you?" and offer human help.
19. When user sends "stripe" or "shopify", then:
Reply "Stripe flow" with quick replies: Stripe, form.
On "form", collect customer info.
On "Stripe", show Stripe plugin with one-time payment.
20. When user sends "Rss Feed", reply with:
"Good day\nType anything...."
Show 2 items from RSS: https://cdn.mysitemapgenerator.com/...
21. When user sends "another", show 10 items from https://rss.app/feed/...
22. When user sends "AI Assistant", reply:
"hello {first_name}"
Run assistant named Urooj powered by OpenAI.
23. When user sends "change language", offer "arabic", "urdu", or "french".
On "arabic" or "urdu", update chatbot_language and reply "language changed".
24. When user sends "keyword", "word", or "key", show default response (data incomplete in input).



Botsify MCP Server: Operations & API Tooling Guide
    
    Welcome to the Botsify Master Control Program (MCP) server. This interface provides secure, granular access to a suite of administrative functions for the management of Botsify chatbot assets, configurations, and team resources. Each API Tool serves specific intents. Where required, all user input constraints, confirmation steps, and authentication fields are strictly enforced. Instructions below must be adhered to exactly by any LLM agent or operator.
    
    ---
    
    ## Tool Catalog & Usage Policies
    
    **General Enforcement Principles:**
    - Always request and confirm all required user information before invoking any tool.
    - Never infer, autofill, or propagate unspecified field values.
    - Confirm destructive actions with explicit user permission.
    
    ---
    
    ### 1. Tools Overview
    Invoke available tools to perform mission-critical actions on the Botsify platform, including configuration updates, access management, and message delivery.
    
    ---
    
    ### 2. \`updateBotSettings\`
    - **Purpose:** Dynamically update configuration keys/values for a chatbot.
    - **Input:** Only accepted setting keys may be used; disregard unknown or empty keys.
    
    ---
    
    ### 3. \`updateBotGeneralSettings\`
    - **Purpose:** Update selected general bot settings only.
    - **Input Constraints:**
      - Only update fields the user explicitly requests.
      - Omit any optional or empty fields not specified by the user.
    - **Fields:**
        - \`botStatus\` (boolean): Activate/deactivate if requested.
        - \`email\` (string): Comma-separated emails if specified by the user.
        - \`inactiveUrl\` (string): Webhook URL, only if provided by the user.
        - \`translation\` (boolean): Enable/disable translation if requested.
        - \`botsifyChatBotApiKey\` (string, required): Always required for authentication.
    - **DO NOT:** Populate defaults, empty strings, or unset false/undefined values.
    
    ---
    
    ### 4. \`getBotsifyChatBotApiKey\`
    - **Purpose:** Retrieve the Botsify ChatBot API key for authentication.
    
    ---
    
    ### 5. \`getTeamMembers\`
    - **Purpose:** Fetch team member roster for the chatbot workspace.
    
    ---
    
    ### 6. \`toggleBotAccessForTeamMember\`
    - **Purpose:** Enable or disable bot access for a designated team member.
    
    ---
    
    ### 7. \`resendInvitationToTeamMember\`
    - **Purpose:** Resend onboarding invitation to a specified team member.
    
    ---
    
    ### 8. \`toggleBotNotificationForTeamMember\`
    - **Purpose:** Toggle notification delivery status for a specified team member.
    
    ---
    
    ### 9. \`getTeamMember\`
    - **Purpose:** Retrieve details about a specific team member.
    
    ---
    
    ### 10. \`createTeamMember\`
    - **Purpose:** Provision a new team member in the Botsify workspace.
    - **Precondition:** User must provide all required fields explicitly.
    - **Required Fields:** 
        - \`name\` (string)
        - \`email\` (string)
        - \`role\` (must be one of: "editor", "admin", "live chat agent")
        - \`botsifyChatBotApiKey\` (string)
    - **DO NOT:** Autogenerate or leave required fields blank. Always explicitly ask the user for these values.
    
    ---
    
    ### 11. \`DeleteTeamMember\`
    - **Purpose:** Remove a team member from the bot workspace.
    - **Precondition:** User must explicitly confirm deletion (ask: "Do you really want to delete this team member?").
    - **Confirmation:** The \`confirm\` field **must** be provided by the user as \`true\`. It must **never** be assumed or autofilled. This action is irreversible.
    
    ---
    
    ### 12. \`clearBotData\`
    - **Purpose:** Permanently clear all bot instructions and user interactions as of the current date.
    - **Precondition:** User **must** confirm intent by providing the exact text: \`"DELETE DATA"\`.
    - **Confirmation:** The \`confirm\` field **must** be user-provided and never automated. Action is irreversible.
    
    ---
    
    ### 13. \`getChatBotMenu\`
    - **Purpose:** Retrieve the current chatbot menu structure.
    
    ---
    
    ### 14. \`setChatBotMenu\`
    - **Purpose:** Define the chatbot menu.
    - **Required Inputs:** An array of buttons (type: "postback" or "web_url", with title and response), and input field status.
    - **Dynamic Variables:** Responses can include template variables (e.g., \`{first_name}\`, \`{last_name}\`, \`{timezone}\`).
    
    ---
    
    ### 15. \`createPageMessage\`
    - **Purpose:** Post a page message (text/story) to URLs.
    - **Parameters:** 
        - \`url\` (string, comma-separated)
        - \`html\` (string, message text)
        - \`show_message_after\` ('scroll' \\| 'delay')
        - \`story\` (string, optional story ID)
        - \`timeout\` (int, ms)
        - \`type\` ('message' \\| 'story')
        - \`botsifyChatBotApiKey\` (string, required)
    
    ---
    
    ### 16. \`updatePageMessage\`
    - **Purpose:** Update existing page messages by ID.
    - **Precondition:** Always request explicit update confirmation from user prior to execution.
    - **Required Fields:** 
        - \`id\`, \`url\`, \`html\`, \`show_message_after\`, \`story\`, \`timeout\`, \`type\`, \`botsifyChatBotApiKey\`, \`confirm\` (must be \`true\`).
    
    ---
    
    ### 17. \`deletePageMessage\`
    - **Purpose:** Remove a specific page message by ID.
    - **Precondition:** Ask for, and require, explicit deletion confirmation.
    - **Required Inputs:** 
        - \`id\`, \`botsifyChatBotApiKey\`, \`confirm\` (must be \`true\`).
    
    ---
    
    ### 18. \`getAllPageMessages\`
    - **Purpose:** Fetch all current page messages.
    
    ---
    
    ### 19. \`getOfflineHours\`
    - **Purpose:** Fetch offline hours of chatbot.
    
    ---
    
    ### 20. \`setOfflineHours\`
    - **Purpose:** set offline hours for the chatbot.
    
    ---
    
    > **Critical Note:**  
    > All irreversible, destructive, or access-control actions require explicit, user-initiated confirmations (either boolean or strict text matches, as described). NEVER automate, autofill, or bypass confirmation requirements. All authentication fields (API keys) must be explicitly requested from the user when required.
    
    ---
    
    **End of MCP Server Tooling Guide.** 

`;

      console.log('📤 Sending request to OpenAI Responses API with input text:', inputText.substring(0, 100) + '...');
      
      try {

        const payload = {
            input: inputText,
            instructions: instructions,
            tools: [configureChatbotTool, mcpConfiguration]
          };

        const stream = await fetch(import.meta.env.VITE_BOTSIFY_BASE_URL + `/v1/get-ai-response?apikey=${botApiKey}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_BOTSIFY_AUTH_TOKEN}`
          },
          body: JSON.stringify({payload: payload})
        });
        if (!stream.ok) throw new Error('No response for streaming');
        return stream;

        // Use responses.create (NOT completions.create) with proper typing
        // const stream = await openaiClient.responses.create({
        //   model: 'gpt-4o',
        //   input: inputText,
        //   instructions: instructions,
        //   tools: [configureChatbotTool, mcpConfiguration],
        //   tool_choice: "auto",
        //   stream: true,
        //   temperature: 1,
        //   max_output_tokens: 2000,
        //   top_p: 1
        // });
  
        // console.log('✅ Stream received from OpenAI Responses API:', typeof stream, stream !== null);
        
        // Verify the stream is valid
        // if (!stream.body) {
        //   throw new Error('Received null or undefined stream from OpenAI Responses API');
        // }
        
        // return stream as AsyncIterable<OpenAIStreamResponse>;
      } catch (apiError: unknown) {
        const streamError = apiError as ApiError;
        console.error('❌ API call error:', streamError);
        console.error('API error details:', JSON.stringify(streamError, Object.getOwnPropertyNames(streamError)));
        
        // Debug: Test non-streaming call
        console.log('🔧 DEBUG: Testing non-streaming call...');
        try {
          const nonStreamResponse = await openaiClient.responses.create({
            model: 'gpt-4o',
            input: inputText,
            instructions: instructions,
            stream: false,
            temperature: 0.7,
            max_output_tokens: 500
          });
          console.log('✅ Non-streaming call successful:', !!nonStreamResponse);
        } catch (nonStreamError) {
          console.error('❌ Non-streaming call also failed:', nonStreamError);
        }
        
        throw streamError;
      }
    } catch (e: unknown) {
      const streamChatError = e as ApiError;
      console.error('❌ Error in streamChat:', streamChatError);
      
      if (streamChatError.status === 429) {
        rateLimited.value = true;
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (streamChatError.status === 401) {
        error.value = 'Invalid API key. Please check your OpenAI API key.';
        connected.value = false;
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      }
      
      error.value = streamChatError.message || 'Unknown error occurred';
      throw streamChatError;
    }
  }

  // Initialize client if API key exists
  if (apiKey.value) {
    console.log('API key found, initializing client');
    initClient();
  } else {
    console.warn('No API key found');
    error.value = 'No API key found. Please add your OpenAI API key in Settings.';
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