# Configuration Tool Implementation

## Overview

The `configure_chatbot` tool function has been implemented in the OpenAI store to handle chatbot configuration updates. This tool allows the AI to detect user requests for configuration changes and automatically trigger API calls to update chatbot settings.

## Features

### Supported Configuration Types

The tool supports the following configuration changes:

1. **Language Changes**
   - Keys: `change_language`, `language`
   - Example: "Change the chatbot language to Arabic"
   - API Endpoint: `https://api.botsify.com/chatbot/language`

2. **Logo Updates**
   - Keys: `change_logo`, `logo`
   - Example: "Update the chatbot logo to https://example.com/logo.png"
   - API Endpoint: `https://api.botsify.com/chatbot/logo`

3. **Color Scheme/Theme**
   - Keys: `change_color`, `color_scheme`, `theme`
   - Example: "Change the chatbot colors to blue"
   - API Endpoint: `https://api.botsify.com/chatbot/theme`

4. **Chatbot Status Toggle**
   - Keys: `toggle_chatbot`, `chatbot_status`
   - Example: "Turn off the chatbot"
   - API Endpoint: `https://api.botsify.com/chatbot/status`

5. **Welcome Message**
   - Keys: `update_welcome_message`, `welcome_message`
   - Example: "Change the welcome message to 'Hello! How can I help?'"
   - API Endpoint: `https://api.botsify.com/chatbot/welcome`

6. **Chatbot Name**
   - Keys: `change_name`, `chatbot_name`
   - Example: "Rename the chatbot to 'Assistant'"
   - API Endpoint: `https://api.botsify.com/chatbot/name`

### Multiple Configuration Support

The tool supports multiple configuration changes in a single request:
```
"Change the chatbot language to French and also turn off the chatbot"
```

This will result in two API calls:
1. Language change to French
2. Status change to off

## Implementation Details

### Tool Function Definition

```typescript
const configureChatbotTool = {
  type: "function" as const,
  function: {
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
                description: "Configuration property to be updated"
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
  }
};
```

### API Request Handling

Each configuration type is handled with a switch case that:
1. Determines the appropriate API endpoint
2. Formats the request data
3. Makes the API call with proper authentication
4. Returns success/failure response

### Response Processing

The tool processes responses and provides user-friendly feedback:
- ✅ Success messages for completed configurations
- ❌ Error messages for failed configurations
- Detailed information about what was changed

## Usage Examples

### Single Configuration
User: "I want to change the language of the chatbot to Arabic"

AI Response: Uses `configure_chatbot` tool with:
```json
{
  "tasks": [
    {
      "key": "change_language",
      "value": "arabic"
    }
  ]
}
```

### Multiple Configurations
User: "Change the chatbot language to French and also update the welcome message to 'Bonjour!'"

AI Response: Uses `configure_chatbot` tool with:
```json
{
  "tasks": [
    {
      "key": "change_language", 
      "value": "french"
    },
    {
      "key": "update_welcome_message",
      "value": "Bonjour!"
    }
  ]
}
```

## Testing

A `ConfigurationTester` component has been added to the Settings page with predefined test cases:

1. Change Language to Arabic
2. Change Logo
3. Update Color Scheme  
4. Turn Off Chatbot
5. Multiple Changes

## Files Modified

1. `src/stores/openaiStore.ts` - Added tool definition and processing logic
2. `src/stores/chatStore.ts` - Updated to handle tool calls in AI responses
3. `src/components/chat/ConfigurationTester.vue` - Test component
4. `src/views/SettingsView.vue` - Added tester to settings

## Error Handling

The implementation includes comprehensive error handling:
- Invalid tool call arguments
- API request failures
- Network errors
- Unknown configuration keys
- JSON parsing errors

All errors are displayed to the user with descriptive messages.

## Future Enhancements

Potential improvements:
1. Add more configuration types (timezone, currency, etc.)
2. Implement configuration validation
3. Add configuration history/rollback
4. Support for bulk configuration imports
5. Real-time configuration preview 