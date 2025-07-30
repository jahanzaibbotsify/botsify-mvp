import axios from 'axios'
import type { LLMResponse } from '@/types/dataAnalysis'
import type { LLMToolResponse } from '@/types/tools'
import { BOTSIFY_TOOLS } from '@/types/tools'

// LLM API service for data analysis
class LLMApiService {
  private readonly baseURL = 'http://deepseek.saasbakers.com'

  async sendPromptWithTools(prompt: string, filters: Record<string, any>): Promise<LLMResponse> {
    try {
      console.log('🚀 [LLM API] Starting request to:', this.baseURL)
      console.log('📝 [LLM API] Prompt:', prompt)
      console.log('🔧 [LLM API] Filters:', filters)
      
      // For testing purposes, use dummy response instead of real API
      // Remove this block when real API is available
      if (this.baseURL.includes('deepseek.saasbakers.com')) {
        console.log('🧪 [TESTING MODE] Using dummy LLM response')
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { createDummyLLMResponse } = await import('./dummyLlmTest')
        const dummyResponse = createDummyLLMResponse(prompt, filters)
        
        console.log('🤖 [TESTING] Dummy LLM response:', dummyResponse)
        
        return {
          success: true,
          data: dummyResponse,
          message: '[DUMMY] Prompt processed successfully'
        }
      }
      
      // Real API call (when available)
      const enhancedPrompt = this.createToolsPrompt(prompt, filters)
      
      const response = await axios.post(`${this.baseURL}/llama-handler`, {
        prompt: enhancedPrompt
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      })

      // Parse the LLM response to extract tool calls
      const toolResponse = this.parseLLMResponse(response.data)

      return {
        success: true,
        data: toolResponse,
        message: 'Prompt processed successfully'
      }
    } catch (error: any) {
      console.error('❌ [LLM API] Error:', error)
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Please try again.',
          message: 'The request took too long to complete.'
        }
      }
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || 'LLM API error',
          message: `HTTP ${error.response.status}: ${error.response.statusText}`
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to connect to LLM service',
        message: 'Please check your network connection and try again.'
      }
    }
  }

  private createToolsPrompt(userPrompt: string, filters: Record<string, any>): string {
    const toolsJson = JSON.stringify(BOTSIFY_TOOLS, null, 2)
    const filtersJson = JSON.stringify(filters, null, 2)
    
    return `You are a data analysis assistant with access to Botsify API tools. Based on the user's request, you need to select the appropriate tool and provide the parameters.

Available Tools:
${toolsJson}

User Filters Applied:
${filtersJson}

User Request: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request to determine which tool(s) to use
2. Use the applied filters as default parameters where applicable
3. Return ONLY a JSON response in this exact format:

{
  "tool_call": {
    "name": "tool_name_here",
    "parameters": {
      "param1": "value1",
      "param2": "value2"
    }
  },
  "reasoning": "Brief explanation of why this tool was selected"
}

IMPORTANT: 
- Return ONLY valid JSON, no other text
- Use the exact tool names from the available tools
- Merge user filters with any additional parameters needed
- If requesting users, use "get_users"
- If requesting conversations, use "get_conversations" 
- If requesting agent performance, use "get_agents_performance"
- If requesting general analytics, use "get_analytics_overview"`
  }

  private parseLLMResponse(responseData: any): LLMToolResponse {
    try {
      console.log('🔍 [LLM Parser] Raw response data:', responseData)
      
      // The LLM should return JSON, but let's handle various response formats
      let jsonResponse: any

      if (typeof responseData === 'string') {
        // Try to extract JSON from string response
        const jsonMatch = responseData.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } else if (typeof responseData === 'object') {
        jsonResponse = responseData
      } else {
        throw new Error('Invalid response format')
      }

      console.log('📋 [LLM Parser] Parsed JSON:', jsonResponse)

      // Handle both formats: tool_call (singular) and tool_calls (plural)
      if (jsonResponse.tool_calls && Array.isArray(jsonResponse.tool_calls) && jsonResponse.tool_calls.length > 0) {
        // Format from dummy response
        console.log('✅ [LLM Parser] Found tool_calls array')
        return {
          tool_calls: jsonResponse.tool_calls,
          message: jsonResponse.message || jsonResponse.reasoning || 'Tool selected successfully'
        }
      } else if (jsonResponse.tool_call && jsonResponse.tool_call.name) {
        // Format from real LLM response
        console.log('✅ [LLM Parser] Found single tool_call')
        return {
          tool_calls: [jsonResponse.tool_call],
          message: jsonResponse.reasoning || 'Tool selected successfully'
        }
      } else {
        console.error('❌ [LLM Parser] No valid tool call found in:', jsonResponse)
        throw new Error('No valid tool call found in response')
      }
    } catch (error) {
      console.error('❌ [LLM Parser] Error parsing response:', error)
      console.error('❌ [LLM Parser] Original data:', responseData)
      return {
        error: 'Failed to parse LLM response. The AI may not have returned a valid tool call.',
        message: 'Please try rephrasing your request.'
      }
    }
  }

  // Legacy method for backward compatibility
  async sendPrompt(prompt: string): Promise<LLMResponse> {
    return this.sendPromptWithTools(prompt, {})
  }
}

export const llmApi = new LLMApiService()