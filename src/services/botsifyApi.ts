import axios from 'axios';

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
}

export const botsifyApi = BotsifyApiService.getInstance(); 