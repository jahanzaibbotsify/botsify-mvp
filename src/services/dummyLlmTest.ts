// Dummy LLM responses for testing the complete flow
export const createDummyLLMResponse = (prompt: string, filters: Record<string, any>) => {
  console.log('🤖 [DUMMY LLM] Processing prompt:', prompt)
  console.log('🔧 [DUMMY LLM] Available filters:', filters)
  
  // Simulate LLM decision making based on prompt keywords
  let toolCall: any = null
  
  if (prompt.toLowerCase().includes('user') || prompt.toLowerCase().includes('customer')) {
    toolCall = {
      name: 'get_users',
      parameters: {
        status: filters.status || 'all',
        platform: filters.platform || 'all',
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        limit: 100
      }
    }
    console.log('🎯 [DUMMY LLM] Selected tool: get_users')
  } 
  else if (prompt.toLowerCase().includes('conversation') || prompt.toLowerCase().includes('chat') || prompt.toLowerCase().includes('message')) {
    toolCall = {
      name: 'get_conversations',
      parameters: {
        status: filters.status || 'all',
        platform: filters.platform || 'all',
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        satisfactionRating: prompt.toLowerCase().includes('satisfaction') ? 4.0 : null
      }
    }
    console.log('🎯 [DUMMY LLM] Selected tool: get_conversations')
  }
  else if (prompt.toLowerCase().includes('agent') || prompt.toLowerCase().includes('bot') || prompt.toLowerCase().includes('performance')) {
    toolCall = {
      name: 'get_agents_performance',
      parameters: {
        agentType: prompt.toLowerCase().includes('sales') ? 'sales' : 
                   prompt.toLowerCase().includes('support') ? 'support' : 'all',
        metric: prompt.toLowerCase().includes('response') ? 'response_time' :
                prompt.toLowerCase().includes('satisfaction') ? 'satisfaction' : 'all',
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null
      }
    }
    console.log('🎯 [DUMMY LLM] Selected tool: get_agents_performance')
  }
  else if (prompt.toLowerCase().includes('analytic') || prompt.toLowerCase().includes('overview') || prompt.toLowerCase().includes('metric')) {
    toolCall = {
      name: 'get_analytics_overview',
      parameters: {
        metrics: ['users', 'conversations', 'satisfaction', 'response_time', 'platform_usage'],
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null
      }
    }
    console.log('🎯 [DUMMY LLM] Selected tool: get_analytics_overview')
  }
  else {
    // Default to users if unclear
    toolCall = {
      name: 'get_users',
      parameters: {
        status: filters.status || 'all',
        platform: filters.platform || 'all',
        limit: 50
      }
    }
    console.log('🎯 [DUMMY LLM] Default tool selected: get_users')
  }
  
  return {
    tool_calls: [toolCall],
    message: `Selected ${toolCall.name} based on the prompt analysis`,
    reasoning: `The prompt "${prompt}" indicates a request for ${toolCall.name.replace('get_', '').replace('_', ' ')} data`
  }
}

// Test scenarios for demonstration
export const TEST_SCENARIOS = [
  {
    prompt: 'Show me all active users from last month',
    filters: { status: 'active', dateFrom: '2024-01-01' },
    expectedTool: 'get_users'
  },
  {
    prompt: 'Get conversation analytics with high satisfaction rates',
    filters: { status: 'all', platform: 'all' },
    expectedTool: 'get_conversations'
  },
  {
    prompt: 'List agents with response time under 2 seconds',
    filters: { platform: 'all' },
    expectedTool: 'get_agents_performance'
  },
  {
    prompt: 'Show me performance metrics and analytics overview',
    filters: { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
    expectedTool: 'get_analytics_overview'
  }
]