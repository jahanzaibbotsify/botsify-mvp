import axios from 'axios';
import type { MCPConfigurationFile, MCPServer } from '../types/mcp';
import { BOTSIFY_BASE_URL, BOTSIFY_AUTH_TOKEN } from '../utils/config';
import { useApiKeyStore } from '@/stores/apiKeyStore';

export interface BotsifyResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class BotsifyApiService {
  private static instance: BotsifyApiService;

  private constructor() {}

  public static getInstance(): BotsifyApiService {
    if (!BotsifyApiService.instance) {
      BotsifyApiService.instance = new BotsifyApiService();
    }
    return BotsifyApiService.instance;
  }

  /**
   * Get Botsify authorization headers for API requests
   */
  private getBotsifyHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    // Add Botsify authorization header if token is available
    if (BOTSIFY_AUTH_TOKEN && BOTSIFY_AUTH_TOKEN.trim()) {
      headers['Authorization'] = `Bearer ${BOTSIFY_AUTH_TOKEN}`;
    }
    return headers;
  }

  /**
   * Deploy AI Agent with the latest generated story
   */
  async deployAiAgent(storyContent: string): Promise<BotsifyResponse> {
    try {
      console.log('Deploying AI Agent with story content:', storyContent.substring(0, 100) + '...');
      
      const response = await axios.post(`${BOTSIFY_BASE_URL}/deploy-ai-agent`, {
        story: storyContent,
        timestamp: new Date().toISOString(),
        action: 'deploy'
      }, {
        headers: this.getBotsifyHeaders(),
        timeout: 60000 // 60 seconds timeout for deployment
      });

      console.log('Deploy AI Agent response:', response.data);
      
      return {
        success: true,
        message: 'AI Agent deployed successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deploying AI Agent:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to deploy AI Agent',
        data: error.response?.data
      };
    }
  }

  /**
   * Save MCP configuration for a specific bot
   */
  async saveMCPConfiguration(botId: string, configuration: MCPConfigurationFile): Promise<BotsifyResponse> {
    try {
      console.log('Saving MCP configuration for bot:', botId);
      
      const response = await axios.post(`${BOTSIFY_BASE_URL}/bots/${botId}/mcp-configuration`, {
        botId,
        configuration,
        timestamp: new Date().toISOString()
      }, {
        headers: this.getBotsifyHeaders(),
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Save MCP configuration response:', response.data);
      
      return {
        success: true,
        message: 'MCP configuration saved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error saving MCP configuration:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save MCP configuration',
        data: error.response?.data
      };
    }
  }

  /**
   * Get MCP configuration for a specific bot
   */
  async getMCPConfiguration(botId: string): Promise<BotsifyResponse> {
    try {
      console.log('Getting MCP configuration for bot:', botId);
      
      const response = await axios.get(`${BOTSIFY_BASE_URL}/bots/${botId}/mcp-configuration`, {
        headers: this.getBotsifyHeaders(),
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Get MCP configuration response:', response.data);
      
      return {
        success: true,
        message: 'MCP configuration retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting MCP configuration:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get MCP configuration',
        data: error.response?.data
      };
    }
  }

  /**
   * Delete MCP configuration for a specific bot
   */
  async deleteMCPConfiguration(botId: string): Promise<BotsifyResponse> {
    try {
      console.log('Deleting MCP configuration for bot:', botId);
      
      const response = await axios.delete(`${BOTSIFY_BASE_URL}/bots/${botId}/mcp-configuration`, {
        headers: this.getBotsifyHeaders(),
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Delete MCP configuration response:', response.data);
      
      return {
        success: true,
        message: 'MCP configuration deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting MCP configuration:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete MCP configuration',
        data: error.response?.data
      };
    }
  }
  
  /**
   * Get all connected MCP servers
  */
  
    async getAllConnectedMCPs() {
      try {
        const response = await axios.get(
          `${BOTSIFY_BASE_URL}/ai-tools/mcp`,
          {
            headers: this.getBotsifyHeaders(),
             params: { apikey: useApiKeyStore().apiKey }
          }
        );
        return {
          success: true,
          message: 'Connected MCPs retrieved successfully',
          data: response.data
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Failed to get connected MCPs',
          data: error.response?.data
        };
      }
    }

  /**
   * Update an MCP server configuration
   */
  async updateMCPConfiguration(id: string, mcpData: MCPServer): Promise<BotsifyResponse> {
    try {
      // Create the new payload structure
      const mcpPayload = {
        settings: {
          apikey : mcpData.connection.apiKey,
          type: "mcp",
          server_label: mcpData.id || mcpData.name?.toLowerCase().replace(/\s+/g, '_'),
          server_url: this.getDefaultServerUrl(mcpData.id),
          headers: this.buildMCPHeaders(mcpData.id, mcpData.connection?.apiKey || '', mcpData.authMethod || 'api_key'),
          allowed_tools: this.mapFeaturesToTools(mcpData.features || []),
          require_approval: "never",
        },
        apikey: useApiKeyStore().apiKey
      };
      
      const response = await axios.put(`${BOTSIFY_BASE_URL}/mcp/${id}`, mcpPayload, {
        headers: this.getBotsifyHeaders(),
        timeout: 30000
      });

      return {
        success: true,
        message: 'MCP server updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating MCP server:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update MCP server',
        data: error.response?.data
      };
    }
  }

  /**
   * Delete an MCP server
   */
  async disconnectMCP(id: string): Promise<BotsifyResponse> {
    try {
      const response = await axios.delete(
        `${BOTSIFY_BASE_URL}/mcp/${id}`,
        {
          headers: this.getBotsifyHeaders(),
          data: { apikey: useApiKeyStore().apiKey }
        }
      );

      return {
        success: true,
        message: 'MCP server disconnected successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error disconnecting MCP server:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete MCP server',
        data: error.response?.data
      };
    }
  }
  /**
   * Validate MCP server connection by pinging the actual server endpoint
   */
  async validateMCPConnection(serverId: string, serverName: string, apiKey?: string, connectionUrl?: string): Promise<BotsifyResponse> {
    try {
      console.log('🔍 Validating MCP connection for server:', serverName);
      
      // For built-in servers, we have predefined validation endpoints
      let validationEndpoint = this.getMCPValidationEndpoint(serverId, connectionUrl);
      
      // For Shopify, construct the validation endpoint from the connection URL
      if (serverId === 'shopify' && connectionUrl) {
        validationEndpoint = connectionUrl;
      }
      
      if (!validationEndpoint) {
        // Handle special servers that don't have HTTP endpoints
        if (['postgres', 'filesystem', 'email'].includes(serverId)) {
          return await this.validateSpecialMCPServer(serverId, apiKey);
        }
        throw new Error('No validation endpoint available for this server');
      }

      console.log('🌐 Pinging MCP server endpoint:', validationEndpoint);

      // Prepare headers with authentication
      const headers: Record<string, string> = {};

      // For weather APIs, use minimal headers to avoid CORS/rejection issues
      if (serverId === 'weather') {
        // OpenWeatherMap API works better with minimal headers
        headers['Accept'] = 'application/json';
      } else {
        // Other APIs get standard headers
        headers['Content-Type'] = 'application/json';
        headers['User-Agent'] = 'Botsify-MCP-Validator/1.0';
      }

      // Get final validation URL (may include API key as query param for some services)
      const finalValidationUrl = this.getValidationUrlWithApiKey(serverId, validationEndpoint, apiKey);

      // Add authentication header if needed (not for query param auth like weather API)
      if (apiKey && apiKey.trim() && !['weather'].includes(serverId)) {
        headers['Authorization'] = this.getAuthHeader(serverId, apiKey.trim());
      }

      console.log('🌐 Final validation URL:', finalValidationUrl);
      console.log('🔑 Headers:', headers);

      // For Shopify, use POST with JSON-RPC format
      if (serverId === 'shopify') {
        const jsonRpcPayload = {
          jsonrpc: "2.0",
          method: "tools/call",
          id: 1,
          params: {
            name: "search_shop_catalog",
            arguments: {
              query: "",
              context: "order products on the basis of behaviour of user"
            }
          }
        };

        console.log('🛒 Shopify MCP validation payload:', JSON.stringify(jsonRpcPayload, null, 2));
        console.log('🛒 Shopify MCP validation URL:', finalValidationUrl);
        console.log('🛒 Shopify MCP validation headers:', headers);

        const response = await axios.post(finalValidationUrl, jsonRpcPayload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          timeout: 30000, // Increased timeout for Shopify requests
          validateStatus: (status) => status < 500
        });

        console.log('✅ Shopify MCP server responded with status:', response.status);
        console.log('📄 Response data:', response.data);

        // Check if the response indicates a successful connection
        if (response.status === 200) {
          return {
            success: true,
            message: 'Shopify MCP server connection validated successfully',
            data: {
              serverStatus: 'reachable',
              responseTime: Date.now(),
              serverInfo: response.data
            }
          };
        } else if (response.status === 401) {
          if (apiKey?.trim()) {
            throw new Error('Invalid access token provided. Please check your Shopify access token.');
          } else {
            return {
              success: true,
              message: 'Shopify MCP server connection validated successfully (authentication required)',
              data: {
                serverStatus: 'reachable',
                responseTime: Date.now(),
                authRequired: true
              }
            };
          }
        } else if (response.status === 403) {
          throw new Error('Invalid access token provided. Please check your Shopify access token.');
        } else {
          throw new Error(`Shopify server returned unexpected status: ${response.status}`);
        }
      } else {
        // For other servers, use GET method
        const response = await axios.get(finalValidationUrl, {
          headers,
          timeout: 10000, // 10 seconds timeout for real server ping
          validateStatus: (status) => status < 500 // Accept all responses except server errors
        });

        console.log('✅ MCP server responded with status:', response.status);
        console.log('📄 Response data:', response.data);

        // Check if the response indicates a successful connection
        if (response.status === 200) {
          return {
            success: true,
            message: 'MCP server connection validated successfully',
            data: {
              serverStatus: 'reachable',
              responseTime: Date.now(),
              serverInfo: response.data
            }
          };
        } else if (response.status === 401) {
          if (apiKey && apiKey.trim()) {
            // 401 with API key provided = invalid credentials
            throw new Error('Invalid API key provided. Please check your authentication credentials.');
          } else {
            // 401 without API key = server reachable but auth required
            return {
              success: true,
              message: 'MCP server connection validated successfully (authentication required)',
              data: {
                serverStatus: 'reachable',
                responseTime: Date.now(),
                authRequired: true
              }
            };
          }
        } else if (response.status === 403) {
          throw new Error('Invalid API key provided. Please check your authentication credentials.');
        } else if (response.status === 404) {
          throw new Error('MCP server endpoint not found. Please verify the connection URL.');
        } else {
          throw new Error(`Server returned unexpected status: ${response.status}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Error validating MCP connection:', error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        const timeoutMessage = serverId === 'shopify' 
          ? 'Shopify MCP server connection timed out. Please check your domain and access token, or try again in a few moments.'
          : 'Connection timeout. Please check your network and server availability.';
        return {
          success: false,
          message: timeoutMessage,
          data: { errorType: 'timeout' }
        };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: 'Cannot reach the MCP server. Please verify the connection URL.',
          data: { errorType: 'connection_failed' }
        };
      } else if (error.message && error.message.includes('CORS')) {
        // CORS error - common in browser environments
        return {
          success: false,
          message: 'CORS policy error. The server may not allow requests from this domain. This is a browser limitation - the API key is likely valid.',
          data: { errorType: 'cors_error', note: 'API validation may work in production environment' }
        };
      } else if (error.message && error.message.includes('Network Error')) {
        // Generic network error - might be CORS related
        if (serverId === 'weather') {
          // For weather APIs, fall back to format validation due to CORS restrictions
          console.log('🌤️ Weather API CORS issue detected, falling back to format validation');
          return await this.validateSpecialMCPServer('weather', apiKey);
        }
        return {
          success: false,
          message: 'Network error connecting to the server.',
          data: { errorType: 'network_error' }
        };
      } else if (error.message.includes('Invalid API key') || error.message.includes('Invalid access token')) {
        return {
          success: false,
          message: error.message,
          data: { errorType: 'auth_failed' }
        };
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = serverId === 'shopify' 
          ? 'Invalid access token provided. Please check your Shopify access token.'
          : 'Invalid API key provided. Please check your authentication credentials.';
        return {
          success: false,
          message: errorMessage,
          data: { errorType: 'auth_failed' }
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: 'MCP server endpoint not found. Please verify the connection URL.',
          data: { errorType: 'not_found' }
        };
      }
      
      // Special fallback for weather APIs - if any other error occurs, try format validation
      if (serverId === 'weather' && apiKey) {
        console.log('🌤️ Weather API validation failed, falling back to format validation');
        return await this.validateSpecialMCPServer('weather', apiKey);
      }
      
      return {
        success: false,
        message: error.message || 'Failed to validate MCP connection',
        data: { errorType: 'unknown', originalError: error.message }
      };
    }
  }

  /**
   * Get the appropriate validation endpoint for different MCP servers
   */
  private getMCPValidationEndpoint(serverId: string, customUrl?: string): string | null {
    // For custom servers, use the provided URL
    if (customUrl) {
      // Ensure URL has proper format for validation
      try {
        const url = new URL(customUrl);
        // Add health check or ping endpoint if available
        return `${url.origin}/health` || customUrl;
      } catch {
        return customUrl; // Fallback to original URL if parsing fails
      }
    }

    // Predefined validation endpoints for popular services
    const validationEndpoints: Record<string, string> = {
      'github': 'https://api.github.com/user',
      'notion': 'https://api.notion.com/v1/users/me',
      'slack': 'https://slack.com/api/auth.test',
      'google-drive': 'https://www.googleapis.com/drive/v3/about',
      'postgres': '', // Database connections need special handling
      'filesystem': '', // Local filesystem - no HTTP endpoint
      'web-search': 'https://api.bing.microsoft.com/v7.0/search?q=test', // Example search API with test query
      'weather': 'https://api.openweathermap.org/data/2.5/weather?q=London&units=metric', // Weather API with test query
      'calendar': 'https://www.googleapis.com/calendar/v3/users/me/settings',
      'email': '', // SMTP doesn't have REST endpoints
      'zapier': 'https://zapier.com/api/v1/user',
      'stripe': 'https://api.stripe.com/v1/account',
      'shopify': '', // Shopify uses custom domain, will be constructed dynamically
      'paypal': 'https://api.paypal.com/v1/identity/oauth2/userinfo',
      'square': 'https://connect.squareup.com/v2/locations',
      'plaid': 'https://api.plaid.com/accounts/get'
    };

    return validationEndpoints[serverId] || null;
  }

  /**
   * Validate special MCP servers that don't have HTTP endpoints
   */
  private async validateSpecialMCPServer(serverId: string, apiKey?: string): Promise<BotsifyResponse> {
    switch (serverId) {
      case 'postgres':
        // For PostgreSQL, we simulate validation since we can't directly test DB connections in browser
        console.log('🐘 PostgreSQL validation - simulating connection test');
        return {
          success: true,
          message: 'PostgreSQL connection validated (connection details will be tested during actual usage)',
          data: { serverStatus: 'simulated_validation', note: 'Database connections are validated on server-side' }
        };

      case 'filesystem':
        // Filesystem access is local - always valid but access depends on permissions
        console.log('💾 Filesystem validation - local access confirmed');
        return {
          success: true,
          message: 'Filesystem access validated (local file system operations available)',
          data: { serverStatus: 'local_validated', note: 'File access depends on runtime permissions' }
        };

      case 'email':
        // SMTP validation would require actual SMTP connection, simulate for now
        console.log('📧 Email/SMTP validation - simulating connection test');
        return {
          success: true,
          message: 'Email/SMTP configuration validated (SMTP connection will be tested during actual usage)',
          data: { serverStatus: 'simulated_validation', note: 'SMTP connections are validated on server-side' }
        };

      case 'weather':
        // Weather API validation with fallback for CORS issues
        console.log('🌤️ Weather API validation - providing guidance for API key format');
        
        if (!apiKey || !apiKey.trim()) {
          return {
            success: false,
            message: 'API key is required for weather service',
            data: { errorType: 'missing_api_key' }
          };
        }

        // Check if API key has the right format (OpenWeatherMap API keys are typically 32 characters)
        const trimmedKey = apiKey.trim();
        if (trimmedKey.length !== 32 || !/^[a-f0-9]+$/i.test(trimmedKey)) {
          return {
            success: false,
            message: 'Invalid API key format. OpenWeatherMap API keys should be 32 characters long and contain only letters and numbers.',
            data: { errorType: 'invalid_format' }
          };
        }

        return {
          success: true,
          message: 'Weather API key format validated. Note: Full API validation requires server-side testing due to CORS restrictions.',
          data: { 
            serverStatus: 'format_validated', 
            note: 'API key format is correct. Test it at: https://api.openweathermap.org/data/2.5/weather?q=London&appid=' + trimmedKey 
          }
        };

      default:
        throw new Error('No validation method available for this server type');
    }
  }

  /**
   * Get the appropriate authentication header for different services
   */
  private getAuthHeader(serverId: string, apiKey: string): string {
    const authMethods: Record<string, string> = {
      'github': `token ${apiKey}`,
      'notion': `Bearer ${apiKey}`,
      'slack': `Bearer ${apiKey}`,
      'google-drive': `Bearer ${apiKey}`,
      'web-search': `Bearer ${apiKey}`,
      'weather': `Bearer ${apiKey}`, // Some weather APIs use Bearer, others use query params
      'calendar': `Bearer ${apiKey}`,
      'shopify': `Bearer ${apiKey}`
    };

    return authMethods[serverId] || `Bearer ${apiKey}`;
  }

  /**
   * Get validation URL with API key as query parameter if needed
   */
  private getValidationUrlWithApiKey(serverId: string, baseUrl: string, apiKey?: string): string {
    // Some APIs require API key as query parameter
    if (apiKey && ['weather'].includes(serverId)) {
      const url = new URL(baseUrl);
      url.searchParams.set('appid', apiKey); // OpenWeatherMap uses 'appid'
      return url.toString();
    }
    
    return baseUrl;
  }

  /**
   * Send MCP configuration JSON to API after successful connection
   */
  async sendMCPConfigurationJSON(mcpData: MCPServer): Promise<BotsifyResponse> {
    try {
      console.log('Sending MCP configuration JSON to API:', mcpData);
      
      // Create the new payload structure
      let serverUrl = this.getDefaultServerUrl(mcpData.id);
      
      // For Shopify, use the custom domain if provided
      if (mcpData.id === 'shopify' && mcpData?.domain) {
        serverUrl = `https://${mcpData.domain}/api/mcp`;
      }
      
      const mcpPayload = {
        settings: {
          apikey : mcpData.connection.apiKey,
          type: "mcp",
          server_label: mcpData.id || mcpData.name?.toLowerCase().replace(/\s+/g, '_'),
          server_url: serverUrl,
          headers: this.buildMCPHeaders(mcpData.id, mcpData.connection?.apiKey || '', mcpData.authMethod || 'api_key'),
          allowed_tools: this.mapFeaturesToTools(mcpData.features || []),
          require_approval: "never",
        },
        apikey: useApiKeyStore().apiKey
      };
      
      console.log('MCP payload structure:', mcpPayload);
      
      const response = await axios.post(`${BOTSIFY_BASE_URL}/mcp/configuration`, mcpPayload, {
        headers: this.getBotsifyHeaders(),
        timeout: 30000 // 30 seconds timeout
      });

      console.log('MCP configuration JSON sent successfully:', response.data);
      
      return {
        success: true,
        message: 'MCP configuration sent to API successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error sending MCP configuration JSON:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send MCP configuration to API',
        data: error.response?.data
      };
    }
  }

  /**
   * Build headers object for MCP configuration based on authentication method
   */
  private buildMCPHeaders(serverId: string, apiKey: string, authMethod: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (apiKey && apiKey.trim()) {
      switch (authMethod) {
        case 'bearer_token':
          if (serverId === 'shopify'){
            headers['X-Shopify-Access-Token'] = apiKey.trim();
          } else{
            headers['Authorization'] = `Bearer ${apiKey.trim()}`;
          }
          break;
        case 'api_key':
          // For API key, we might use different header names based on the service
          if (serverId === 'stripe') {
            headers['Authorization'] = `Bearer ${apiKey.trim()}`;
          } else if (serverId === 'github') {
            headers['Authorization'] = `token ${apiKey.trim()}`;
          } else if (serverId === 'notion') {
            headers['Authorization'] = `Bearer ${apiKey.trim()}`;
            headers['Notion-Version'] = '2022-06-28';
          } else if (serverId === 'slack') {
            headers['Authorization'] = `Bearer ${apiKey.trim()}`;
          } else if (serverId === 'shopify') {
            headers['X-Shopify-Access-Token'] = apiKey.trim();
            headers['Content-Type'] = 'application/json';
          } else {
            headers['X-API-Key'] = apiKey.trim();
          }
          break;
        case 'basic_auth':
          // For basic auth, apiKey should contain "username:password"
          const encoded = btoa(apiKey.trim());
          headers['Authorization'] = `Basic ${encoded}`;
          break;
        case 'oauth':
          headers['Authorization'] = `Bearer ${apiKey.trim()}`;
          break;
        default:
          headers['X-API-Key'] = apiKey.trim();
      }
    }
    
    return headers;
  }

  /**
   * Map features to standardized tool names
   */
  private mapFeaturesToTools(features: string[]): string[] {
    const toolMapping: Record<string, string[]> = {
      // GitHub tools
      'Repository access': ['list_repositories', 'get_repository', 'search_repositories'],
      'Issue management': ['list_issues', 'create_issue', 'update_issue', 'close_issue'],
      'Pull requests': ['list_pull_requests', 'create_pull_request', 'merge_pull_request'],
      'Code search': ['search_code', 'get_file_content'],
      
      // Stripe tools
      'Payment processing': ['create_payment_intent', 'capture_payment', 'list_payment_intents'],
      'Subscription billing': ['create_subscription', 'list_subscriptions', 'update_subscription', 'cancel_subscription'],
      'Invoice management': ['create_invoice', 'list_invoices', 'create_invoice_item', 'finalize_invoice'],
      'Financial reporting': ['retrieve_balance', 'list_transactions'],
      'Refund processing': ['create_refund', 'list_refunds'],
      'Dispute handling': ['update_dispute', 'list_disputes'],
      'Payment links': ['create_payment_link'],
      'Coupon management': ['create_coupon', 'list_coupons'],
      
      // Customer management (shared across multiple services)
      'Customer management': ['create_customer', 'list_customers', 'update_customer', 'get_customer'],
      
      // Product management (shared across e-commerce services)
      'Product management': ['create_product', 'list_products', 'update_product', 'create_price', 'list_prices'],
      
      // Shopify-specific tools
      'Order processing': ['list_orders', 'create_order', 'update_order'],
      'Inventory management': ['list_inventory', 'update_inventory', 'list_catalog', 'create_catalog_item'],
      
      // Notion tools
      'Database access': ['query_database', 'create_database_entry', 'update_database_entry'],
      'Page management': ['get_page', 'create_page', 'update_page'],
      'Content management': ['search_content', 'get_block_children'],
      
      // Slack tools
      'Message sending': ['send_message', 'send_direct_message'],
      'Channel management': ['list_channels', 'join_channel', 'create_channel'],
      'User management': ['list_users', 'get_user_info'],
      
      // Google Drive tools
      'File management': ['list_files', 'create_file', 'update_file', 'delete_file'],
      'Folder management': ['list_folders', 'create_folder'],
      'Sharing management': ['share_file', 'update_permissions'],
      
      // Database tools
      'Query execution': ['execute_query', 'execute_select', 'execute_insert', 'execute_update'],
      'Schema inspection': ['describe_table', 'list_tables', 'get_schema'],
      'Data analysis': ['analyze_data', 'generate_report'],
      
      // Web search tools
      'Web search': ['search_web', 'get_page_content', 'analyze_content'],
      'Real-time data': ['get_current_data', 'fetch_news'],
      
      // PayPal-specific tools
      'PayPal payments': ['create_payment', 'execute_payment', 'list_payments'],
      'Refund management': ['create_refund', 'get_refund'],
      'Transaction history': ['list_transactions', 'get_transaction'],
      
      // Square-specific tools
      'POS transactions': ['create_payment', 'list_payments'],
      'Square inventory': ['list_catalog', 'create_catalog_item', 'update_inventory'],
      'Analytics': ['list_orders', 'get_payment_analytics'],
      
      // Plaid tools
      'Account linking': ['create_link_token', 'exchange_public_token'],
      'Transaction data': ['get_transactions', 'get_accounts'],
      'Balance checks': ['get_balances'],
      'Financial insights': ['get_categories', 'analyze_spending'],
      
      // Zapier tools
      'Workflow automation': ['create_zap', 'trigger_zap', 'list_zaps'],
      'App connections': ['list_apps', 'authenticate_app'],
      'Data transformation': ['transform_data', 'map_fields']
    };

    const tools: string[] = [];
    
    features.forEach(feature => {
      const mappedTools = toolMapping[feature];
      if (mappedTools) {
        tools.push(...mappedTools);
      } else {
        // If no mapping found, create a generic tool name
        const toolName = feature.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        tools.push(toolName);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(tools)];
  }

  /**
   * Get default server URL for known services
   */
  private getDefaultServerUrl(serverId: string): string {
    const defaultUrls: Record<string, string> = {
      github: 'https://api.github.com',
      stripe: 'https://mcp.stripe.com',
      shopify: 'https://api.shopify.com',
      notion: 'https://api.notion.com/v1',
      slack: 'https://slack.com/api',
      'google-drive': 'https://www.googleapis.com/drive/v3',
      postgres: 'postgresql://localhost:5432',
      zapier: 'https://zapier.com/api/v1',
      paypal: 'https://api.paypal.com',
      square: 'https://connect.squareup.com',
      plaid: 'https://production.plaid.com',
      'web-search': 'https://api.openweathermap.org/data/2.5', // Weather API as fallback
      weather: 'https://api.openweathermap.org/data/2.5'
    };
    
    return defaultUrls[serverId] || 'https://localhost:3000';
  }

  /**
   * Get File Search data for a specific bot assistant
   */
  async getFileSearch(): Promise<BotsifyResponse> {
    try {
      console.log('Getting file search files for bot assistant:', useApiKeyStore().apiKey);
      
      const response = await axios.get(
        `${BOTSIFY_BASE_URL}/file-search`,
        {
            headers: this.getBotsifyHeaders(),
             params: { apikey: useApiKeyStore().apiKey }
          }
      );

      console.log('File search files retrieved successfully:', response.data);
      return {
        success: true,
        message: 'File search files retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting file search files:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get file search files'
      };
    }
  }

  /**
   * Create/Connect File Search for a specific bot assistant
   */
  async createFileSearch(file: File): Promise<BotsifyResponse> {
    try {
      const formData = new FormData();
      // formData.append('file', file);
      // formData.append('bot_assistant_id', botAssistantId);
      formData.append('file', file)
      
      const response = await axios.post(
        `${BOTSIFY_BASE_URL}/file-search?apikey=${useApiKeyStore().apiKey}`,
        formData,
        { 
          headers: {
            ...this.getBotsifyHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('File uploaded for search successfully:', response.data);
      return {
        success: true,
        message: 'File uploaded for search successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error uploading file for search:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file for search'
      };
    }
  }

  /**
   * Delete File Search by ID
   */
  async deleteFileSearch(id: string): Promise<BotsifyResponse> {
    try {
      console.log('Deleting file from search:', id);
      
      const response = await axios.delete(
        `${BOTSIFY_BASE_URL}/file-search/${id}?apikey=${useApiKeyStore().apiKey}`,
        { headers: this.getBotsifyHeaders() }
      );
      
      console.log('File deleted from search successfully:', response.data);
      return {
        success: true,
        message: 'File deleted from search successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting file from search:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file from search'
      };
    }
  }

  /**
   * Delete File Search by ID
   */
  async deleteAllFileSearch(ids: string[]): Promise<BotsifyResponse> {
    try {
      console.log('Deleting file from search:', ids);
      
      const response = await axios.delete(
        `${BOTSIFY_BASE_URL}/file-search`,
        { 
          headers: this.getBotsifyHeaders(),
          data: {
            "apikey": useApiKeyStore().apiKey,
            "ids": ids
          }
        }
      );
      
      console.log('File deleted from search successfully:', response.data);
      return {
        success: true,
        message: 'File deleted from search successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting file from search:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file from search'
      };
    }
  }

  /**
   * Get Web Search data for a specific bot assistant
   */
  async getWebSearch(): Promise<BotsifyResponse> {
    try {
      console.log('Getting web search URLs for bot assistant:', useApiKeyStore().apiKey);
      
      // const response = await axios.get(
      //   `${BOTSIFY_BASE_URL}/web-search/${botAssistantId}`,
      //   { headers: this.getBotsifyHeaders() }
      // );

      const response = await axios.get(
        `${BOTSIFY_BASE_URL}/web-search?apikey=${useApiKeyStore().apiKey}`,
        { headers: this.getBotsifyHeaders() }
      );
      
      console.log('Web search URLs retrieved successfully:', response.data);
      return {
        success: true,
        message: 'Web search URLs retrieved successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting web search URLs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get web search URLs'
      };
    }
  }

  /**
   * Add a new web URL for search
   */
  async createWebSearch(url: string, title?: string): Promise<BotsifyResponse> {
    try {
      const response = await axios.post(
        `${BOTSIFY_BASE_URL}/web-search`,
        {
          // bot_assistant_id: botAssistantId,
          apikey: useApiKeyStore().apiKey,
          url: url,
          title: title
        },
        { headers: this.getBotsifyHeaders() }
      );
      
      console.log('Web URL added successfully:', response.data);
      return {
        success: true,
        message: 'Web URL added successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error adding web URL:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add web URL'
      };
    }
  }

  /**
   * Delete a web search URL
   */
  async deleteAllWebSearch(ids: string[]): Promise<BotsifyResponse> {
    try {
     console.log("passed ids:", ids);
     
      const response = await axios.delete(
        `${BOTSIFY_BASE_URL}/web-search`, 
        { 
          headers: this.getBotsifyHeaders(),
          data: {
            apikey: useApiKeyStore().apiKey,
            ids: ids,
          },
      });

      console.log('Web URL deleted successfully:', response.data);
      return {
        success: true,
        message: 'All Web URLs deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error deleting all web URLs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete web URL'
      };
    }
  }

  /**
   * Upload file using the upload-file endpoint (TemplatesController)
   */
  async uploadFileNew(file: File): Promise<BotsifyResponse> {
    try {
      console.log('Uploading file using TemplatesController endpoint:', file.name, file.type, file.size);
      
      // Validate file type (images, videos, and documents)
      const supportedTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Videos
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
        // Documents
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!supportedTypes.includes(file.type)) {
        return {
          success: false,
          message: 'Unsupported file type. Please upload images, videos, or documents (PDF, Word, Excel, PowerPoint, TXT, CSV).'
        };
      }
      
      // Validate file size based on type
      let maxSize: number;
      if (file.type.startsWith('video/')) {
        maxSize = 50 * 1024 * 1024; // 50MB for videos
      } else if (file.type.startsWith('image/')) {
        maxSize = 20 * 1024 * 1024; // 20MB for images
      } else {
        maxSize = 10 * 1024 * 1024; // 10MB for documents
      }
      
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
          success: false,
          message: `File size too large. Maximum size is ${maxSizeMB}MB for ${file.type.split('/')[0]}s.`
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${BOTSIFY_BASE_URL}/v1/upload-file`,
        formData,
        { 
          headers: {
            ...this.getBotsifyHeaders(),
            'Content-Type': 'multipart/form-data'
            // Note: Don't set Content-Type for FormData, let axios handle it
          }
        }
      );
      
      console.log('File uploaded successfully using TemplatesController:', response.data);
      return {
        success: true,
        message: 'File uploaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      };
    }
  }

  /**
   * Upload multiple files using the new endpoint
   */
  async uploadMultipleFilesNew(files: File[]): Promise<BotsifyResponse> {
    try {
      console.log('Uploading multiple files using new endpoint:', files.length);
      
      const uploadResults: any[] = [];
      const errors: string[] = [];
      
      // Upload files in parallel for better performance
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await this.uploadFileNew(file);
          if (result.success) {
            uploadResults.push(result.data);
          } else {
            errors.push(`${file.name}: ${result.message}`);
          }
        } catch (error: any) {
          errors.push(`${file.name}: ${error.message}`);
        }
      });
      
      await Promise.all(uploadPromises);
      
      if (uploadResults.length === 0 && errors.length > 0) {
        return {
          success: false,
          message: 'All file uploads failed: ' + errors.join(', '),
          data: { errors }
        };
      }
      
      return {
        success: true,
        message: `Successfully uploaded ${uploadResults.length} of ${files.length} files`,
        data: {
          uploadedFiles: uploadResults,
          errors: errors.length > 0 ? errors : undefined,
          uploadedCount: uploadResults.length,
          totalCount: files.length
        }
      };
    } catch (error: any) {
      console.error('Error uploading multiple files (new endpoint):', error);
      
      return {
        success: false,
        message: error.message || 'Failed to upload files',
        data: error
      };
    }
  }


  async saveBotTemplates(chatsJson: string, templatesJson: string): Promise<void> {
    axios.post(import.meta.env.VITE_BOTSIFY_BASE_URL + '/v1/bot-update', {
      'apikey': localStorage.getItem('apikey'),
      'data' : {
        chat_flow: chatsJson,
        bot_flow: templatesJson
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BOTSIFY_AUTH_TOKEN}`
      }
    }).then(response => {
      if (response.data.status == 'success') {
        console.log('Message stored: ', response.data.bot);
      }
    }).catch((error) => {
      console.log('error:', error);
    });
  }
}

export const botsifyApi = BotsifyApiService.getInstance(); 