import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MCPServer, MCPConnection, MCPServerConfig, CustomMCPServerForm, MCPConfiguration, MCPConfigurationFile } from '../types';
import { botsifyApi } from '../services/botsifyApi';

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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
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
      botIdRequired: true,
      isPopular: false,
      authMethod: 'basic_auth',
      authLabel: 'SMTP Username/Password',
      features: ['Email sending', 'Template support', 'Attachment handling', 'Delivery tracking']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows and connect apps',
      category: 'Automation',
      icon: '⚡',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Zapier API Key',
      features: ['Workflow automation', 'App integrations', 'Trigger management', 'Data transformation']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage billing',
      category: 'Payments',
      icon: '💳',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Stripe Secret Key',
      features: ['Payment processing', 'Subscription management', 'Customer billing', 'Financial reporting']
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Manage e-commerce store and products',
      category: 'E-commerce',
      icon: '🛒',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Shopify API Key',
      features: ['Product management', 'Order processing', 'Customer data', 'Store analytics']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Manage PayPal payments and transactions',
      category: 'Payments',
      icon: '💰',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'oauth',
      authLabel: 'PayPal OAuth Token',
      features: ['Payment processing', 'Transaction history', 'Refund management', 'Merchant services']
    },
    {
      id: 'square',
      name: 'Square',
      description: 'Handle Square payments and point-of-sale',
      category: 'Payments',
      icon: '🟦',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'bearer_token',
      authLabel: 'Square Access Token',
      features: ['POS transactions', 'Inventory management', 'Customer management', 'Analytics']
    },
    {
      id: 'plaid',
      name: 'Plaid',
      description: 'Access bank account and financial data',
      category: 'Financial',
      icon: '🏦',
      apiKeyRequired: true,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Plaid Client ID & Secret',
      features: ['Account linking', 'Transaction data', 'Balance checks', 'Financial insights']
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
      botIdRequired: true,
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
  const connectServer = async (serverId: string, botId: number, apiKey?: string, systemPrompt?: string): Promise<boolean> => {
    const server = allServers.value.find(s => s.id === serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    // Validate API key if required
    if (server.apiKeyRequired && !apiKey?.trim()) {
      throw new Error(`${server.authLabel || 'Authentication'} is required for this server`);
    }

    // Validate API key if required
    if (server.botIdRequired && botId <= 0) {
      throw new Error("Bot id required for server connection");
    }

    // Validate connection URL for custom servers
    if (server.isCustom && !server.connectionUrl?.trim()) {
      throw new Error('Connection URL is required for custom servers');
    }

    try {
      console.log(`🔗 Attempting to connect to ${server.name}...`);

      // Step 1: Validate the MCP connection with the API
      const validationResult = await botsifyApi.validateMCPConnection(
        server.id,
        server.name,
        apiKey?.trim(),
        server.connectionUrl
      );

      if (!validationResult.success) {
        console.error('❌ MCP connection validation failed:', validationResult.message);
        throw new Error(validationResult.message);
      }

      console.log('✅ MCP connection validated successfully');

      // Step 2: Remove existing connection if any
      connections.value = connections.value.filter(conn => conn.serverId !== serverId);

      // Step 3: Create new connection
      const newConnection: MCPConnection = {
        id: `${serverId}_${Date.now()}`,
        serverId,
        serverName: server.name,
        apiKey: apiKey?.trim(),
        botId: botId,
        isConnected: true,
        connectedAt: new Date(),
        connectionUrl: server.connectionUrl,
        authMethod: server.authMethod,
        systemPrompt: systemPrompt?.trim() || generateDefaultSystemPrompt(server)
      };

      connections.value.push(newConnection);
      saveToStorage();

      console.log('💾 Connection saved locally');
      let configError = null; // use to get errors from config result

      // Step 4: Send MCP configuration JSON to the API
      try {
        const mcpConfigurationData = {
          serverId: server.id,
          serverName: server.name,
          serverIcon: server.icon || '🔗',
          category: server.category,
          connectionUrl: server.connectionUrl,
          authMethod: server.authMethod || 'none',
          hasAuthentication: server.apiKeyRequired,
          apiKey: newConnection.apiKey,
          botId: newConnection.botId,
          features: server.features,
          systemPrompt: newConnection.systemPrompt,
          connectedAt: newConnection.connectedAt,
          validationData: validationResult.data
        };

        const configResult = await botsifyApi.sendMCPConfigurationJSON(mcpConfigurationData);
        
        if (configResult.success) {
          console.log('✅ MCP configuration sent to API successfully');
        } else {
          console.warn('⚠️ Failed to send MCP configuration to API:', configResult.message);
          // Don't fail the connection if API call fails, just log the warning
          configError = configResult;
        }
      } catch (apiError: any) {
        console.warn('⚠️ API call failed but connection is established:', apiError.message);
        // Connection is still successful even if API call fails
      }

      if (configError) {
          throw new Error(configError.message);
      }

      return true;
    } catch (error: any) {
      console.error('❌ Failed to connect to MCP server:', error);
      
      // Provide specific error messages for better user experience
      if (error.message.includes('bot id')){
        throw new Error(error.message);
      }else if (error.message.includes('Invalid API key')) {
        throw new Error('Invalid API key provided. Please check your authentication credentials and try again.');
      } else if (error.message.includes('not found') || error.message.includes('invalid')) {
        throw new Error('MCP server not found or connection URL is invalid. Please verify your configuration.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Connection timeout. Please check your network connection and try again.');
      }
      
      throw new Error(error.message || 'Failed to connect to the server. Please check your configuration and try again.');
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

Use your web search access to provide users with current, accurate information from the internet.`,

      zapier: `You are an AI assistant with access to Zapier through MCP. You can:
- Automate workflows between different apps
- Create and manage Zaps (automated workflows)
- Connect various services and APIs
- Handle data transformation and routing

Use your Zapier access to help users automate repetitive tasks and connect their favorite apps.`,

      stripe: `You are an AI assistant with access to Stripe through MCP. You can:
- Process payments and manage transactions
- Handle subscription billing and management
- Access customer and payment data
- Generate financial reports and analytics

Use your Stripe access to help users manage their payment processing and billing operations.`,

      shopify: `You are an AI assistant with access to Shopify through MCP. You can:
- Manage products, inventory, and collections
- Process and track orders
- Handle customer data and support
- Analyze store performance and sales

Use your Shopify access to help users manage their e-commerce store operations.`,

      paypal: `You are an AI assistant with access to PayPal through MCP. You can:
- Process PayPal payments and transactions
- Manage refunds and disputes
- Access transaction history and reports
- Handle merchant account operations

Use your PayPal access to help users manage their PayPal payment processing and merchant services.`,

      square: `You are an AI assistant with access to Square through MCP. You can:
- Process point-of-sale transactions
- Manage inventory and product catalogs
- Handle customer management and loyalty
- Generate sales analytics and reports

Use your Square access to help users manage their point-of-sale operations and business analytics.`,

      plaid: `You are an AI assistant with access to Plaid through MCP. You can:
- Connect and verify bank accounts
- Access transaction data and balances
- Retrieve financial account information
- Provide financial insights and analysis

Use your Plaid access to help users integrate banking data and financial services into their applications.`
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

    const basePrompt = `You are an AI assistant with access to multiple services through MCP (Model Context Protocol) servers. 

**AVAILABLE MCP SERVICES:**
${connectedServers.value.map(config => 
  `- **${config.server.name}** (${config.server.category}): ${config.server.description}
    Features: ${config.server.features.join(', ')}
    ${config.server.connectionUrl ? `URL: ${config.server.connectionUrl}` : ''}
    Authentication: ${config.server.authMethod || 'api_key'} ${config.connection?.apiKey ? '✓ Configured' : '✗ Not configured'}`
).join('\n')}

**MCP INTEGRATION GUIDELINES:**
1. When users ask about your capabilities, reference the specific MCP servers you have access to
2. For data operations, explain which MCP server would handle the request (e.g., PostgreSQL for database queries, GitHub for code operations)
3. If authentication is missing for a required service, inform the user that authentication needs to be configured
4. Provide context about what each connected service can do based on its features
5. Use the MCP configuration data to give accurate, contextual responses

**INDIVIDUAL SERVER PROMPTS:**
${connectedPrompts.join('\n\n---\n\n')}

Remember: You have access to ${connectedServers.value.length} MCP server${connectedServers.value.length === 1 ? '' : 's'}. Always consider the available services when formulating responses and suggest appropriate MCP servers for specific tasks.`;

    return basePrompt;
  };

  // Generate MCP configuration JSON
  const generateMCPConfiguration = (botId: string, name?: string, description?: string): MCPConfiguration => {
    const now = new Date();
    
    return {
      id: `mcp_config_${Date.now()}`,
      botId,
      name: name || `MCP Configuration for Bot ${botId}`,
      description: description || `Automatically generated MCP configuration with ${connectedServers.value.length} connected servers`,
      createdAt: now,
      updatedAt: now,
      connectedServers: connectedServers.value.map(config => ({
        serverId: config.server.id,
        serverName: config.server.name,
        serverIcon: config.server.icon || '🔗',
        category: config.server.category,
        connectionUrl: config.server.connectionUrl,
        authMethod: config.server.authMethod || 'none',
        hasAuthentication: config.server.apiKeyRequired,
        features: config.server.features,
        systemPrompt: config.connection?.systemPrompt || '',
        connectedAt: config.connection?.connectedAt || now
      })),
      combinedSystemPrompt: '', // Remove circular reference - generate separately when needed
      version: '1.0.0'
    };
  };

  // Create complete MCP configuration file
  const createMCPConfigurationFile = (botId: string, name?: string, description?: string): MCPConfigurationFile => {
    const configuration = generateMCPConfiguration(botId, name, description);
    const categories = [...new Set(configuration.connectedServers.map(s => s.category))];
    
    return {
      configuration,
      metadata: {
        generatedAt: new Date(),
        version: '1.0.0',
        serverCount: configuration.connectedServers.length,
        categories
      }
    };
  };

  // Save MCP configuration to API
  const saveMCPConfigurationToAPI = async (botId: string, name?: string, description?: string) => {
    try {
      if (connectedServers.value.length === 0) {
        throw new Error('No MCP servers are connected. Please connect at least one server before saving configuration.');
      }

      console.log('Generating MCP configuration for bot:', botId);
      const configFile = createMCPConfigurationFile(botId, name, description);
      
      console.log('Generated MCP configuration:', configFile);
      
      // Save to API
      const response = await botsifyApi.saveMCPConfiguration(botId, configFile);
      
      if (response.success) {
        console.log('✅ MCP configuration saved successfully to API');
        
        // Save the configuration reference locally
        const configRef = {
          botId,
          configurationId: configFile.configuration.id,
          lastSaved: new Date(),
          serverCount: configFile.metadata.serverCount
        };
        
        const existingConfigs = JSON.parse(localStorage.getItem('mcp_bot_configurations') || '[]');
        const updatedConfigs = existingConfigs.filter((c: any) => c.botId !== botId);
        updatedConfigs.push(configRef);
        localStorage.setItem('mcp_bot_configurations', JSON.stringify(updatedConfigs));
        
        return {
          success: true,
          message: 'MCP configuration saved successfully',
          configuration: configFile
        };
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error saving MCP configuration:', error);
      return {
        success: false,
        message: error.message || 'Failed to save MCP configuration',
        error
      };
    }
  };

  // Load MCP configuration from API
  const loadMCPConfigurationFromAPI = async (botId: string) => {
    try {
      console.log('Loading MCP configuration for bot:', botId);
      
      const response = await botsifyApi.getMCPConfiguration(botId);
      
      if (response.success && response.data) {
        console.log('✅ MCP configuration loaded successfully from API');
        return {
          success: true,
          message: 'MCP configuration loaded successfully',
          configuration: response.data
        };
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('❌ Error loading MCP configuration:', error);
      return {
        success: false,
        message: error.message || 'Failed to load MCP configuration',
        error
      };
    }
  };

  // Get enhanced system prompt with MCP configuration reference
  const getEnhancedSystemPrompt = (botId?: string): string => {
    const basePrompt = getCombinedSystemPrompt();
    
    if (!basePrompt) {
      return '';
    }

    const configInfo = botId ? `\n\n---MCP_CONFIGURATION---\nBot ID: ${botId}\nConfiguration includes ${connectedServers.value.length} connected MCP servers.\nLast updated: ${new Date().toISOString()}\n---END_MCP_CONFIGURATION---` : '';

    return basePrompt + configInfo;
  };

  // Download MCP configuration as JSON file
  const downloadMCPConfiguration = (botId: string, name?: string, description?: string) => {
    try {
      const configFile = createMCPConfigurationFile(botId, name, description);
      
      const dataStr = JSON.stringify(configFile, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `mcp-config-${botId}-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('✅ MCP configuration downloaded as JSON file');
      return true;
    } catch (error) {
      console.error('❌ Error downloading MCP configuration:', error);
      return false;
    }
  };

  // Get saved bot configurations
  const getSavedBotConfigurations = () => {
    try {
      const configs = JSON.parse(localStorage.getItem('mcp_bot_configurations') || '[]');
      return configs.map((config: any) => ({
        ...config,
        lastSaved: new Date(config.lastSaved)
      }));
    } catch {
      return [];
    }
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
    generateDefaultSystemPrompt,
    generateMCPConfiguration,
    createMCPConfigurationFile,
    saveMCPConfigurationToAPI,
    loadMCPConfigurationFromAPI,
    getEnhancedSystemPrompt,
    downloadMCPConfiguration,
    getSavedBotConfigurations
  };
}); 