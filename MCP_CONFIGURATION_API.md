# MCP Configuration API

## Overview

The MCP configuration system sends essential information to the `mcp/configuration` API endpoint, including serverName, real API key, availableTools, and prompt. The API key is now properly extracted from the MCP connection data.

## API Endpoint

**POST** `https://botsify.com/api/mcp/configuration`

## Data Structure

The `sendMCPConfigurationJSON` method sends the following data:

### Fields
- `serverName`: Human-readable name of the MCP server
- `apiKey`: Real API key for authentication (extracted from MCP connection)
- `availableTools`: Array of tools that are available from the MCP server
- `prompt`: MCP calling prompt with usage instructions

## Implementation Fix

The issue where `apiKey` was going null has been resolved. The fix was in `src/stores/mcpStore.ts` where the `mcpConfigurationData` object was missing the `apiKey` field:

```typescript
// Fixed: Added apiKey to mcpConfigurationData
const mcpConfigurationData = {
  serverId: server.id,
  serverName: server.name,
  serverIcon: server.icon || '🔗',
  category: server.category,
  connectionUrl: server.connectionUrl,
  authMethod: server.authMethod || 'none',
  hasAuthentication: server.apiKeyRequired,
  apiKey: newConnection.apiKey, // ✅ Now includes the real API key
  features: server.features,
  systemPrompt: newConnection.systemPrompt,
  connectedAt: newConnection.connectedAt,
  validationData: validationResult.data
};
```

## Example Configuration Data

```json
{
  "serverName": "GitHub",
  "apiKey": "ghp_1234567890abcdef1234567890abcdef12345678",
  "availableTools": [
    "Repository access",
    "Issue management", 
    "Pull requests",
    "Code search"
  ],
  "prompt": "You have access to GitHub, a Development MCP server with the following capabilities:\n\nAVAILABLE TOOLS:\n- Repository access\n- Issue management\n- Pull requests\n- Code search\n\nUSAGE INSTRUCTIONS:\n1. Use this MCP server when users request operations related to: Repository access, Issue management, Pull requests, Code search\n2. Authentication: Required (api_key)\n3. Connection URL: https://api.github.com\n\nMCP CALLING GUIDELINES:\n- Always verify the server is available before making requests\n- Handle authentication errors gracefully\n- Provide clear feedback about server operations\n- Use appropriate error handling for network issues\n\nWhen calling this MCP server:\n1. Explain what operation you're performing\n2. Show the results clearly to the user\n3. Handle any errors with helpful messages\n4. Suggest alternatives if the operation fails\n\nServer Status: Connected and ready for use."
}
```

## Implementation

The `sendMCPConfigurationJSON` method in `src/services/botsifyApi.ts`:

```typescript
async sendMCPConfigurationJSON(mcpData: any): Promise<BotsifyResponse> {
  // Send the essential MCP configuration data with real API key
  const simplifiedMCPData = {
    serverName: mcpData.serverName,
    apiKey: mcpData.apiKey || null, // Now receives real API key from mcpStore
    availableTools: mcpData.features || [],
    prompt: mcpData.systemPrompt || this.generateDefaultMCPPrompt(mcpData)
  };
  
  const response = await axios.post(`${BOTSIFY_BASE_URL}/mcp/configuration`, simplifiedMCPData, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });
  
  return { success: true, message: 'MCP configuration sent successfully', data: response.data };
}
```

## Usage

The configuration is automatically sent when:
1. A new MCP server connection is established (with real API key)
2. The `sendMCPConfigurationJSON()` method is called directly
3. The test method `testEnhancedMCPConfiguration()` is used

## Security Note

The real API key is now properly sent to the endpoint. The API key comes from the user's MCP connection and is securely passed through the system. Ensure the API endpoint handles this sensitive information securely.

## Fix Status

✅ **RESOLVED**: API key no longer goes null - it now properly passes the real MCP API key from the connection data.

This configuration sends exactly the requested information: serverName, real API key, availableTools, and prompt. 