# MCP (Model Context Protocol) Integration

This document explains the MCP server integration feature implemented in the Botsify MVP chat application.

## Overview

The MCP integration allows users to connect external services and tools to enhance the AI's capabilities. When MCP servers are connected, their system prompts are automatically integrated into the AI's context, enabling the AI to use external tools and data sources. Users can connect to popular pre-configured servers or add their own custom MCP servers.

## Features

### 1. MCP Connection Bar
- Located above the text area in the chat interface
- Shows the number of connected MCP servers
- Displays icons of connected servers (up to 3, with a "+N more" indicator)
- "Connect MCP" button to open the connection modal

### 2. MCP Connection Modal
- **Server Selection**: Browse popular MCP servers or view all available servers
- **Connected Servers**: View and manage already connected servers
- **Custom Server Management**: Add, edit, and delete custom MCP servers
- **API Key Input**: Secure input for servers requiring authentication
- **System Prompt Configuration**: Customize or use default system prompts
- **Connection Management**: Connect, update, or disconnect servers

### 3. Custom Server Configuration
- **Add Custom Servers**: Define your own MCP servers with custom URLs
- **Authentication Methods**: Support for multiple auth types (API Key, Bearer Token, Basic Auth, OAuth, None)
- **Custom Labels**: Define custom authentication field labels
- **Feature Management**: Add and manage server capabilities
- **Categories**: Organize servers by category
- **Icons**: Customize server icons with emojis

### 4. Popular MCP Servers Included

#### Development
- **GitHub** 🐙: Access repositories, issues, and pull requests (API Key)
- **PostgreSQL** 🐘: Execute SQL queries and analyze databases (No Auth)

#### Productivity
- **Notion** 📝: Read and write to databases and pages (API Key)
- **Google Calendar** 📅: Manage events and schedules (OAuth)

#### Communication
- **Slack** 💬: Send messages and interact with workspaces (Bearer Token)
- **Email (SMTP)** 📧: Send emails through SMTP servers (Basic Auth)

#### Storage & Files
- **Google Drive** 📁: Access and manage files and folders (OAuth)
- **File System** 💾: Read and write local files (No Auth)

#### Research & Data
- **Web Search** 🔍: Search the web for real-time information (API Key)
- **Weather API** 🌤️: Get weather data and forecasts (API Key)

## Implementation Details

### File Structure
```
src/
├── stores/
│   └── mcpStore.ts          # MCP server management
├── components/chat/
│   ├── MCPConnectionModal.vue  # Connection modal UI
│   └── MessageInput.vue        # Updated with MCP bar
└── types/
    └── index.ts             # MCP-related TypeScript types
```

### Key Components

#### MCPStore (`src/stores/mcpStore.ts`)
- Manages MCP server connections and configurations
- Stores connection data and custom servers in localStorage
- Generates system prompts for connected servers
- Provides CRUD operations for custom servers
- Provides computed properties for UI reactivity

#### MCPConnectionModal (`src/components/chat/MCPConnectionModal.vue`)
- Full-featured modal for server connection management
- Server browsing with categories and features
- Custom server form with validation
- API key input with dynamic labels based on auth method
- System prompt customization
- Connection status management
- Edit and delete functionality for custom servers

#### Updated MessageInput (`src/components/chat/MessageInput.vue`)
- Added MCP connection bar above text area
- Shows connection status and server icons
- Integrates with chat system for system prompt injection

### Custom Server Types

#### Authentication Methods
- **None**: No authentication required
- **API Key**: Standard API key authentication
- **Bearer Token**: OAuth Bearer token authentication
- **Basic Auth**: Username/password authentication
- **OAuth**: OAuth token authentication

#### Custom Server Form Fields
- **Server Name**: Display name for the server
- **Description**: What the server does
- **Category**: Organizational category
- **Icon**: Emoji icon for visual identification
- **Connection URL**: MCP server endpoint
- **Authentication Method**: How to authenticate
- **Authentication Label**: Custom label for auth field
- **Features**: List of server capabilities

### System Prompt Integration

When MCP servers are connected, their system prompts are automatically combined and injected into the AI conversation context. This happens in the `chatStore.ts` file within the `handleAIResponse` function:

```typescript
// Add MCP system prompt if there are connected servers
const mcpSystemPrompt = mcpStore.getCombinedSystemPrompt();
const messages = mcpSystemPrompt 
  ? [{ role: 'system', content: mcpSystemPrompt }, ...userMessages]
  : userMessages;
```

Custom servers get automatically generated system prompts based on their configuration:

```typescript
return `You are an AI assistant with access to ${server.name} through MCP. You can:
${server.features.map(feature => `- ${feature}`).join('\n')}

Connection URL: ${server.connectionUrl}
Authentication: ${server.authMethod === 'none' ? 'No authentication required' : server.authLabel}

Use this integration to help users with ${server.description.toLowerCase()}.`;
```

## Usage Instructions

### Connecting to Popular Servers

1. **Open the MCP Modal**: Click the "Connect MCP" button in the connection bar above the text area
2. **Select a Server**: Choose from popular servers or browse all available servers
3. **Enter Credentials**: If required, provide the authentication credentials for the selected server
4. **Configure System Prompt**: Customize the system prompt or use the default
5. **Connect**: Click "Connect" to establish the connection

### Adding Custom Servers

1. **Open the MCP Modal**: Click the "Connect MCP" button
2. **Add Custom Server**: Click the "Add Custom" button in the available servers section
3. **Fill Server Details**:
   - **Server Name**: Enter a descriptive name
   - **Description**: Describe what the server does
   - **Category**: Select or use "Custom"
   - **Icon**: Choose an emoji (optional)
   - **Connection URL**: Enter the MCP server endpoint URL
   - **Authentication Method**: Select the appropriate auth method
   - **Authentication Label**: Customize the auth field label (if auth required)
   - **Features**: Add capabilities that this server provides
4. **Save**: Click "Add Server" to save the custom server

### Managing Custom Servers

1. **Edit Server**: Click the edit icon on any custom server to modify its configuration
2. **Delete Server**: Click the delete icon to remove a custom server (with confirmation)
3. **Connect/Disconnect**: Use the same process as popular servers

### Managing Connected Servers

1. **View Connected Servers**: Connected servers appear in the "Connected Servers" section
2. **Update Connection**: Click on a connected server to modify its credentials or system prompt
3. **Disconnect**: Use the "Disconnect" button to remove a server connection

### Using MCP Capabilities

Once connected, the AI will automatically have access to the capabilities provided by the MCP servers. The system prompts inform the AI about:
- Available tools and functions
- How to use each service
- Best practices for integration
- Specific instructions for each server type

## Example Custom Server Configurations

### REST API Server
```
Name: My REST API
Description: Custom REST API for data retrieval
URL: https://api.mycompany.com/mcp
Auth Method: API Key
Auth Label: API Token
Features: ["Data retrieval", "User management", "Report generation"]
```

### Database Server
```
Name: Company Database
Description: Internal PostgreSQL database access
URL: https://db.mycompany.com:5432/mcp
Auth Method: Basic Auth
Auth Label: Database Credentials
Features: ["Query execution", "Data analysis", "Schema inspection"]
```

### Internal Tool
```
Name: Internal Tool
Description: Company-specific automation tool
URL: https://tools.mycompany.com/mcp-endpoint
Auth Method: Bearer Token
Auth Label: Service Token
Features: ["Task automation", "Report generation", "Data processing"]
```

## Security Considerations

- API keys and credentials are stored securely in localStorage
- Passwords are input using password-type fields
- Connection validation prevents invalid configurations
- Each server connection is isolated and manageable
- Custom server URLs are validated for proper format
- Confirmation dialogs prevent accidental deletion

## Future Enhancements

- Real MCP protocol implementation (currently simulated)
- Server health monitoring and status indicators
- Advanced prompt templating with variables
- Bulk server management operations
- Import/export of server configurations
- Server marketplace or registry integration
- Connection testing and validation
- Rate limiting and usage monitoring

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check API key validity, URL format, and network connectivity
2. **Server Not Responding**: Verify server availability and endpoint configuration
3. **Permission Denied**: Ensure API key has necessary permissions for the selected auth method
4. **Invalid System Prompt**: Check prompt syntax and formatting
5. **Custom Server Not Saving**: Ensure all required fields are filled and URL is valid

### Debug Information

The application logs detailed information about MCP connections and system prompt integration. Check the browser console for:
- Connection attempts and results
- System prompt combinations
- Server communication status
- Custom server CRUD operations
- Error messages and stack traces
- Authentication method validation

### Custom Server Validation

When adding custom servers, ensure:
- Server name is unique and descriptive
- Connection URL is a valid HTTP/HTTPS endpoint
- Authentication method matches server requirements
- Features list accurately describes capabilities
- System prompts are properly formatted

## Example System Prompts

### GitHub Integration
```
You are an AI assistant with access to GitHub through MCP. You can:
- Search repositories and code
- Read issues and pull requests
- Access repository information
- Help with code analysis and development tasks

When users ask about code, repositories, or development topics, use your GitHub access to provide accurate, up-to-date information.
```

### Notion Integration
```
You are an AI assistant with access to Notion through MCP. You can:
- Query Notion databases
- Read and create pages
- Manage content and documentation
- Help with knowledge management

When users need to work with Notion content, use your access to provide helpful information and perform requested actions.
``` 