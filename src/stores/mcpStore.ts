import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MCPServer, MCPConnection, CustomMCPServerForm } from '../types/mcp';
import { botsifyApi } from '../services/botsifyApi';

export const useMCPStore = defineStore('mcp', () => {
  // All MCP servers (popular + custom)
  const servers = ref<MCPServer[]>([
    // {
    //   id: 'github',
    //   name: 'GitHub',
    //   description: 'Access GitHub repositories, issues, and pull requests',
    //   category: 'Development',
    //   icon: '🐙',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'GitHub Personal Access Token',
    //   features: ['Repository access', 'Issue management', 'Pull requests', 'Code search'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'notion',
    //   name: 'Notion',
    //   description: 'Read and write to Notion databases and pages',
    //   category: 'Productivity',
    //   icon: '📝',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Notion Integration Token',
    //   features: ['Database queries', 'Page creation', 'Content management', 'Team collaboration'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'slack',
    //   name: 'Slack',
    //   description: 'Send messages and interact with Slack workspaces',
    //   category: 'Communication',
    //   icon: '💬',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'bearer_token',
    //   authLabel: 'Slack Bot Token',
    //   features: ['Send messages', 'Channel management', 'User lookup', 'File sharing'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'google-drive',
    //   name: 'Google Drive',
    //   description: 'Access and manage Google Drive files and folders',
    //   category: 'Storage',
    //   icon: '📁',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'oauth',
    //   authLabel: 'Google OAuth Token',
    //   features: ['File access', 'Folder management', 'Document creation', 'Sharing controls'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'postgres',
    //   name: 'PostgreSQL',
    //   description: 'Execute SQL queries on PostgreSQL databases',
    //   category: 'Database',
    //   icon: '🐘',
    //   apiKeyRequired: false,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'none',
    //   authLabel: '',
    //   features: ['Query execution', 'Schema inspection', 'Data analysis', 'Performance monitoring'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'filesystem',
    //   name: 'File System',
    //   description: 'Read and write files on the local file system',
    //   category: 'System',
    //   icon: '💾',
    //   apiKeyRequired: false,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'none',
    //   authLabel: '',
    //   features: ['File operations', 'Directory listing', 'Text processing', 'Search capabilities'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'web-search',
    //   name: 'Web Search',
    //   description: 'Search the web and retrieve real-time information',
    //   category: 'Research',
    //   icon: '🔍',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Search API Key',
    //   features: ['Web search', 'Real-time data', 'News updates', 'Content analysis'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'weather',
    //   name: 'Weather API',
    //   description: 'Get current weather and forecasts for any location',
    //   category: 'Data',
    //   icon: '🌤️',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: false,
    //   authMethod: 'api_key',
    //   authLabel: 'Weather API Key',
    //   features: ['Current weather', 'Forecasts', 'Historical data', 'Weather alerts'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'calendar',
    //   name: 'Google Calendar',
    //   description: 'Manage calendar events and schedules',
    //   category: 'Productivity',
    //   icon: '📅',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: false,
    //   authMethod: 'oauth',
    //   authLabel: 'Google OAuth Token',
    //   features: ['Event management', 'Schedule viewing', 'Meeting creation', 'Reminder setup'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'email',
    //   name: 'Email (SMTP)',
    //   description: 'Send emails through SMTP servers',
    //   category: 'Communication',
    //   icon: '📧',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: false,
    //   authMethod: 'basic_auth',
    //   authLabel: 'SMTP Username/Password',
    //   features: ['Email sending', 'Template support', 'Attachment handling', 'Delivery tracking'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'zapier',
    //   name: 'Zapier',
    //   description: 'Automate workflows and connect apps',
    //   category: 'Automation',
    //   icon: '⚡',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Zapier API Key',
    //   features: ['Workflow automation', 'App integrations', 'Trigger management', 'Data transformation'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
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
      features: ['Payment processing', 'Subscription management', 'Customer billing', 'Financial reporting'],
      connection: {
        isConnected: false,
        mcp_id: null,
        apiKey: null,
        systemPrompt: null
      }
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Manage e-commerce store and products (custom domain)',
      category: 'E-commerce',
      icon: '🛒',
      apiKeyRequired: false,
      botIdRequired: true,
      isPopular: true,
      authMethod: 'none',
      authLabel: 'Shopify Access Token',
      features: ['Product management', 'Order processing', 'Customer data', 'Store analytics'],
      connection: {
        isConnected: false,
        mcp_id: null,
        apiKey: null,
        systemPrompt: null
      }
    },
    // {
    //   id: 'paypal',
    //   name: 'PayPal',
    //   description: 'Manage PayPal payments and transactions',
    //   category: 'Payments',
    //   icon: '💰',
    //   apiKeyRequired: true,
    //   botIdRequired: false,
    //   isPopular: true,
    //   authMethod: 'oauth',
    //   authLabel: 'PayPal OAuth Token',
    //   features: ['Payment processing', 'Transaction history', 'Refund management', 'Merchant services'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'square',
    //   name: 'Square',
    //   description: 'Handle Square payments and point-of-sale',
    //   category: 'Payments',
    //   icon: '🟦',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'bearer_token',
    //   authLabel: 'Square Access Token',
    //   features: ['POS transactions', 'Inventory management', 'Customer management', 'Analytics'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // },
    // {
    //   id: 'plaid',
    //   name: 'Plaid',
    //   description: 'Access bank account and financial data',
    //   category: 'Financial',
    //   icon: '🏦',
    //   apiKeyRequired: true,
    //   botIdRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Plaid Client ID & Secret',
    //   features: ['Account linking', 'Transaction data', 'Balance checks', 'Financial insights'],
    //   connection: {
    //     isConnected: false,
    //     mcp_id: null,
    //     apiKey: null,
    //     systemPrompt: null
    //   }
    // }
  ]);

  // Load connections and custom servers from localStorage
  const loadFromStorage = () => {
    // Load connections
    const storedConnections = localStorage.getItem('mcp_connections');
    if (storedConnections) {
      try {
        const parsed = JSON.parse(storedConnections);
        servers.value.forEach((server: MCPServer) => {
          const connection = parsed.find((conn: MCPConnection) => conn.serverId === server.id);
          if (connection) {
            server.connection = {
              isConnected: true,
              mcp_id: connection.mcp_id,
              apiKey: connection.apiKey,
              systemPrompt: connection.systemPrompt
            };
          }
        });
      } catch (error) {
        console.error('Failed to load MCP connections:', error);
      }
    }

    // Load custom servers
    const storedCustomServers = localStorage.getItem('mcp_custom_servers');
    if (storedCustomServers) {
      try {
        const parsedCustomServers = JSON.parse(storedCustomServers);
        parsedCustomServers.forEach((server: MCPServer) => {
          servers.value.push({
            id: server.id,
            name: server.name,
            description: server.description,
            category: server.category,
            icon: server.icon,
            apiKeyRequired: server.apiKeyRequired,
            botIdRequired: server.botIdRequired,
            isPopular: server.isPopular,
            authMethod: server.authMethod,
            authLabel: server.authLabel,
            features: server.features,
            connection: {
              isConnected: false,
              mcp_id: null,
              apiKey: null,
              systemPrompt: null
            }
          });
        });
      } catch (error) {
        console.error('Failed to load custom MCP servers:', error);
      }
    }
  };

  // Save data to localStorage
  const saveToStorage = () => {
    const connections = servers.value.filter((server: MCPServer) => server.connection.isConnected === true).map(server => ({
      serverId: server.id,
      mcp_id: server.connection.mcp_id,
      apiKey: server.connection.apiKey,
      systemPrompt: server.connection.systemPrompt
    }));
    localStorage.setItem('mcp_connections', JSON.stringify(connections));
    const customServers = servers.value.filter(server => !server.isPopular).map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      category: server.category,
      icon: server.icon,
      apiKeyRequired: server.apiKeyRequired,
      botIdRequired: server.botIdRequired,
      isPopular: server.isPopular,
      authMethod: server.authMethod,
      authLabel: server.authLabel,
      features: server.features
    }));
    localStorage.setItem('mcp_custom_servers', JSON.stringify(customServers));
  };


  // Get connected servers
  const connectedServers = computed(() => {
    return servers.value.filter(config => config.connection.isConnected === true);
  });

  // Add a custom MCP server
  const addCustomServer = (formData: CustomMCPServerForm): MCPServer => {
    const customServer = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      icon: formData.icon || '🔗',
      apiKeyRequired: formData.authMethod !== 'none',
      botIdRequired: true,
      isPopular: false,
      authMethod: formData.authMethod,
      authLabel: formData.authLabel,
      features: formData.features,
      connection: {
        isConnected: false,
        mcp_id: null,
        apiKey: null,
        systemPrompt: null
      }
    };

    servers.value.push(customServer);
    saveToStorage();
    return customServer;
  };

  // Update a custom MCP server
  const updateCustomServer = (serverId: string, formData: Partial<CustomMCPServerForm>) => {
    const serverIndex = servers.value.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return false;

    const server = servers.value[serverIndex];
    if (formData.name !== undefined) server.name = formData.name;
    if (formData.description !== undefined) server.description = formData.description;
    if (formData.category !== undefined) server.category = formData.category;
    if (formData.icon !== undefined) server.icon = formData.icon;
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
  const deleteCustomServer = (serverId: string) => {
    const serverIndex = servers.value.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return false;

    servers.value.splice(serverIndex, 1);
    saveToStorage();
    return true;
  };

  // Connect to an MCP server
  const connectServer = async (serverId: string, apiKey?: string, systemPrompt?: string, customParams?: any): Promise<boolean> => {
    const server = servers.value.find(s => s.id === serverId);
    if (!server) throw new Error('Server not found');

    // Shopify-specific validation
    if (serverId === 'shopify') {
      if (!customParams?.domain?.trim()) {
        throw new Error('Shopify domain is required');
      }
      if (customParams?.authMethod !== 'none' && !apiKey?.trim()) {
        throw new Error('Authentication is required for this method');
      }
    } else {
      // Standard validation for other servers
    if (server.apiKeyRequired && !apiKey?.trim()) {
      throw new Error(`${server.authLabel || 'Authentication'} is required for this server`);
    }

    // Validate connection URL for custom servers
    if (server.isCustom && !server.connectionUrl?.trim()) {
      throw new Error('Connection URL is required for custom servers');
    }
    }


    try {
      // Generate a unique mcp_id if not provided
      const mcp_id = server.connection.mcp_id || '';

      // Step 1: Validate the MCP connection with the API
      let connectionUrl = server.connectionUrl;
      if (serverId === 'shopify' && customParams?.domain) {
        // For Shopify, construct the URL from the domain
        connectionUrl = `https://${customParams.domain}/api/mcp`;
      }
      
      const validationResult = await botsifyApi.validateMCPConnection(
        server.id,
        server.name,
        apiKey?.trim(),
        connectionUrl
      );

      if (!validationResult.success) {
        throw new Error(validationResult.message);
      }
     try {
       server.connection = {
        isConnected: true,
         mcp_id: mcp_id || null,
         apiKey: apiKey?.trim() || null,
         systemPrompt: systemPrompt || generateDefaultSystemPrompt(server)
       };
       // For Shopify, add custom parameters to the server object
       let serverConfig: any = { ...server };
       if (serverId === 'shopify' && customParams) {
         serverConfig = {
           ...server,
           domain: customParams.domain,
           authMethod: customParams.authMethod
         };
       }
       
       const configResult = mcp_id ? await botsifyApi.updateMCPConfiguration(mcp_id, serverConfig) : await botsifyApi.sendMCPConfigurationJSON(serverConfig);
        if (configResult.success) {
          server.connection.mcp_id = configResult.data.id;
          saveToStorage();
        } else {
          console.warn('⚠️ Failed to send MCP configuration to API:', configResult.message);
          // Don't fail the connection if API call fails, just log the warning
        }
      } catch (apiError: any) {
        console.warn('⚠️ API call failed but connection is established:', apiError.message);
        // Connection is still successful even if API call fails
      }

      return true;
    } catch (error: any) {
      console.error('❌ Failed to connect to MCP server:', error);
      saveToStorage();
      
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
  const disconnectServer = async (serverId: string) => {
    const server = servers.value.find(s => s.id === serverId);
    if (!server) return;

    try {
      // If mcp_id exists, try to disconnect
      if (server.connection?.mcp_id) {
        await botsifyApi.disconnectMCP(server.connection.mcp_id);
        server.connection.mcp_id = null;
      }
      server.connection.isConnected = false;
      saveToStorage();
    } catch (error) {
      console.error('Failed to disconnect from MCP server:', error);
    }
  };

  // Generate default system prompt for a server
  const generateDefaultSystemPrompt = (server: MCPServer) => {
    if (server.isCustom) {
      return `You are an AI assistant with access to ${server.name} through MCP. You can:
${server.features.map(feature => `- ${feature}`).join('\n')}

Connection URL: ${server.connectionUrl}
Authentication: ${server.authMethod === 'none' ? 'No authentication required' : server.authLabel}

Use this integration to help users with ${server.description.toLowerCase()}.`;
    }

    const prompts = {
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

    return (prompts as Record<string, string>)[server.id] || `You are an AI assistant with access to ${server.name} through MCP. Use this integration to help users with ${server.description.toLowerCase()}.`;
  };

  // Get system prompt for connected servers (combined)
  const getCombinedSystemPrompt = () => {
    const connectedPrompts = connectedServers.value
      .map(config => config.connection?.systemPrompt)
      .filter(Boolean);

    if (connectedPrompts.length === 0) {
      return '';
    }

    const basePrompt = `You are an AI assistant with access to multiple services through MCP (Model Context Protocol) servers. 

**AVAILABLE MCP SERVICES:**
${connectedServers.value.map(config => 
  `- **${config.name}** (${config.category}): ${config.description}
    Features: ${config.features.join(', ')}
    ${config.connectionUrl ? `URL: ${config.connectionUrl}` : ''}
    Authentication: ${config.authMethod || 'api_key'} ${config.connection?.apiKey ? '✓ Configured' : '✗ Not configured'}`
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

  const getConnectedMCPs = async () => {
    try {
      let unmatchedServers: string[] = [];
      localStorage.removeItem('mcp_connections');

      const response = await botsifyApi.getAllConnectedMCPs();
      console.log(response, "connected mcp")
      if (response.success && Array.isArray(response.data)) {
        response.data.forEach((mcp) => {
          const server = servers.value.find(s => s.id === mcp.setting.server_label);
          if (server) {
            // Update the server's connection state
            server.connection = {
              isConnected: true,
              mcp_id: mcp.id,
              apiKey: mcp.setting.headers?.Authorization?.split(' ')[1] || '',
              systemPrompt: mcp.setting.system_prompt || generateDefaultSystemPrompt(server),
            };
            
            // Save to storage
            saveToStorage();
          } else {
            unmatchedServers.push(mcp.setting.server_label);
          }
        });

        if (unmatchedServers.length > 0) {
    return {
            success: false,
            message: `Unmatched servers: ${unmatchedServers.join(', ')}`
          };
        }
        
        return {
          success: true,
          message: 'Successfully loaded connected MCP servers'
        };
      }

      return {
        success: false,
        message: 'Failed to load connected MCP servers'
      };
    } catch (error: any) {
      console.error('❌ Error getting connected MCPs:', error);
      return {
        success: false,
        message: error.message || 'Failed to get connected MCP servers'
      };
    }
  }

  // Initialize store
  loadFromStorage();

  return {
    servers,
    connectedServers,
    addCustomServer,
    updateCustomServer,
    deleteCustomServer,
    connectServer,
    disconnectServer,
    getCombinedSystemPrompt,
    generateDefaultSystemPrompt,
    getConnectedMCPs
  };
}); 