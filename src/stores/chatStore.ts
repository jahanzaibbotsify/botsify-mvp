import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';
import { useOpenAIStore } from './openaiStore';
import { useMCPStore } from './mcpStore';
import type { Chat, Message, Attachment, PromptVersion, GlobalPromptTemplate } from '../types';
import { botsifyApi } from '../services/botsifyApi';
import { useBotStore } from './botStore';
import { currentTime } from '@/utils';

export const useChatStore = defineStore('chat', () => {
  const openAIStore = useOpenAIStore();
  const mcpStore = useMCPStore();
  const chats = ref<Chat[]>([]);
  const activeChat = ref<string | null>(null);
  const isTyping = ref(false);
  const isAIPromptGenerating = ref(false);
  const doInputDisable = ref(false);
  const globalPromptTemplates = ref<GlobalPromptTemplate[]>([]);
  const activeAiPromptVersion = computed(() => chats.value[0]?.story?.versions.find(v => v.isActive) || null);
  const botStore = useBotStore();

  function convertStoredVersionsToStoryStructure(aiPromptVersions: object[]) {
    let versionId = '';
    let activeVersionId = '';
    let activeVersionContent = '';
    const StoredVersions = aiPromptVersions.map((ver: any) => {
      let prompt;
      if (typeof ver.ai_prompt === 'string') {
        try {
          prompt = JSON.parse(ver.ai_prompt);
        } catch (e) {
          prompt = ver.ai_prompt; // fallback to original string if JSON parsing fails
        }
      } else {
        prompt = ver.ai_prompt;
      }

      versionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      if (ver.is_active) {
        activeVersionContent = prompt;
        activeVersionId = versionId
      }
      return {
        id: versionId,
        version_id: ver.id,
        name: ver.name,
        content: prompt,
        updatedAt: new Date(ver.updated_at),
        version: Date.now(),
        isActive: ver.is_active
      };
    });
    return {
      'content': activeVersionContent,
      'updatedAt': currentTime(),
      'versions': StoredVersions,
      'activeVersionId': activeVersionId
    };
  }

  // Load data from localStorage on initialization
  function loadFromStorage(userChats: string, aiPromptVersions: object[]) {
    try {
      // console.log('🔍 Attempting to load data from localStorage');
      const storedChats = userChats;
      const storedTemplates = convertStoredVersionsToStoryStructure(aiPromptVersions);
      const storedActiveChat = localStorage.getItem('botsify_active_chat');
      
      // console.log('📊 Storage check:', {
      //  hasStoredChats: !!storedChats,
      //  hasStoredTemplates: !!storedTemplates,
      //  hasStoredActiveChat: !!storedActiveChat
      //});      
      
      if (storedChats && storedChats.length > 4 && storedChats !== 'null' && storedChats !== 'undefined') {
      try {
          const parsedChats = JSON.parse(storedChats);
          if (storedTemplates) {
            parsedChats[0].story = (storedTemplates);
          }else{
            parsedChats[0].story = {};
          }
          // Ensure parsedChats is an array before mapping
          if (Array.isArray(parsedChats)) {
            // Convert date strings back to Date objects
            chats.value = parsedChats.map((chat: any) => ({
              ...chat,
              timestamp: new Date(chat.timestamp),
              messages: chat.messages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })) || [],
              story: chat.story ? {
                ...chat.story,
                updatedAt: new Date(chat.story.updatedAt),
                versions: chat.story.versions?.map((v: any) => ({
                  ...v,
                  updatedAt: new Date(v.updatedAt)
                })) || []
              } : undefined
            }));
            // console.log('✅ Loaded chats from storage:', chats.value.length);
          } else {
            console.warn('⚠️ Stored chats is not an array, clearing storage');
            localStorage.removeItem('botsify_chats');
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse stored chats JSON:', jsonError);
        }
      } else {
        chats.value[0].id = botStore.apiKey;
        chats.value.forEach(chat => {
          if (chat) {
            (chat as any).story = storedTemplates; 
          }
        });
        console.warn('⚠️ No chats found in localStorage');
      }

      // if (storedTemplates && storedTemplates !== 'null' && storedTemplates !== 'undefined') {
      //   try {
      //     const parsedTemplates = JSON.parse(storedTemplates);
      //     // Ensure parsedTemplates is an array before mapping
      //     if (Array.isArray(parsedTemplates)) {
      //       globalPromptTemplates.value = parsedTemplates.map((template: any) => ({
      //         ...template,
      //         createdAt: new Date(template.createdAt),
      //         updatedAt: new Date(template.updatedAt)
      //       }));
      //       // console.log('✅ Loaded prompt templates from storage:', globalPromptTemplates.value.length);
      //     } else {
      //       console.warn('⚠️ Stored templates is not an array, clearing storage');
      //       localStorage.removeItem('botsify_prompt_templates');
      //     }
      //   } catch (jsonError) {
      //     console.error('❌ Failed to parse stored templates JSON:', jsonError);
      //     // Clear corrupted data
      //     localStorage.removeItem('botsify_prompt_templates');
      //   }
      // } else {
      //   console.warn('⚠️ No templates found in localStorage');
      // }

      if (storedActiveChat && chats.value.some(c => c.id === storedActiveChat)) {
        activeChat.value = storedActiveChat;
        // console.log('✅ Restored active chat:', storedActiveChat);
      } else if (storedActiveChat) {
        console.warn('⚠️ Stored active chat ID not found in loaded chats:', storedActiveChat);
      }
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
    }
  }

  // Save data to localStorage
  async function saveToTemplate() {

    try {
      const chatRecords = JSON.parse(JSON.stringify(chats.value[0]??''));
      const aiPrompt = chatRecords.story?.content ?? '';
      delete chatRecords.story;
      const chatsJson =  JSON.stringify(chatRecords ? [chatRecords] : null);

      
      const payload = {
          bot_id: botStore.botId,
          ai_prompt: aiPrompt,
          chat_flow: chatsJson,
          name: activeAiPromptVersion.value?.name ?? 'version-1',
          version_id: '',
      }

      if (activeAiPromptVersion.value?.version_id) {
        payload.version_id = `${activeAiPromptVersion.value?.version_id}`;
      }

      

      const response = await botsifyApi.saveBotTemplates(payload);
      
      if (!response.success) {
         console.error('❌ Error saving bot templates:', response.message);
         // Error message will be shown in red text in the chats
         // Toast notifications disabled as requested
         return false;
       }

      if (activeAiPromptVersion.value && !activeAiPromptVersion.value?.version_id) {
          activeAiPromptVersion.value.version_id = response.data.version_id;
      }
       
      return true;
         } catch (error) {
       console.error('❌ Error saving to storage:', error);
       // Error message will be shown in red text in the chat
       // Toast notifications disabled as requested
       return false;
     }

  }

  // Add window event listeners to ensure data is saved before page unload
  // if (typeof window !== 'undefined') {
  //   window.addEventListener('beforeunload', () => {
  //     // console.log('📝 Page unloading, saving data');
  //     // saveToTemplate();
  //   });

  //   // Also save when tab visibility changes (user switches tabs)
  //   window.addEventListener('visibilitychange', () => {
  //     if (document.visibilityState === 'hidden') {
  //       // console.log('📝 Tab hidden, saving data');
  //       // saveToTemplate();
  //     }
  //   });
  // }

  const currentChat = computed(() => {
    return chats.value.find(chat => chat.id === activeChat.value) || null;
  });

  const defaultPromptTemplate = computed(() => {
    return globalPromptTemplates.value.find(t => t.isDefault) || null;
  });
// // console.log(defaultPromptTemplate, "defaultPromptTemplate");
  function setActiveChat(chatId: string) {
    // console.log('Setting active chat:', chatId);
    activeChat.value = chatId;
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) {
      chat.unread = false;
    } else {
      console.warn('Chat not found with ID:', chatId);
    }
  }

  async function addMessage(chatId: string, content: string, sender: 'user' | 'assistant', attachments?: Attachment[]) {
    // console.log(`Adding ${sender} message to chat ${chatId}:`, content);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      console.error('Chat not found with ID:', chatId);
      return null;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: currentTime(),
      sender,
      attachments
    };

    chat.messages.push(newMessage);
    chat.lastMessage = content;
    chat.timestamp = currentTime();

    // Only trigger AI response for user messages when connected
    if (sender === 'user') {
      // console.log('Triggering AI response');
      try {
        await handleAIResponse(chat);
      } catch (error: any) {
        console.error('Error in handleAIResponse:', error);
        // Error is already handled in handleAIResponse, just ensure typing indicators are off
        isTyping.value = false;
        isAIPromptGenerating.value = false;
      }
    } 

    return newMessage;
  }

  async function updateMessage(messageId: string, content: string) {
    const chat = chats.value.find(c => c.messages.some(m => m.id === messageId));
    if (!chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (message) {
      message.content = content;
      message.timestamp = currentTime();

      // Update the chat's last message if this was the latest message
      const isLastMessage = chat.messages[chat.messages.length - 1].id === messageId;
      if (isLastMessage) {
        chat.lastMessage = content;
        chat.timestamp = currentTime();
      }
    }
  }

  function removeLastMessage(chatId: string) {
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat || chat.messages.length === 0) return;

    // Remove the last message
    chat.messages.pop();

    // Update the chat's last message and timestamp
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      chat.lastMessage = lastMessage.content;
      chat.timestamp = lastMessage.timestamp;
    } else {
      chat.lastMessage = undefined;
      chat.timestamp = currentTime();
    }
  }

  function createAiPromptVersionName() {
    if (!chats.value[0]?.story?.versions?.length) {
      return `version-1`;
    }else{
      const lastestVersionNumber = Math.max(
        ... chats.value[0].story.versions.map(v => parseInt(v.name.split('-')[1]))
      ) + 1;
      return `version-${lastestVersionNumber}`
    }
  }

  function createPromptVersion(content: string, isActive: boolean = true): PromptVersion {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      version_id: 0,
      name: createAiPromptVersionName(),
      content,
      updatedAt: new Date(),
      version: Date.now(),
      isActive
    };
  }

  function updateStory(chatId: string, content: string, createNewVersion: boolean = true) {
    // console.log(`Updating story for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      console.error('Chat not found with ID:', chatId);
      return;
    }

    if (!chat.story) {
      // Create new story with first version
      const newVersion = createPromptVersion(content);
      chat.story = {
        content,
        updatedAt: new Date(),
        versions: [newVersion],
        activeVersionId: newVersion.id
      };
    } else {
      if (createNewVersion) {
        // Mark current version as inactive
        chat.story.versions.forEach(v => v.isActive = false);

        // Create new version
        const newVersion = createPromptVersion(content);
        chat.story.versions.push(newVersion);
        chat.story.activeVersionId = newVersion.id;
      }else if (activeAiPromptVersion.value){
        activeAiPromptVersion.value.content = content;
        activeAiPromptVersion.value.updatedAt = new Date();
      }

      // update content
      chat.story.content = content;
      chat.story.updatedAt = new Date();
      saveToTemplate();

    }

    return chat.story;
  }

  function updateActivePromptVersionId(versionId: number) {
    if (activeAiPromptVersion.value) {
      activeAiPromptVersion.value.version_id = versionId; 
    }
  }

  function revertToPromptVersion(chatId: string, versionId: string) {
    // console.log(`Reverting to prompt version ${versionId} for chat ${chatId}`);
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat?.story) {
      console.error('Chat or story not found');
      return;
    }

    const version = chat.story.versions.find(v => v.id === versionId);
    if (!version) {
      console.error('Version not found');
      return;
    }

    // Mark all versions as inactive
    chat.story.versions.forEach(v => v.isActive = false);

    // Mark selected version as active
    version.isActive = true;
    chat.story.activeVersionId = version.id;
    chat.story.content = version.content;
    chat.story.updatedAt = new Date();

    return chat.story;
  }

  async function deletePromptVersion(chatId: string, versionId: string) {
    try{
      // console.log(`Deleting prompt version ${versionId} for chat ${chatId}`);
      const chat = chats.value.find(c => c.id === chatId);
      if (!chat?.story) {
        console.error('Chat or story not found');
        return;
      }

      const versionIndex = chat.story.versions.findIndex(v => v.id === versionId);
      if (versionIndex === -1) {
        console.error('Version not found');
        window.$toast.error(`❌ version not found`);
        return;
      }

      // Don't allow deleting the last version
      if (chat.story.versions.length <= 1) {
        console.warn('Cannot delete the last version');
        return;
      }

      const version = chat.story.versions[versionIndex];

      const response = await botsifyApi.deleteAiPromptVersion([version.version_id]);

      if (!response.success) {
        window.$toast.error(`❌ ${response.message}`);
        console.error('❌ Error saving bot templates:', response.message);
        // Error message will be shown in red text in the chat
        // Toast notifications disabled as requested
        return false;
      }

      window.$toast.success(`${response.message}`);
      chat.story.versions.splice(versionIndex, 1);

      } catch (error) {
        console.error('❌ Error saving to storage:', error);
        window.$toast.error(`❌ ${error}`);
        // Error message will be shown in red text in the chat
        // Toast notifications disabled as requested
        return false;
     }
  }

  // Global prompt template management
  function createGlobalPromptTemplate(name: string, content: string, isDefault: boolean = false): GlobalPromptTemplate {
    if (isDefault) {
      // Mark all existing templates as non-default
      globalPromptTemplates.value.forEach(t => t.isDefault = false);
    }

    const template: GlobalPromptTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      content,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    globalPromptTemplates.value.push(template);
    return template;
  }

  function updateGlobalPromptTemplate(templateId: string, updates: Partial<GlobalPromptTemplate>) {
    const template = globalPromptTemplates.value.find(t => t.id === templateId);
    if (!template) {
      console.error('Template not found');
      return;
    }

    if (updates.isDefault) {
      // Mark all other templates as non-default
      globalPromptTemplates.value.forEach(t => t.isDefault = false);
    }

    Object.assign(template, updates, { updatedAt: new Date() });
    return template;
  }

  function deleteGlobalPromptTemplate(templateId: string) {
    const index = globalPromptTemplates.value.findIndex(t => t.id === templateId);
    if (index === -1) {
      console.error('Template not found');
      return;
    }

    globalPromptTemplates.value.splice(index, 1);
  }

  async function handleAIResponse(chat: Chat) {
    // console.log('Handling AI response for chat:', chat.id);
    doInputDisable.value = true;
    isTyping.value = true;
    let streamedContent = '';
    let toolCalls: any[] = [];

    try {
      // Prepare messages with MCP system prompt integration
      const userMessages = chat.messages.map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      // Get the default system prompt from OpenAI store as the base
      const defaultSystemPrompt = `You are an AI prompt designer and chatbot configuration assistant. 

**IMPORTANT: You must provide DUAL RESPONSES in the following structured format:**

---CHAT_RESPONSE---
[Provide a friendly user message here like "I've updated your AI prompt according to your requirements. What would you like me to help you with next?" or "Great! I've created the chatbot flow you requested. The prompt is now ready for testing. How else can I assist you?"]
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
24. When user sends "keyword", "word", or "key", show default response (data incomplete in input).`;

      // Get MCP system prompt if there are connected servers
      const mcpSystemPrompt = mcpStore.getCombinedSystemPrompt();

      // Get connected services JSON to append to system prompt
      const connectedServicesJson = await getConnectedServicesJson(chat.id);

      // ALWAYS start with the default system prompt as the foundation
      let finalSystemPrompt = defaultSystemPrompt;

      // Append MCP system prompt if available (never replace, only append)
      if (mcpSystemPrompt && mcpSystemPrompt.trim()) {
        finalSystemPrompt += `

---MCP_SERVERS---
${mcpSystemPrompt}
---END_MCP_SERVERS---`;

        console.log('✅ MCP system prompt appended to default prompt');
      } else {
        console.log('ℹ️ No MCP system prompt to append');
      }

      // Append connected services information if available (never replace, only append)
      if (connectedServicesJson && connectedServicesJson.trim()) {
        finalSystemPrompt += `

---CONNECTED_SERVICES---
${connectedServicesJson}
---END_CONNECTED_SERVICES---

Use the above connected services information to understand what tools and data sources are available for this chat session. When users ask about capabilities or need to access files/web content, refer to these connected services.`;

        console.log('✅ Connected services JSON appended to system prompt');
      } else {
        console.log('ℹ️ No connected services found for this chat session');
      }

      // Build messages array with the complete system prompt
      const messages = [
        { role: 'system', content: finalSystemPrompt },
        ...userMessages
      ];

      console.log('Sending messages to OpenAI with enhanced system prompt:', {
        hasDefaultPrompt: !!defaultSystemPrompt,
        hasMCPPrompt: !!mcpSystemPrompt,
        hasConnectedServices: !!connectedServicesJson,
        connectedServers: mcpStore.connectedServers.length,
        messageCount: messages.length,
        finalPromptLength: finalSystemPrompt.length
      });

      const stream = await openAIStore.streamChat(messages);
      // // console.log('Stream object received:', stream);
      if (!stream.body) throw new Error('No response body for streaming');
      const reader = stream.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      // Don't add initial AI message yet - wait for first content
      let aiMessage: Message | null = null;
      let eachStreamContent = '';
      let isChatResponse = false;
      let dataType = '';

      aiMessage = {
        id: Date.now().toString(),
        content: eachStreamContent,
        timestamp: currentTime(),
        sender: 'assistant'
      };
      chat.messages.push(aiMessage);

      // console.log('Waiting for first content chunk to create AI message');

      console.log('Starting to process stream');
      // for await (const chunk of stream) {
        // // console.log('Received chunk:', chunk);

      while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // console.log('chunk--->', chunk); // or yield chunk, or process as needed

        // Handle Responses API streaming format
        // if (chunk.type === 'response.output_text.delta') {
          const content = chunk;
          eachStreamContent = content;

          
          
          if (eachStreamContent.includes('---') && dataType !== '---AI_PROMPT---') {
            isChatResponse = false;
            if (!dataType && (streamedContent + eachStreamContent).includes('---CHAT_RESPONSE---')) {
              dataType =  '---CHAT_RESPONSE---';
              isTyping.value = false;
              isChatResponse = true;
              chat.messages[chat.messages.length - 1].content += (streamedContent + eachStreamContent).replace(dataType, '');
              }else if (dataType){
              dataType =  eachStreamContent.split('---')[0];
              chat.messages[chat.messages.length - 1].content += dataType;
              dataType = '---AI_PROMPT---';
              isAIPromptGenerating.value = true;
            }
          }else if (isChatResponse && eachStreamContent) {
            chat.messages[chat.messages.length - 1].content += eachStreamContent;
          }

          streamedContent += eachStreamContent;
          eachStreamContent = '';

          // Just collect content - don't create message bubble yet
        // } else if (chunk.type && chunk.type.includes('function_call')) {
          // Handle tool calls for Responses API
          // // console.log('Tool call delta received:', chunk);
          // Tool call handling for Responses API format
          // This will need to be implemented based on the actual tool call structure
        // }
      }
      isTyping.value = false;
      console.log('Stream processing complete');
      console.log('Final content length:', streamedContent.length);
      console.log('Tool calls received:', toolCalls);

      // Parse the dual response format
      const parsedResponse = parseDualResponse(streamedContent);

      // Only create AI message when we have content to show
      // if (parsedResponse.chatResponse && parsedResponse.aiPrompt) {
      //   // Create AI message with the chat response
      //   aiMessage = {
      //     id: Date.now().toString(),
      //     content: parsedResponse.chatResponse,
      //     timestamp: currentTime(),
      //     sender: 'assistant'
      //   };
      //   chat.messages.push(aiMessage);
      //   chat.lastMessage = parsedResponse.chatResponse;
      //   await nextTick();

      //   // Update the sidebar with the AI prompt
      //   updateStory(chat.id, parsedResponse.aiPrompt, true);
      //   // console.log('Updated sidebar with AI prompt');
      // } else if (parsedResponse.chatResponse && !parsedResponse.aiPrompt) {
      //   // Only chat response found, no AI prompt
      //   aiMessage = {
      //     id: Date.now().toString(),
      //     content: parsedResponse.chatResponse,
      //     timestamp: currentTime(),
      //     sender: 'assistant'
      //   };
      //   chat.messages.push(aiMessage);
      //   chat.lastMessage = parsedResponse.chatResponse;
      //   await nextTick();
      //   // console.log('Only chat response found, no AI prompt to update sidebar');
      // } else if (!parsedResponse.chatResponse && parsedResponse.aiPrompt) {
      //   // Only AI prompt found, no chat response - this shouldn't happen but handle it
      //   aiMessage = {
      //     id: Date.now().toString(),
      //     content: 'I\'ve updated your AI prompt. You can see the details in the sidebar.',
      //     timestamp: currentTime(),
      //     sender: 'assistant'
      //   };
      //   chat.messages.push(aiMessage);
      //   chat.lastMessage = aiMessage.content;
      //   await nextTick();

      //   // Update the sidebar with the AI prompt
      //   updateStory(chat.id, parsedResponse.aiPrompt, true);
      //   // console.log('Only AI prompt found, updated sidebar and provided generic chat message');
      // } else {
      //   // No structured format found - treat as regular chat response only
      //   console.warn('No structured dual response format found, treating as regular chat response');
      //   if (streamedContent) {
      //     aiMessage = {
      //       id: Date.now().toString(),
      //       content: streamedContent,
      //       timestamp: currentTime(),
      //       sender: 'assistant'
      //     };
      //     chat.messages.push(aiMessage);
      //     chat.lastMessage = streamedContent;
      //     await nextTick();
      //   }
      //   // Do NOT update sidebar when no structured format is found
      //   // console.log('No sidebar update - content treated as regular chat response only');
      // }

      if (parsedResponse.chatResponse) {
        chat.lastMessage = parsedResponse.chatResponse;
      }
      if (parsedResponse.aiPrompt) {
        updateStory(chat.id, parsedResponse.aiPrompt, !activeAiPromptVersion.value ? true : false);
      }

      await nextTick();


      // Process tool calls if any
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'configure_chatbot') {
            try {
              console.log('Processing configure_chatbot tool call:', toolCall);

              // Parse the arguments
              const args = JSON.parse(toolCall.function.arguments);
              console.log('Parsed tool arguments:', args);

              if (args.tasks && Array.isArray(args.tasks)) {
                try {
                  // Process configuration tasks
                  const configResult = await openAIStore.processConfigurationTool(args.tasks);
                  console.log('Configuration result:', configResult);

                  // Check if any tasks failed
                  if (configResult.includes('❌ Failed to complete')) {
                    // Show error message
                    const errorMessage: Message = {
                      id: Date.now().toString() + '_config_error',
                      content: 'Internal Server Error, Please Contact team@botsify.com',
                      timestamp: currentTime(),
                      sender: 'assistant'
                    };
                    chat.messages.push(errorMessage);
                    chat.lastMessage = errorMessage.content;
                    
                    // Error message will be shown in red text in the chat
                    // Toast notifications disabled as requested
                    
                    // Stop the flow
                    return;
                  }

                  // Add configuration result as a new message
                  const configMessage: Message = {
                    id: Date.now().toString() + '_config',
                    content: configResult,
                    timestamp: currentTime(),
                    sender: 'assistant'
                  };
                  chat.messages.push(configMessage);
                  chat.lastMessage = configResult;

                  // Force UI update
                  await nextTick();
                } catch (configError: any) {
                  console.error('Configuration tool error:', configError);
                  const errorMessage: Message = {
                    id: Date.now().toString() + '_config_error',
                    content: 'Internal Server Error, Please Contact team@botsify.com',
                    timestamp: currentTime(),
                    sender: 'assistant'
                  };
                  chat.messages.push(errorMessage);
                  chat.lastMessage = errorMessage.content;
                  
                  // Error message will be shown in red text in the chat
                  // Toast notifications disabled as requested
                  
                  // Stop the flow
                  return;
                }
              } else {
                console.error('Invalid tool call arguments:', args);
                const errorMessage: Message = {
                  id: Date.now().toString() + '_error',
                  content: 'Internal Server Error, Please Contact team@botsify.com',
                  timestamp: currentTime(),
                  sender: 'assistant'
                };
                chat.messages.push(errorMessage);
                chat.lastMessage = errorMessage.content;
                
                // Error message will be shown in red text in the chat
                // Toast notifications disabled as requested
                
                // Stop the flow
                return;
              }
            } catch (parseError: any) {
              console.error('Error parsing tool call arguments:', parseError);
              const errorMessage: Message = {
                id: Date.now().toString() + '_parse_error',
                content: 'Internal Server Error, Please Contact team@botsify.com',
                timestamp: currentTime(),
                sender: 'assistant'
              };
              chat.messages.push(errorMessage);
              chat.lastMessage = errorMessage.content;
              
              // Error message will be shown in red text in the chat
              // Toast notifications disabled as requested
              
              // Stop the flow
              return;
            }
          }
        }
      }

      // If no content was received but we expected some, show a fallback message
      if (!streamedContent && !toolCalls.length) {
        console.warn('No content received from stream');
        if (!aiMessage) {
          aiMessage = {
            id: Date.now().toString(),
            content: 'I received your message but had no response to provide.',
            timestamp: currentTime(),
            sender: 'assistant'
          };
          chat.messages.push(aiMessage);
          chat.lastMessage = aiMessage.content;
        }
      }

      // Save templates only on successful completion
      try {
        await saveToTemplate();
      } catch (saveError) {
        console.error('Error saving templates after successful AI response:', saveError);
        // Don't show error for template saving to avoid confusion
      }

    } catch (error: any) {
      console.error('AI response error:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Remove any empty message if it exists
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage && lastMessage.sender === 'assistant' && !lastMessage.content) {
        chat.messages.pop();
      }

      // Add an error message with standardized message
      const errorMessage = error.message || 'Internal Server Error, Please Contact team@botsify.com';
      addMessage(
        chat.id,
        errorMessage,
        'assistant'
      );

      // Error message will be shown in red text in the chat
      // Toast notifications disabled as requested

      // Stop the flow - don't continue with any other operations
      return;
    } finally {
      // Always set typing to false when done
      isTyping.value = false;
      isAIPromptGenerating.value = false;
      doInputDisable.value = false;
      // console.log('Typing indicator turned off');
      
      // Note: saveToTemplate() is not called here to prevent additional API calls on error
      // The flow stops completely when an error occurs
    }
  }

  // Helper function to parse dual response format
  function parseDualResponse(content: string): { chatResponse: string | null; aiPrompt: string | null } {
    // console.log('=== PARSING DUAL RESPONSE ===');
    // console.log('Full content received:', content);
    // console.log('Content length:', content.length);

    // Handle case where content might contain the markers but not in expected order
    const chatResponseMatch = content.match(/---CHAT_RESPONSE---([\s\S]*?)(?=---AI_PROMPT---|---END---|$)/);
    const aiPromptMatch = content.match(/---AI_PROMPT---([\s\S]*?)(?=---END---|$)/);

    let chatResponse = chatResponseMatch ? chatResponseMatch[1].trim() : null;
    let aiPrompt = aiPromptMatch ? aiPromptMatch[1].trim() : null;

    console.log('Initial parsing results:', {
      foundChatMarker: !!chatResponseMatch,
      foundAIMarker: !!aiPromptMatch,
      chatResponseLength: chatResponse?.length || 0,
      aiPromptLength: aiPrompt?.length || 0
    });

    // Additional validation - if we found markers but content is empty, set to null
    if (chatResponse && chatResponse.length === 0) {
      chatResponse = null;
    }
    if (aiPrompt && aiPrompt.length === 0) {
      aiPrompt = null;
    }

    // If we didn't find the structured format, try to detect patterns more aggressively
    if (!chatResponse && !aiPrompt && content.trim()) {
      // console.log('No structured format found, analyzing content patterns...');

      const lowerContent = content.toLowerCase().trim();
      const contentLines = content.trim().split('\n');

      // Check if it looks like a conversational chat response
      const chatIndicators = [
        'great!', 'perfect!', 'excellent!', 'awesome!', 'wonderful!',
        'i\'ve updated', 'i\'ve created', 'i\'ve generated', 'i\'ve built',
        'here you go', 'here\'s', 'let me help', 'how can i', 'how may i',
        'what would you like', 'anything else', 'would you like me to',
        'sure!', 'absolutely!', 'of course!', 'no problem!',
        'i can help', 'happy to help', 'glad to help'
      ];

      // Check if it looks like an AI prompt/instructions (more comprehensive)
      const promptIndicators = [
        'you are', 'act as', 'your role is', 'instructions:', 'system:',
        'when user', 'if user', 'respond with', 'reply with',
        'user says', 'user sends', 'user clicks', 'user types'
      ];

      // Check for numbered list patterns that indicate AI prompts
      const hasNumberedList = /^\d+\.\s/.test(content.trim()) || contentLines.some(line => /^\d+\.\s/.test(line.trim()));
      const hasWhenUserPattern = /when user/i.test(content);
      const hasIfUserPattern = /if user/i.test(content);
      const hasBotRepliesPattern = /(bot replies|reply with|respond with)/i.test(content);

      // Count indicators
      const chatIndicatorCount = chatIndicators.filter(indicator => lowerContent.includes(indicator)).length;
      const promptIndicatorCount = promptIndicators.filter(indicator => lowerContent.includes(indicator)).length;

      console.log('Content analysis:', {
        chatIndicatorCount,
        promptIndicatorCount,
        hasNumberedList,
        hasWhenUserPattern,
        hasIfUserPattern,
        hasBotRepliesPattern,
        contentPreview: content.substring(0, 150) + '...'
      });

      // Determine if this is clearly an AI prompt based on multiple indicators
      const isLikelyAIPrompt = (
        (hasNumberedList && (hasWhenUserPattern || hasIfUserPattern)) ||
        (promptIndicatorCount >= 2) ||
        (hasWhenUserPattern && hasBotRepliesPattern) ||
        (promptIndicatorCount > 0 && hasNumberedList)
      );

      // Determine if this is clearly a chat response
      const isLikelyChatResponse = (
        chatIndicatorCount >= 1 && promptIndicatorCount === 0 && !hasNumberedList
      );

      // console.log('Classification:', { isLikelyAIPrompt, isLikelyChatResponse });

      if (isLikelyAIPrompt && !isLikelyChatResponse) {
        // This looks like a structured AI prompt
        aiPrompt = content.trim();
        chatResponse = 'I\'ve created your AI prompt. You can see the details in the sidebar.';
        // console.log('✅ Content classified as AI prompt - separated into sidebar');
      } else if (isLikelyChatResponse && !isLikelyAIPrompt) {
        // This is clearly a chat response
        chatResponse = content.trim();
        // console.log('✅ Content classified as chat response only');
      } else {
        // Ambiguous content - check for mixed content and try to separate
        // console.log('⚠️ Ambiguous content detected, attempting separation...');

        // Try to find where AI prompt might start within the content
        const lines = contentLines;
        let separationIndex = -1;

        // Look for transitions that might indicate AI prompt start
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase().trim();

          // Check if this line starts what looks like an AI prompt
          if (
            /^\d+\.\s/.test(lines[i].trim()) &&
            (line.includes('when user') || line.includes('if user') || line.includes('user says'))
          ) {
            separationIndex = i;
            break;
          }

          // Check for explicit prompt indicators at line start
          if (
            line.startsWith('you are') ||
            line.startsWith('act as') ||
            line.startsWith('instructions:') ||
            line.startsWith('system:')
          ) {
            separationIndex = i;
            break;
          }
        }

        if (separationIndex > 0) {
          // Found separation point
          const chatPart = lines.slice(0, separationIndex).join('\n').trim();
          const promptPart = lines.slice(separationIndex).join('\n').trim();

          if (chatPart.length > 0 && promptPart.length > 0) {
            chatResponse = chatPart;
            aiPrompt = promptPart;
            console.log('✅ Successfully separated mixed content', {
              chatLength: chatPart.length,
              promptLength: promptPart.length
            });
          } else {
            // Fallback to treating as chat response only
            chatResponse = content.trim();
            // console.log('⚠️ Separation failed, treating as chat response only');
          }
        } else {
          // No clear separation found - default to chat response only to avoid contamination
          chatResponse = content.trim();
          // console.log('⚠️ No separation possible, defaulting to chat response only');
        }
      }
    }

    // Final validation - don't allow AI prompts to leak into chat
    if (chatResponse) {
      // Check if chat response accidentally contains AI prompt content
      const suspiciousPatterns = [
        /^\d+\.\s.*when user/i,
        /respond with.*:\s*-\s*text:/i,
        /bot replies with.*buttons:/i,
        /quick replies.*\[.*\]/i
      ];

      const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(chatResponse!));

      if (hasSuspiciousContent && !aiPrompt) {
        // console.log('🚨 Detected AI prompt content in chat response, moving to sidebar');
        aiPrompt = chatResponse;
        chatResponse = 'I\'ve created your AI prompt. You can see the details in the sidebar.';
      }
    }

    console.log('=== FINAL PARSING RESULTS ===');
    console.log('Chat Response:', chatResponse ? `"${chatResponse.substring(0, 100)}..."` : 'null');
    console.log('AI Prompt:', aiPrompt ? `"${aiPrompt.substring(0, 100)}..."` : 'null');
    console.log('============================');

    return { chatResponse, aiPrompt };
  }

  /**
   * Generate connected services JSON for the current chat session
   * 
   * This function collects information about all connected services for a specific chat:
   * - MCP Servers: Connected Model Context Protocol servers with their features and auth status
   * - File Search: Uploaded files available for search and retrieval
   * - Web Search: Connected websites for web content search
   * 
   * The generated JSON is appended to the system prompt to inform the AI about
   * available tools and data sources, enabling context-aware responses.
   * 
   * @param chatId - The unique identifier for the chat session
   * @returns JSON string containing connected services information, or null if no services
   */
  async function getConnectedServicesJson(chatId: string): Promise<string | null> {
    try {
      const connectedServices: any = {
        chatId: chatId,
        timestamp: currentTime(),
        services: {}
      };

      let hasServices = false;

      // Get MCP servers information
      if (mcpStore.connectedServers.length > 0) {
        connectedServices.services.mcp_servers = mcpStore.connectedServers.map((serverConfig: any) => ({
          id: serverConfig.id,
          name: serverConfig.name,
          category: serverConfig.category,
          description: serverConfig.description,
          features: serverConfig.features,
          connectionUrl: serverConfig.connectionUrl,
          authMethod: serverConfig.authMethod,
          hasAuthentication: !!serverConfig.connection?.apiKey,
          status: 'connected'
        }));
        hasServices = true;
      }

      // Check for File Search data
      // try {
      //   const fileSearchResponse = await botsifyApi.getFileSearch();
      //   if (fileSearchResponse.success && fileSearchResponse.data?.files?.length > 0) {
      //     connectedServices.services.file_search = {
      //       status: 'connected',
      //       files: fileSearchResponse.data.files.map((file: any) => ({
      //         id: file.id,
      //         name: file.name || file.filename,
      //         type: file.type || file.fileType,
      //         size: file.size,
      //         uploadedAt: file.uploadedAt || file.createdAt
      //       })),
      //       totalFiles: fileSearchResponse.data.files.length,
      //       lastUpdated: currentTime().toISOString()
      //     };
      //     hasServices = true;
      //   }
      // } catch (error) {
      //   // console.log('No file search data or error loading:', error);
      // }

      // Check for Web Search data
      // try {
      //   const webSearchResponse = await botsifyApi.getWebSearch();
      //   if (webSearchResponse.success && webSearchResponse.data) {
      //     connectedServices.services.web_search = {
      //       status: 'connected',
      //       url: webSearchResponse.data.url,
      //       title: webSearchResponse.data.title,
      //       domain: webSearchResponse.data.domain,
      //       connectedAt: webSearchResponse.data.connectedAt,
      //       lastUpdated: currentTime().toISOString()
      //     };
      //     hasServices = true;
      //   }
      // } catch (error) {
      //   // console.log('No web search data or error loading:', error);
      // }

      // Return JSON only if we have connected services
      if (hasServices) {
        const jsonString = JSON.stringify(connectedServices, null, 2);
        console.log('Connected services JSON generated:', {
          chatId: chatId,
          mcpServers: connectedServices.services.mcp_servers?.length || 0,
          hasFileSearch: !!connectedServices.services.file_search,
          hasWebSearch: !!connectedServices.services.web_search,
          totalServices: Object.keys(connectedServices.services).length
        });
        return jsonString;
      }

      // console.log('No connected services found for chat:', chatId);
      return null;
    } catch (error) {
      console.error('Error generating connected services JSON:', error);
      return null;
    }
  }

  function createNewChat() {
    // console.log('Creating new chat');

    // Use default template if available
    const initialPrompt = defaultPromptTemplate.value?.content || '';

    const newChat: Chat = {
      id: botStore.apiKey,
      title: '',
      timestamp: currentTime(),
      messages: [
        {
          id: '1',
          // content: 'Hello! Start creating your AI prompt here.',
          content: '',
          timestamp: currentTime(),
          sender: 'assistant'
        }
      ],
      lastMessage: 'Hello!'
    };

    // If there's a default template, initialize the story with it
    if (initialPrompt) {
      const initialVersion = createPromptVersion(initialPrompt);
      newChat.story = {
        content: initialPrompt,
        updatedAt: new Date(),
        versions: [initialVersion],
        activeVersionId: initialVersion.id
      };
    }

    chats.value.unshift(newChat);
    setActiveChat(newChat.id);
    // console.log('New chat created with ID:', newChat.id);
    return newChat;
  }

  // Function to clear all chat history except the active chat
  function clearAllChatsExceptActive() {
    if (!activeChat.value) return;

    // Keep only the active chat
    const currentActiveChat = chats.value.find(c => c.id === activeChat.value);
    if (currentActiveChat) {
      chats.value = [currentActiveChat];
      // console.log('Cleared all chats except active one');
      saveToTemplate();
      return true;
    }
    return false;
  }

  // Function to clear version history for a specific chat
  async function clearVersionHistory(chatId: string) {
    try{
      const chat = chats.value.find(c => c.id === chatId);
      if (!chat?.story) return false;

      const versionIds = chat.story.versions.map(v => v.version_id);
      const response = await botsifyApi.deleteAiPromptVersion(versionIds);

      if (!response.success) {
        window.$toast.error(`❌ ${response.message}`);
        console.error('❌ Error saving bot templates:', response.message);
        // Error message will be shown in red text in the chat
        // Toast notifications disabled as requested
        return false;
      }

      window.$toast.success(`${response.message}`);
      
      // Keep only the active version
      const activeVersion = chat.story.versions.find(v => v.isActive);
      if (activeVersion) {
        chat.story.versions = [activeVersion];
        // console.log(`Cleared version history for chat ${chatId}`);
        return true;
      }
      return false;
    } catch (error) {
        console.error('❌ Error saving to storage:', error);
        window.$toast.error(`❌ ${error}`);
        // Error message will be shown in red text in the chat
        // Toast notifications disabled as requested
        return false;
     }
  }

  // Function to clear message history for a specific chat
  async function clearChatMessages() {
    try {

      const response = await botsifyApi.clearAgentConversion({apikey: botStore.apiKey});
      
      if (!response.success) {
        console.error('❌ Error clearing conversation:', response.message);
        window.$toast.error(`❌ ${response.message}`);
         return false;
       }

      window.$toast.success(`${response.message}`);
      chats.value[0].messages = [];

       
      return true;
      } catch (error) {
       console.error('❌ Error clearing convsation from storage:', error);
       return false;
     }
  }


  // Initialize with a default chat if none exists
  if (chats.value.length === 0) {
    // console.log('No chats found, creating default chat');
    createNewChat();
  }

  // Initialize default template if none exists
  if (globalPromptTemplates.value.length === 0) {
    // console.log('Creating default prompt template');
    createGlobalPromptTemplate(
      'Default Bot Prompt',
      `You are an AI prompt designer. I will describe how the chatbot should behave, and you will build a structured chatbot flow step-by-step.

Format your responses as clean, numbered flows like this:

1. When user says "Hi", bot replies with:
   - Text: "Hello! How can I help you today?"
   - Quick replies: ["Get Started", "Learn More"]

2. When user clicks "Get Started", bot replies with:
   - Text: "Great! Let's begin..."

Keep flows organized, clear, and user-friendly.`,
      true
    );
  }

  return {
    chats,
    activeChat,
    currentChat,
    isTyping,
    isAIPromptGenerating,
    globalPromptTemplates,
    defaultPromptTemplate,
    activeAiPromptVersion,
    doInputDisable,
    createAiPromptVersionName,
    setActiveChat,
    addMessage,
    updateMessage,
    createNewChat,
    updateStory,
    updateActivePromptVersionId,
    revertToPromptVersion,
    deletePromptVersion,
    createGlobalPromptTemplate,
    updateGlobalPromptTemplate,
    deleteGlobalPromptTemplate,
    loadFromStorage,
    saveToTemplate,
    clearAllChatsExceptActive,
    clearVersionHistory,
    clearChatMessages,
    removeLastMessage,
    getConnectedServicesJson
  };
});