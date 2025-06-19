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
}

export const botsifyApi = BotsifyApiService.getInstance(); 