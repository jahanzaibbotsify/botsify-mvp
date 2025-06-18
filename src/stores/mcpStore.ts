import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MCPServer, MCPConnection, MCPServerConfig, CustomMCPServerForm } from '../types';

export const useMCPStore = defineStore('mcp', () => {
  // Popular MCP servers data
  const popularServers = ref<MCPServer[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Access GitHub repositories, issues, and pull requests',
      category: 'Development',
      icon: '🐙',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'GitHub Personal Access Token',
      features: ['Repository access', 'Issue management', 'Pull requests', 'Code search']
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Read and write to Notion databases and pages',
      category: 'Productivity',
      icon: '📝',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Notion Integration Token',
      features: ['Database queries', 'Page creation', 'Content management', 'Team collaboration']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and interact with Slack workspaces',
      category: 'Communication',
      icon: '💬',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'bearer_token',
      authLabel: 'Slack Bot Token',
      features: ['Send messages', 'Channel management', 'User lookup', 'File sharing']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Access and manage Google Drive files and folders',
      category: 'Storage',
      icon: '📁',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'oauth',
      authLabel: 'Google OAuth Token',
      features: ['File access', 'Folder management', 'Document creation', 'Sharing controls']
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      description: 'Execute SQL queries on PostgreSQL databases',
      category: 'Database',
      icon: '🐘',
      apiKeyRequired: false,
      isPopular: true,
      authMethod: 'none',
      authLabel: '',
      features: ['Query execution', 'Schema inspection', 'Data analysis', 'Performance monitoring']
    },
    {
      id: 'filesystem',
      name: 'File System',
      description: 'Read and write files on the local file system',
      category: 'System',
      icon: '💾',
      apiKeyRequired: false,
      isPopular: true,
      authMethod: 'none',
      authLabel: '',
      features: ['File operations', 'Directory listing', 'Text processing', 'Search capabilities']
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web and retrieve real-time information',
      category: 'Research',
      icon: '🔍',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Search API Key',
      features: ['Web search', 'Real-time data', 'News updates', 'Content analysis']
    },
    {
      id: 'weather',
      name: 'Weather API',
      description: 'Get current weather and forecasts for any location',
      category: 'Data',
      icon: '🌤️',
      apiKeyRequired: true,
      isPopular: false,
      authMethod: 'api_key',
      authLabel: 'Weather API Key',
      features: ['Current weather', 'Forecasts', 'Historical data', 'Weather alerts']
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Manage calendar events and schedules',
      category: 'Productivity',
      icon: '📅',
      apiKeyRequired: true,
      isPopular: false,
      authMethod: 'oauth',
      authLabel: 'Google OAuth Token',
      features: ['Event management', 'Schedule viewing', 'Meeting creation', 'Reminder setup']
    },
    {
      id: 'email',
      name: 'Email (SMTP)',
      description: 'Send emails through SMTP servers',
      category: 'Communication',
      icon: '📧',
      apiKeyRequired: true,
      isPopular: false,
      authMethod: 'basic_auth',
      authLabel: 'SMTP Username/Password',
      features: ['Email sending', 'Template support', 'Attachment handling', 'Delivery tracking']
    }
  ]);

  // Custom servers added by users
  const customServers = ref<MCPServer[]>([]);

  // Connected servers
  const connections = ref<MCPConnection[]>([]);

  // Load connections and custom servers from localStorage
  const loadFromStorage = () => {
    // Load connections
    const storedConnections = localStorage.getItem('mcp_connections');
    if (storedConnections) {
      try {
        const parsed = JSON.parse(storedConnections);
        connections.value = parsed.map((conn: any) => ({
          ...conn,
          connectedAt: conn.connectedAt ? new Date(conn.connectedAt) : undefined,
          lastUsed: conn.lastUsed ? new Date(conn.lastUsed) : undefined
        }));
      } catch (error) {
        console.error('Failed to load MCP connections:', error);
      }
    }

    // Load custom servers
    const storedCustomServers = localStorage.getItem('mcp_custom_servers');
    if (storedCustomServers) {
      try {
        customServers.value = JSON.parse(storedCustomServers);
      } catch (error) {
        console.error('Failed to load custom MCP servers:', error);
      }
    }
  };

  // Save data to localStorage
  const saveToStorage = () => {
    localStorage.setItem('mcp_connections', JSON.stringify(connections.value));
    localStorage.setItem('mcp_custom_servers', JSON.stringify(customServers.value));
  };

  // Get all servers (popular + custom)
  const allServers = computed(() => [...popularServers.value, ...customServers.value]);

  // Get server configurations (server + connection info)
  const serverConfigs = computed<MCPServerConfig[]>(() => {
    return allServers.value.map(server => ({
      server,
      connection: connections.value.find(conn => conn.serverId === server.id)
    }));
  });

  // Get connected servers
  const connectedServers = computed(() => {
    return serverConfigs.value.filter(config => config.connection?.isConnected);
  });

  // Get popular servers
  const popularServerConfigs = computed(() => {
    return serverConfigs.value.filter(config => config.server.isPopular);
  });

  // Add a custom MCP server
  const addCustomServer = (formData: CustomMCPServerForm): MCPServer => {
    const customServer: MCPServer = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      icon: formData.icon || '🔗',
      connectionUrl: formData.connectionUrl,
      apiKeyRequired: formData.authMethod !== 'none',
      authMethod: formData.authMethod,
      authLabel: formData.authLabel,
      features: formData.features,
      isCustom: true,
      isPopular: false
    };

    customServers.value.push(customServer);
    saveToStorage();
    return customServer;
  };

  // Update a custom MCP server
  const updateCustomServer = (serverId: string, formData: Partial<CustomMCPServerForm>): boolean => {
    const serverIndex = customServers.value.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return false;

    const server = customServers.value[serverIndex];
    if (formData.name !== undefined) server.name = formData.name;
    if (formData.description !== undefined) server.description = formData.description;
    if (formData.category !== undefined) server.category = formData.category;
    if (formData.icon !== undefined) server.icon = formData.icon;
    if (formData.connectionUrl !== undefined) server.connectionUrl = formData.connectionUrl;
    if (formData.authMethod !== undefined) {
      server.authMethod = formData.authMethod;
      server.apiKeyRequired = formData.authMethod !== 'none';
    }
    if (formData.authLabel !== undefined) server.authLabel = formData.authLabel;
    if (formData.features !== undefined) server.features = formData.features;

    saveToStorage();
    return true;
  };

  // Delete a custom MCP server
  const deleteCustomServer = (serverId: string): boolean => {
    const serverIndex = customServers.value.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return false;

    // Also remove any connections to this server
    connections.value = connections.value.filter(conn => conn.serverId !== serverId);
    
    customServers.value.splice(serverIndex, 1);
    saveToStorage();
    return true;
  };

  // Connect to an MCP server
  const connectServer = async (serverId: string, apiKey?: string, systemPrompt?: string): Promise<boolean> => {
    const server = allServers.value.find(s => s.id === serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    // Validate API key if required
    if (server.apiKeyRequired && !apiKey?.trim()) {
      throw new Error(`${server.authLabel || 'Authentication'} is required for this server`);
    }

    // Validate connection URL for custom servers
    if (server.isCustom && !server.connectionUrl?.trim()) {
      throw new Error('Connection URL is required for custom servers');
    }

    try {
      // Simulate connection process (in real implementation, this would connect to the actual MCP server)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove existing connection if any
      connections.value = connections.value.filter(conn => conn.serverId !== serverId);

      // Add new connection
      const newConnection: MCPConnection = {
        id: `${serverId}_${Date.now()}`,
        serverId,
        serverName: server.name,
        apiKey: apiKey?.trim(),
        isConnected: true,
        connectedAt: new Date(),
        connectionUrl: server.connectionUrl,
        authMethod: server.authMethod,
        systemPrompt: systemPrompt?.trim() || generateDefaultSystemPrompt(server)
      };

      connections.value.push(newConnection);
      saveToStorage();

      return true;
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw new Error('Failed to connect to the server. Please check your configuration and try again.');
    }
  };

  // Disconnect from an MCP server
  const disconnectServer = (serverId: string) => {
    connections.value = connections.value.filter(conn => conn.serverId !== serverId);
    saveToStorage();
  };

  // Update system prompt for a connected server
  const updateSystemPrompt = (serverId: string, systemPrompt: string) => {
    const connection = connections.value.find(conn => conn.serverId === serverId);
    if (connection) {
      connection.systemPrompt = systemPrompt.trim();
      connection.lastUsed = new Date();
      saveToStorage();
    }
  };

  // Generate default system prompt for a server
  const generateDefaultSystemPrompt = (server: MCPServer): string => {
    if (server.isCustom) {
      return `You are an AI assistant with access to ${server.name} through MCP. You can:
${server.features.map(feature => `- ${feature}`).join('\n')}

Connection URL: ${server.connectionUrl}
Authentication: ${server.authMethod === 'none' ? 'No authentication required' : server.authLabel}

Use this integration to help users with ${server.description.toLowerCase()}.`;
    }

    const prompts: Record<string, string> = {
      github: `You are an AI assistant with access to GitHub through MCP. You can:
- Search repositories and code
- Read issues and pull requests
- Access repository information
- Help with code analysis and development tasks

When users ask about code, repositories, or development topics, use your GitHub access to provide accurate, up-to-date information.`,

      notion: `You are an AI assistant with access to Notion through MCP. You can:
- Query Notion databases
- Read and create pages
- Manage content and documentation
- Help with knowledge management

When users need to work with Notion content, use your access to provide helpful information and perform requested actions.`,

      slack: `You are an AI assistant with access to Slack through MCP. You can:
- Send messages to channels and users
- Read channel information
- Manage workspace interactions
- Help with team communication

Use your Slack access to facilitate communication and provide team collaboration support.`,

      'google-drive': `You are an AI assistant with access to Google Drive through MCP. You can:
- Access and manage files and folders
- Create and edit documents
- Handle file sharing and permissions
- Help with document organization

Use your Google Drive access to help users manage their files and documents effectively.`,

      postgres: `You are an AI assistant with access to PostgreSQL databases through MCP. You can:
- Execute SQL queries
- Analyze database schemas
- Help with data analysis and reporting
- Provide database optimization suggestions

Use your database access to help users work with their data effectively and safely.`,

      filesystem: `You are an AI assistant with access to the local file system through MCP. You can:
- Read and write files
- Navigate directory structures
- Process text and data files
- Help with file organization

Use your file system access to help users manage their local files and data.`,

      'web-search': `You are an AI assistant with web search capabilities through MCP. You can:
- Search the web for current information
- Retrieve real-time data and news
- Analyze web content
- Provide up-to-date research

Use your web search access to provide users with current, accurate information from the internet.`
    };

    return prompts[server.id] || `You are an AI assistant with access to ${server.name} through MCP. Use this integration to help users with ${server.description.toLowerCase()}.`;
  };

  // Get system prompt for connected servers (combined)
  const getCombinedSystemPrompt = (): string => {
    const connectedPrompts = connectedServers.value
      .map(config => config.connection?.systemPrompt)
      .filter(Boolean);

    if (connectedPrompts.length === 0) {
      return '';
    }

    const basePrompt = `You are an AI assistant with access to multiple services through MCP (Model Context Protocol). You have the following capabilities:

${connectedServers.value.map((config, index) => 
  `${index + 1}. **${config.server.name}**: ${config.server.description}`
).join('\n')}

Specific instructions for each service:

${connectedPrompts.map((prompt, index) => 
  `## ${connectedServers.value[index].server.name}\n${prompt}`
).join('\n\n')}

When responding to user requests, consider which of your available services would be most helpful and use them appropriately. Always be clear about which service you're using and what information you're retrieving.`;

    return basePrompt;
  };

  // Initialize store
  loadFromStorage();

  return {
    popularServers,
    customServers,
    allServers,
    connections,
    serverConfigs,
    connectedServers,
    popularServerConfigs,
    addCustomServer,
    updateCustomServer,
    deleteCustomServer,
    connectServer,
    disconnectServer,
    updateSystemPrompt,
    getCombinedSystemPrompt,
    generateDefaultSystemPrompt
  };
}); 