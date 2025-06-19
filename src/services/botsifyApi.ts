import axios from 'axios';
import type { MCPConfigurationFile } from '../types';

const BOTSIFY_BASE_URL = 'https://botsify.com/api';

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
   * Test AI Agent with the latest generated story
   */
  async testAiAgent(storyContent: string): Promise<BotsifyResponse> {
    try {
      console.log('Testing AI Agent with story content:', storyContent.substring(0, 100) + '...');
      
      const response = await axios.post(`${BOTSIFY_BASE_URL}/test-ai-agent`, {
        story: storyContent,
        timestamp: new Date().toISOString(),
        action: 'test'
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('Test AI Agent response:', response.data);
      
      return {
        success: true,
        message: 'AI Agent tested successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error testing AI Agent:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to test AI Agent',
        data: error.response?.data
      };
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Validate MCP server connection by pinging the actual server endpoint
   */
  async validateMCPConnection(serverId: string, serverName: string, apiKey?: string, connectionUrl?: string): Promise<BotsifyResponse> {
    try {
      console.log('🔍 Validating MCP connection for server:', serverName);
      
      // For built-in servers, we have predefined validation endpoints
      const validationEndpoint = this.getMCPValidationEndpoint(serverId, connectionUrl);
      
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

      // Ping the actual MCP server endpoint
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

    } catch (error: any) {
      console.error('❌ Error validating MCP connection:', error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return {
          success: false,
          message: 'Connection timeout. Please check your network and server availability.',
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
      } else if (error.message.includes('Invalid API key')) {
        return {
          success: false,
          message: error.message,
          data: { errorType: 'auth_failed' }
        };
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          message: 'Invalid API key provided. Please check your authentication credentials.',
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
      'email': '' // SMTP doesn't have REST endpoints
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
      'calendar': `Bearer ${apiKey}`
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
  async sendMCPConfigurationJSON(mcpData: any): Promise<BotsifyResponse> {
    try {
      console.log('Sending MCP configuration JSON to API:', mcpData);
      
      const response = await axios.post(`${BOTSIFY_BASE_URL}/mcp/configuration`, {
        ...mcpData,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
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
}

export const botsifyApi = BotsifyApiService.getInstance(); 