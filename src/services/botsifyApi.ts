import { BaseService, BaseApiResponse } from './baseService'
import type { MCPConfigurationFile, MCPConfigurationPayload } from '../types/mcp'

// Strongly typed response interfaces
export interface BotsifyResponse<T = unknown> extends BaseApiResponse<T> {}

// MCP Configuration types
interface MCPValidationPayload {
  server_url: string
  server_port: number
  server_username: string
  server_password: string
}

interface DeployAgentPayload {
  version_id: number
  new_version_name: string
}

interface FileUploadPayload {
  file: File
}

interface MultipleFilesPayload {
  files: File[]
}

interface BotTemplatesPayload {
  template_id: number
  template_name: string
}

interface DeleteVersionPayload {
  version_id: number
}

export class BotsifyApiService extends BaseService {
  /**
   * Deploy AI Agent with the latest generated story
   */
  async deployAiAgent(activeAiPromptVersionId: number, newAiPromptVersionName: string): Promise<BotsifyResponse> {
    const payload: DeployAgentPayload = {
      version_id: activeAiPromptVersionId,
      new_version_name: newAiPromptVersionName,
    }
    
    return this.post('/deploy-ai-agent', payload, {
      timeout: 60000 // 60 seconds timeout for deployment
    })
  }

  /**
   * Save MCP configuration for a specific bot
   */
  async saveMCPConfiguration(botId: string, configuration: MCPConfigurationFile): Promise<BotsifyResponse> {
    const payload = {
      configuration,
      timestamp: new Date().toISOString()
    }
    
    return this.post(`/bots/${botId}/mcp-configuration`, payload, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Get MCP configuration for a specific bot
   */
  async getMCPConfiguration(botId: string): Promise<BotsifyResponse> {
    return this.get(`/bots/${botId}/mcp-configuration`, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Delete MCP configuration for a specific bot
   */
  async deleteMCPConfiguration(botId: string): Promise<BotsifyResponse> {
    return this.delete(`/bots/${botId}/mcp-configuration`, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Get all connected MCPs
   */
  async getAllConnectedMCPs(): Promise<BotsifyResponse> {
    return this.get('/mcp/connected')
  }

  /**
   * Update MCP configuration
   */
  async updateMCPConfiguration(id: string, mcpPayload: Record<string, unknown>): Promise<BotsifyResponse> {
    return this.put(`/mcp/${id}`, mcpPayload, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Disconnect MCP
   */
  async disconnectMCP(id: string): Promise<BotsifyResponse> {
    return this.delete(`/mcp/${id}`, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Configure MCP server
   */
  async configureMCPServer(configuration: MCPConfigurationPayload): Promise<BotsifyResponse> {
    return this.post('/mcp/configure', configuration)
  }

  /**
   * Validate MCP server connection
   */
  async validateMCPServer(serverUrl: string, serverPort: number, username: string, password: string): Promise<BotsifyResponse> {
    const payload: MCPValidationPayload = {
      server_url: serverUrl,
      server_port: serverPort,
      server_username: username,
      server_password: password
    }
    return this.post('/mcp/validate', payload)
  }

  /**
   * Test MCP server connection
   */
  async testMCPServer(serverUrl: string, serverPort: number, username: string, password: string): Promise<BotsifyResponse> {
    const payload: MCPValidationPayload = {
      server_url: serverUrl,
      server_port: serverPort,
      server_username: username,
      server_password: password
    }
    return this.post('/mcp/test', payload)
  }

  /**
   * Validate Shopify connection
   */
  async validateShopifyConnection(
    serverName: string, 
    apiKey?: string, 
    connectionUrl?: string, 
    authMethod?: string
  ): Promise<BotsifyResponse> {
    const payload = {
      serverName,
      apiKey,
      connectionUrl,
      authMethod
    }
    
    return this.post('/shopify/validate', payload, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Send MCP configuration JSON
   */
  async sendMCPConfigurationJSON(mcpPayload: Record<string, unknown>): Promise<BotsifyResponse> {
    return this.post('/mcp/config', mcpPayload, {
      timeout: 30000 // 30 seconds timeout
    })
  }

  /**
   * Get file search
   */
  async getFileSearch(): Promise<BotsifyResponse> {
    return this.get('/file-search')
  }

  /**
   * Create file search
   */
  async createFileSearch(file: File): Promise<BotsifyResponse> {
    const formData = this.createFormData({ file })
    return this.post('/file-search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds timeout for file upload
    })
  }

  /**
   * Delete file search
   */
  async deleteFileSearch(id: string): Promise<BotsifyResponse> {
    return this.delete(`/file-search/${id}`)
  }

  /**
   * Delete all file search
   */
  async deleteAllFileSearch(ids: string[]): Promise<BotsifyResponse> {
    return this.post('/file-search/delete-multiple', { ids })
  }

  /**
   * Get web search
   */
  async getWebSearch(): Promise<BotsifyResponse> {
    return this.get('/web-search')
  }

  /**
   * Create web search
   */
  async createWebSearch(url: string, title?: string): Promise<BotsifyResponse> {
    const payload = { url, ...(title && { title }) }
    return this.post('/web-search', payload)
  }

  /**
   * Delete all web search
   */
  async deleteAllWebSearch(ids: string[]): Promise<BotsifyResponse> {
    return this.post('/web-search/delete-multiple', { ids })
  }

  /**
   * Upload file
   */
  async uploadFileNew(file: File): Promise<BotsifyResponse> {
    const formData = this.createFormData({ file })
    return this.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds timeout for file upload
    })
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFilesNew(files: File[]): Promise<BotsifyResponse> {
    const formData = new FormData()
    const apiKey = this.getApiKey()
    formData.append('apikey', apiKey)
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    return this.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000 // 2 minutes timeout for multiple file upload
    })
  }

  /**
   * Save bot templates
   */
  async saveBotTemplates(payload: Record<string, unknown>): Promise<BotsifyResponse> {
    return this.post('/bot/templates', payload)
  }

  /**
   * Clear agent conversion
   */
  async clearAgentConversion(payload: Record<string, unknown>): Promise<BotsifyResponse> {
    return this.post('/agent/clear-conversion', payload)
  }

  /**
   * Delete AI prompt version
   */
  async deleteAiPromptVersion(versionIds: number[]): Promise<BotsifyResponse> {
    const payload: DeleteVersionPayload = { version_id: versionIds[0] } // Assuming versionIds is an array of one number
    return this.post('/ai-prompt/delete-versions', payload)
  }

  /**
   * Manage billing
   */
  async manageBilling(): Promise<BotsifyResponse> {
    return this.get('/billing')
  }
}

// Export singleton instance
export const botsifyApi = new BotsifyApiService() 
