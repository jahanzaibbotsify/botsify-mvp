# DeepSeek API Integration

## Overview

The Botsify MVP application has been updated to use DeepSeek API instead of OpenAI for language model interactions. This change provides a more cost-effective and accessible solution for AI-powered chat functionality.

## Key Changes

### 1. **New DeepSeek Store** (`src/stores/deepseekStore.ts`)
- Replaces the OpenAI store with a custom DeepSeek implementation
- Uses the DeepSeek API endpoint: `https://deepseek.saasbakers.com/api/generate`
- Model: `deepseek-coder-v2:latest`
- No API key required - the service is available by default

### 2. **Updated Components**
All components that previously used OpenAI have been updated:
- `src/stores/chatStore.ts` - Main chat functionality
- `src/components/chat/ApiErrorNotification.vue` - Error handling
- `src/components/chat/SystemMessageSender.vue` - System message testing
- `src/components/chat/ApiKeyInput.vue` - Configuration input
- `src/components/settings/ApiKeyTester.vue` - Connection testing
- `src/components/settings/ApiKeySettings.vue` - Settings management

### 3. **API Integration**
The DeepSeek integration includes:
- **Streaming Support**: Real-time response streaming
- **Tool Calling**: Configuration tools for chatbot management
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: Built-in rate limit detection

## API Request Format

### Request Structure
```javascript
{
  "model": "deepseek-coder-v2:latest",
  "prompt": "System: [system_instructions]\n\nuser: [user_message]\nassistant: ",
  "stream": true,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 2000
  }
}
```

### Response Format
The API returns streaming JSON responses:
```javascript
{
  "response": "text_chunk",
  "done": false
}
```

## Benefits of DeepSeek Integration

1. **Cost-Effective**: No API key or paid subscription required
2. **Code-Optimized**: DeepSeek Coder is specifically designed for code generation and analysis
3. **Open Source**: Built on open-source models
4. **Reliable**: Dedicated endpoint with good uptime
5. **Privacy**: No data retention or usage tracking

## Configuration

### Default Settings
- **Endpoint**: `https://deepseek.saasbakers.com/api/generate`
- **Model**: `deepseek-coder-v2:latest`
- **Temperature**: 0.7
- **Max Tokens**: 2000
- **Streaming**: Enabled

### Optional Configuration
Users can optionally configure custom endpoints through the settings panel, though the default configuration works out of the box.

## Migration from OpenAI

### What Changed
- Store: `useOpenAIStore()` → `useDeepSeekStore()`
- No API key management required
- Same interface and functionality maintained
- All existing features preserved

### Backward Compatibility
The interface remains the same, so existing code continues to work without modification. The main changes are internal implementation details.

## Testing

To test the DeepSeek integration:

1. **Start the application**: `npm run dev`
2. **Open a chat**: Navigate to the chat interface
3. **Send a message**: The system will automatically use DeepSeek
4. **Test connection**: Use the "Test DeepSeek Connection" button in settings

## Error Handling

The integration includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Malformed responses
- Timeout scenarios

## Future Enhancements

Potential improvements for the DeepSeek integration:
- Custom model selection
- Advanced parameter tuning
- Response caching
- Offline fallback modes
- Multi-provider support

## Support

If you encounter any issues with the DeepSeek integration:
1. Check the browser console for error messages
2. Test the connection using the built-in tester
3. Verify network connectivity
4. Check the DeepSeek service status

The DeepSeek API integration provides a robust, cost-effective alternative to OpenAI while maintaining all the functionality users expect from the chat system. 