import { defineStore } from 'pinia';
import { ref } from 'vue';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

export const useOpenAIStore = defineStore('openai', () => {
  // Try to get API key from environment variables first, then fallback to localStorage
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('Environment API key available:', !!envApiKey);
  
  const apiKey = ref<string | null>(
    envApiKey || localStorage.getItem('openai_api_key')
  );
  const client = ref<OpenAI | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);
  const rateLimited = ref(false);

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
      client.value = null;
      error.value = 'No API key provided. Please add your OpenAI API key in Settings.';
      return;
    }

    try {
      console.log('Initializing OpenAI client');
      client.value = new OpenAI({
        apiKey: apiKey.value,
        dangerouslyAllowBrowser: true
      });
      connected.value = true;
      error.value = null;
      console.log('OpenAI client initialized successfully');
    } catch (e: any) {
      console.error('Failed to initialize OpenAI client:', e);
      error.value = `Failed to initialize OpenAI client: ${e.message || 'Unknown error'}`;
      connected.value = false;
      client.value = null;
    }
  }

  async function streamChat(messages: { role: string, content: string }[]) {
    if (!client.value) {
      const errorMsg = 'OpenAI client not initialized';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('Preparing to stream chat with messages:', messages);
      
      // Add system message if not present
      if (!messages.some(msg => msg.role === 'system')) {
        messages.unshift({
          role: 'system',
          content: `You are an AI prompt designer. I will describe how the chatbot should behave, and you will build a structured chatbot flow step-by-step. The flow should support all types of messages, including:
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

Every time I send a message, update the prompt and show the **entire chatbot flow** in a clean, numbered format like this:

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
24. When user sends "keyword", "word", or "key", show default response (data incomplete in input).`
        });
      }

      // Map messages to the correct format expected by OpenAI
      const formattedMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 
              msg.role === 'assistant' ? 'assistant' : 'system',
        content: msg.content
      }));

      console.log('Sending request to OpenAI API with formatted messages:', formattedMessages);
      
      try {
        const stream = await client.value.chat.completions.create({
          model: 'gpt-4.1',
          messages: formattedMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        });
  
        console.log('Stream received from OpenAI API:', typeof stream, stream !== null);
        
        // Verify the stream is valid
        if (!stream) {
          throw new Error('Received null or undefined stream from OpenAI API');
        }
        
        return stream;
      } catch (apiError: any) {
        console.error('API call error:', apiError);
        console.error('API error details:', JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)));
        throw apiError;
      }
    } catch (e: any) {
      console.error('Error in streamChat:', e);
      
      if (e.status === 429) {
        rateLimited.value = true;
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (e.status === 401) {
        error.value = 'Invalid API key. Please check your OpenAI API key.';
        connected.value = false;
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      }
      
      error.value = e.message || 'Unknown error occurred';
      throw e;
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
    streamChat
  };
});