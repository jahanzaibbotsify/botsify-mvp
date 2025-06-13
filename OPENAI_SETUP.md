# OpenAI SDK Setup & Troubleshooting Guide

## Overview

This Vue 3 application uses OpenAI SDK v5.3.0 with the **Responses API** (not Completions API) to provide AI-powered chatbot functionality. The setup includes specific fixes for the "Cannot read private member from an object whose class did not declare it" error.

## ⚠️ Security Warning

**IMPORTANT**: This application uses `dangerouslyAllowBrowser: true` which exposes your API key in the browser. This is **NOT recommended for production**. Consider implementing a backend proxy for production use.

### Recommended Production Architecture:
```
Frontend → Your Backend API → OpenAI API
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Verify SDK Version

Ensure you're using OpenAI SDK v5.3.0 or later:

```bash
npm list openai
```

If you need to update:

```bash
npm install openai@^5.3.0
```

### 3. TypeScript Configuration

The project uses strict TypeScript mode. Ensure your `tsconfig.app.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

## Architecture Changes

### Fixed: Private Member Access Error

The original error occurred because the OpenAI client was wrapped in a Vue reactive `ref()`, which caused issues with private class members.

**Before (Problematic):**
```typescript
const client = ref<OpenAI | null>(null);
// This caused private member access issues
```

**After (Fixed):**
```typescript
// OpenAI client instance - NOT reactive to avoid private member access issues
let openaiClient: OpenAI | null = null;
```

### Key Changes Made:

1. **Non-reactive Client**: Moved OpenAI client outside Pinia's reactive state
2. **Explicit Types**: Added proper TypeScript typing for async iterables
3. **Responses API**: Uses `client.responses.create()` instead of `client.completions.create()`
4. **Error Handling**: Enhanced debugging and error reporting
5. **Vite Optimization**: Configured Vite to properly bundle the OpenAI SDK

## API Usage

### Responses API (Correct)

```typescript
const stream = await openaiClient.responses.create({
  model: 'gpt-4o',
  input: inputText,
  instructions: instructions,
  tools: [configureChatbotTool],
  tool_choice: "auto",
  stream: true,
  temperature: 0.7,
  max_output_tokens: 2000
});
```

### ❌ Don't Use Completions API

```typescript
// DON'T USE THIS - This is the old API
const stream = await openaiClient.completions.create({...});
```

## Debugging

### Built-in Debug Tools

The application includes comprehensive debugging tools available in development mode:

```javascript
// In browser console (development mode only):
OpenAIDebugger.runFullDiagnostic('your-api-key');
OpenAIDebugger.logSDKInfo();
OpenAIDebugger.testConnection('your-api-key');
OpenAIDebugger.clearCache();
```

### Manual Debugging Steps

1. **Check SDK Version**:
   ```bash
   npm list openai
   ```

2. **Clear Browser Cache**:
   ```javascript
   OpenAIDebugger.clearCache();
   // Then refresh the page
   ```

3. **Verify Client Initialization**:
   ```javascript
   // Check console for these logs:
   // ✅ OpenAI client initialized successfully
   // Client type: object
   // Client has responses: true
   ```

4. **Test Non-streaming First**:
   ```javascript
   // The app automatically tests non-streaming if streaming fails
   // Check console for "Non-streaming call successful"
   ```

## Common Issues & Solutions

### Issue: "Cannot read private member"
**Solution**: Ensure you're using the updated store with non-reactive client.

### Issue: "responses is not a function"
**Solution**: 
- Verify OpenAI SDK version is 5.3.0+
- Clear browser cache
- Check that you're using `responses.create()` not `completions.create()`

### Issue: "dangerouslyAllowBrowser" warnings
**Solution**: This is expected. For production, implement a backend proxy.

### Issue: Rate limiting (429 errors)
**Solution**: 
- Check your OpenAI usage limits
- Implement exponential backoff
- Consider upgrading your OpenAI plan

### Issue: Invalid API key (401 errors)
**Solution**:
- Verify your API key is correct
- Check that the key has sufficient permissions
- Ensure the key isn't expired

## Development vs Production

### Development Setup
- Uses `dangerouslyAllowBrowser: true`
- API key in environment variables
- Debug tools enabled
- Detailed console logging

### Production Recommendations
1. **Backend Proxy**: Create an API endpoint that forwards requests to OpenAI
2. **Environment Security**: Never expose API keys in frontend code
3. **Rate Limiting**: Implement your own rate limiting
4. **Error Handling**: Provide user-friendly error messages
5. **Monitoring**: Log API usage and errors

### Example Backend Proxy (Node.js/Express)

```javascript
app.post('/api/openai/responses', async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // Server-side only
    });
    
    const stream = await openai.responses.create({
      ...req.body,
      stream: true
    });
    
    // Forward stream to client
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Quick Test Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Browser Console Tests

```javascript
// Test SDK availability
OpenAIDebugger.logSDKInfo();

// Test connection (replace with your API key)
OpenAIDebugger.testConnection('sk-...');

// Full diagnostic
OpenAIDebugger.runFullDiagnostic('sk-...');
```

## Support

If you encounter issues:

1. Run the full diagnostic: `OpenAIDebugger.runFullDiagnostic()`
2. Check the browser console for detailed error messages
3. Verify your OpenAI SDK version and API key
4. Clear browser cache and try again
5. Test with a simple non-streaming request first

## Version Compatibility

- **OpenAI SDK**: v5.3.0+
- **Vue**: v3.4.38+
- **TypeScript**: v5.5.3+
- **Vite**: v5.4.2+
- **Node.js**: v16.0.0+ (for development)

---

**Remember**: Always prioritize security in production environments. The current setup is optimized for development and testing. 