import { defineStore } from 'pinia';
import {ref, onMounted} from 'vue';
import type { MCPServer } from '../types/mcp';
import { botsifyApi } from '../services/botsifyApi';

export const useMCPStore = defineStore('mcp', () => {
  const servers = ref<MCPServer[]>([
    // {
    //   id: 'github',
    //   name: 'GitHub',
    //   description: 'Access GitHub repositories, issues, and pull requests',
    //   icon: 'github.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'GitHub Personal Access Token',
    // },
    // {
    //   id: 'slack',
    //   name: 'Slack',
    //   description: 'Send messages and interact with Slack workspaces',
    //   icon: 'slack.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'bearer_token',
    //   authLabel: 'Slack Bot Token',
    //   server_url: 'https://slack.com/api',
    // },
    // {
    //   id: 'calendar',
    //   name: 'Google Calendar',
    //   description: 'Manage calendar events and schedules',
    //   icon: 'google-calendar.svg',
    //   apiKeyRequired: true,
    //   isPopular: false,
    //   authMethod: 'oauth',
    //   authLabel: 'Google OAuth Token',
    //   server_url: 'https://www.googleapis.com/calendar/v3',
    // },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage billing',
      icon: 'stripe.svg',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'api_key',
      authLabel: 'Stripe Secret Key',
      server_url: 'https://mcp.stripe.com',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Manage e-commerce store and products (custom domain)',
      icon: 'shopify.svg',
      apiKeyRequired: false,
      isPopular: true,
      authMethod: 'none',
      authLabel: 'Shopify Access Token',
      server_url: '/api/mcp',
    },
    // {
    //   id: 'paypal',
    //   name: 'PayPal',
    //   description: 'Manage PayPal payments and transactions',
    //   icon: 'paypal.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'oauth',
    //   authLabel: 'PayPal OAuth Token',
    //   server_url: 'https://mcp.paypal.com/sse',
    // },
    // {
    //   id: 'gmail',
    //   name: 'Gmail',
    //   description: 'Send and receive emails with Gmail integration',
    //   icon: 'google-gmail.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'oauth',
    //   authLabel: 'Gmail OAuth Token',
    // },
    // {
    //   id: 'zendesk',
    //   name: 'Zendesk',
    //   description: 'Manage support tickets and customer interactions',
    //   icon: 'zendesk.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Zendesk API Key',
    // },
    // {
    //   id: 'hubspot',
    //   name: 'HubSpot',
    //   description: 'Manage CRM contacts, deals, and marketing',
    //   icon: 'hubspot.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'HubSpot API Key',
    //   server_url: 'https://app.hubspot.com/mcp/v1/http',
    // },
    // {
    //   id: 'zoho',
    //   name: 'Zoho',
    //   description: 'Access Zoho CRM and business tools',
    //   icon: 'zoho.svg',
    //   apiKeyRequired: true,
    //   isPopular: true,
    //   authMethod: 'api_key',
    //   authLabel: 'Zoho API Key',
    // },
    {
      id: 'google-sheet',
      name: 'Google Sheet',
      description: 'Read and write to Google Sheets',
      icon: 'google-sheet.svg',
      apiKeyRequired: true,
      isPopular: true,
      authMethod: 'oauth',
      authLabel: 'Google OAuth Token'
    }
  ]);
  const connectedServers = ref([]);

  onMounted(async () => {
    const response = await botsifyApi.getAllConnectedMCPs();
    connectedServers.value = response.data;
    connectedServers.value.forEach((connectedServer: any) => {
      if (connectedServer.setting.is_custom) {
        servers.value.push({
          id: connectedServer.id,
          name: connectedServer.setting.server_label,
          description: connectedServer.setting.server_description,
          allowed_tools: connectedServer.setting.allowed_tools,
          server_url: connectedServer.setting.server_url,
          icon: 'custom.svg',
          isCustom: connectedServer.setting.is_custom,
          connectionId: connectedServer.id,
        })
      } else {
        const serverIndex = servers.value.findIndex(s => s.id === connectedServer.setting.server_label);
        if (serverIndex !== -1) {
          servers.value[serverIndex].connectionId = connectedServer.id;
        }
      }
    })
  })

  /**
   * Generate a default system prompt for a given MCP server
   * @param server
   */
  const generateDefaultSystemPrompt = (server: any) => {
    if (server.is_custom) {
      return `You are an AI assistant with access to ${server.server_label} through MCP. You can:
      ${ server.allowed_tools?.length ? server.allowed_tools.map((tool: string) => `- ${tool}`).join('\n') : ''}
      
      Use this integration to help users with ${server.server_description.toLowerCase()}.`;
    }

    const prompts = {
      github: `
      You are an AI assistant with access to GitHub through MCP. You can:
        - Search repositories and code
        - Read issues and pull requests
        - Access repository information
        - Help with code analysis and development tasks
        
      When users ask about code, repositories, or development topics, use your GitHub access to provide accurate, up-to-date information.
      `,

      notion: `
      You are an AI assistant with access to Notion through MCP. You can:
      - Query Notion databases
      - Read and create pages
      - Manage content and documentation
      - Help with knowledge management
      
      When users need to work with Notion content, use your access to provide helpful information and perform requested actions.
      `,

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
      
      Use your Google Drive access to help users manage their files and documents effectively.
      `,

      postgres: `You are an AI assistant with access to PostgreSQL databases through MCP. You can:
      - Execute SQL queries
      - Analyze database schemas
      - Help with data analysis and reporting
      - Provide database optimization suggestions
      
      Use your database access to help users work with their data effectively and safely.
      `,

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
      
      Use your web search access to provide users with current, accurate information from the internet.
      `,

      zapier: `You are an AI assistant with access to Zapier through MCP. You can:
      - Automate workflows between different apps
      - Create and manage Zaps (automated workflows)
      - Connect various services and APIs
      - Handle data transformation and routing
      
      Use your Zapier access to help users automate repetitive tasks and connect their favorite apps.
      `,

      stripe: `You are an AI assistant with access to Stripe through MCP. You can:
      - Process payments and manage transactions
      - Handle subscription billing and management
      - Access customer and payment data
      - Generate financial reports and analytics
      
      Use your Stripe access to help users manage their payment processing and billing operations.
      `,

      shopify: `You are an AI assistant with access to Shopify through MCP. You can:
      - Manage products, inventory, and collections
      - Process and track orders
      - Handle customer data and support
      - Analyze store performance and sales
      
      Use your Shopify access to help users manage their e-commerce store operations.
      `,

      paypal: `You are an AI assistant with access to PayPal through MCP. You can:
      - Process PayPal payments and transactions
      - Manage refunds and disputes
      - Access transaction history and reports
      - Handle merchant account operations
      
      Use your PayPal access to help users manage their PayPal payment processing and merchant services.
      `,

      square: `You are an AI assistant with access to Square through MCP. You can:
      - Process point-of-sale transactions
      - Manage inventory and product catalogs
      - Handle customer management and loyalty
      - Generate sales analytics and reports
      
      Use your Square access to help users manage their point-of-sale operations and business analytics.
      `,

      plaid: `You are an AI assistant with access to Plaid through MCP. You can:
      - Connect and verify bank accounts
      - Access transaction data and balances
      - Retrieve financial account information
      - Provide financial insights and analysis
      
      Use your Plaid access to help users integrate banking data and financial services into their applications.
      `
    };

    return (prompts as Record<string, string>)[server.server_label] || `You are an AI assistant with access to ${server.server_label} through MCP. Use this integration to help users with ${server.server_description.toLowerCase()}.`;
  };

  // Get system prompt for connected servers (combined)
  const getCombinedSystemPrompt = () => {
    const connectedPrompts = connectedServers.value
      .map((config: any) => generateDefaultSystemPrompt(config.setting))
      .filter(Boolean);

    if (connectedPrompts.length === 0) {
      return '';
    }

    const basePrompt = `You are an AI assistant with access to multiple services through MCP (Model Context Protocol) servers. 

**AVAILABLE MCP SERVICES:**
${connectedServers.value.map((config: any) => 
  `- **${config.setting.server_label}**: ${config.setting.server_description}
    Features: ${config.setting.allowed_tools?.join(', ')}`
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

  const removeServer = (server: MCPServer) => {
    const serverIndex = servers.value.findIndex(s => s.connectionId === server.connectionId);
    connectedServers.value = connectedServers.value.filter((s: any) => s.id != server.connectionId);
    if (serverIndex !== -1) {
      if (server.isCustom) {
        servers.value.splice(serverIndex, 1);
      } else {
        servers.value[serverIndex].connectionId = 0;
      }
    }
  }

  return {
    servers,
    connectedServers,
    getCombinedSystemPrompt,
    generateDefaultSystemPrompt,
    removeServer
  };
}); 