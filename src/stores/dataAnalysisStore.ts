import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { llmApi } from '@/services/llmApi'
import { botsifyApi } from '@/services/botsifyApi'
import type { 
  DataAnalysisFilter, 
  DataAnalysisRequest, 
  DataAnalysisResponse, 
  DataAnalysisState,
  TableColumn 
} from '@/types/dataAnalysis'
import type { ToolCall } from '@/types/tools'

export const useDataAnalysisStore = defineStore('dataAnalysis', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any[]>([])
  const columns = ref<TableColumn[]>([])
  const currentRequest = ref<DataAnalysisRequest | null>(null)
  
  // No filters needed - removed filter UI completely
  const availableFilters = ref<DataAnalysisFilter[]>([])

  // Computed
  const hasData = computed(() => data.value.length > 0)
  const isEmpty = computed(() => !loading.value && data.value.length === 0)
  const hasError = computed(() => !!error.value)

  // Actions
  const analyzeData = async (prompt: string, filters: Record<string, any>) => {
    loading.value = true
    error.value = null
    
    try {
      // Store current request
      currentRequest.value = { prompt, filters }
      
      console.log('🔍 Starting data analysis with prompt:', prompt)
      console.log('📊 Applied filters:', filters)
      
      // Call LLM API with tools
      const llmResponse = await llmApi.sendPromptWithTools(prompt, filters)
      
      if (!llmResponse.success) {
        throw new Error(llmResponse.error || 'LLM API call failed')
      }
      
      console.log('🤖 LLM Response:', llmResponse.data)
      
      // Process tool calls from LLM
      const analysisResult = await processToolCalls(llmResponse.data, filters)
      
      if (analysisResult.success && analysisResult.data.length > 0) {
        data.value = analysisResult.data
        columns.value = generateColumns(analysisResult.data)
        console.log('✅ Analysis completed successfully with', analysisResult.data.length, 'records')
        console.log('📊 Generated columns:', columns.value.map(c => c.label).join(', '))
      } else {
        throw new Error(analysisResult.error || 'No data returned from analysis')
      }
      
    } catch (err: any) {
      console.error('❌ Error in data analysis:', err)
      error.value = err.message || 'An error occurred during data analysis'
      data.value = []
      columns.value = []
    } finally {
      loading.value = false
    }
  }

  const clearData = () => {
    data.value = []
    columns.value = []
    error.value = null
    currentRequest.value = null
  }

  const refreshData = async () => {
    if (currentRequest.value) {
      await analyzeData(currentRequest.value.prompt, currentRequest.value.filters)
    }
  }

  // Helper functions
  const processToolCalls = async (llmData: any, filters: Record<string, any>): Promise<DataAnalysisResponse> => {
    try {
      console.log('🔄 [Tool Processor] Processing LLM data:', llmData)
      
      // Check if LLM returned an error
      if (llmData.error) {
        console.error('❌ [Tool Processor] LLM returned error:', llmData.error)
        throw new Error(llmData.error)
      }
      
      // Check for tool calls
      if (!llmData.tool_calls || !Array.isArray(llmData.tool_calls) || llmData.tool_calls.length === 0) {
        console.error('❌ [Tool Processor] No valid tool calls found:', llmData)
        throw new Error('No tool calls returned from LLM')
      }
      
      const toolCall = llmData.tool_calls[0] // Use first tool call
      console.log('🔧 [Tool Processor] Executing tool:', toolCall.name)
      console.log('🔧 [Tool Processor] With parameters:', toolCall.parameters)
      
      // Execute the appropriate tool
      switch (toolCall.name) {
        case 'get_users':
          return await executeGetUsers(toolCall.parameters)
        case 'get_conversations':
          return await executeGetConversations(toolCall.parameters)
        case 'get_agents_performance':
          return await executeGetAgentsPerformance(toolCall.parameters)
        case 'get_analytics_overview':
          return await executeGetAnalyticsOverview(toolCall.parameters)
        default:
          console.error('❌ [Tool Processor] Unknown tool:', toolCall.name)
          throw new Error(`Unknown tool: ${toolCall.name}`)
      }
    } catch (error: any) {
      console.error('❌ [Tool Processor] Error:', error)
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to process tool calls'
      }
    }
  }

  // Tool execution functions - Enhanced with realistic dummy data
  const executeGetUsers = async (parameters: any): Promise<DataAnalysisResponse> => {
    try {
      console.log('👥 [DUMMY API] Fetching users with parameters:', parameters)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enhanced realistic mock data
      const fullMockData = [
        {
          id: 'usr_001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          status: 'active',
          platform: 'web',
          createdAt: '2024-01-15T10:30:00Z',
          lastSeen: '2024-01-21T15:45:00Z',
          conversationCount: 12,
          totalMessages: 45,
          country: 'United States',
          plan: 'Pro'
        },
        {
          id: 'usr_002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@startup.io',
          status: 'active',
          platform: 'mobile',
          createdAt: '2024-01-10T08:20:00Z',
          lastSeen: '2024-01-21T12:30:00Z',
          conversationCount: 8,
          totalMessages: 28,
          country: 'Canada',
          plan: 'Basic'
        },
        {
          id: 'usr_003',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.j@enterprise.com',
          status: 'active',
          platform: 'facebook',
          createdAt: '2024-01-12T14:15:00Z',
          lastSeen: '2024-01-21T09:20:00Z',
          conversationCount: 15,
          totalMessages: 67,
          country: 'United Kingdom',
          plan: 'Enterprise'
        },
        {
          id: 'usr_004',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.w@business.net',
          status: 'inactive',
          platform: 'whatsapp',
          createdAt: '2024-01-05T16:45:00Z',
          lastSeen: '2024-01-18T14:20:00Z',
          conversationCount: 3,
          totalMessages: 11,
          country: 'Australia',
          plan: 'Basic'
        },
        {
          id: 'usr_005',
          firstName: 'David',
          lastName: 'Chen',
          email: 'david.chen@techcorp.com',
          status: 'active',
          platform: 'telegram',
          createdAt: '2024-01-08T11:30:00Z',
          lastSeen: '2024-01-21T16:15:00Z',
          conversationCount: 20,
          totalMessages: 89,
          country: 'Singapore',
          plan: 'Pro'
        },
        {
          id: 'usr_006',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.r@marketing.co',
          status: 'pending',
          platform: 'web',
          createdAt: '2024-01-20T09:15:00Z',
          lastSeen: '2024-01-21T10:45:00Z',
          conversationCount: 1,
          totalMessages: 3,
          country: 'Spain',
          plan: 'Basic'
        }
      ]

      // Apply filters based on parameters
      let filteredData = [...fullMockData]
      
      if (parameters.status && parameters.status !== 'all') {
        filteredData = filteredData.filter(user => user.status === parameters.status)
        console.log(`📊 Filtered by status '${parameters.status}': ${filteredData.length} users`)
      }
      
      if (parameters.platform && parameters.platform !== 'all') {
        filteredData = filteredData.filter(user => user.platform === parameters.platform)
        console.log(`📱 Filtered by platform '${parameters.platform}': ${filteredData.length} users`)
      }
      
      if (parameters.dateFrom) {
        const fromDate = new Date(parameters.dateFrom)
        filteredData = filteredData.filter(user => new Date(user.createdAt) >= fromDate)
        console.log(`📅 Filtered by date from '${parameters.dateFrom}': ${filteredData.length} users`)
      }
      
      if (parameters.dateTo) {
        const toDate = new Date(parameters.dateTo)
        filteredData = filteredData.filter(user => new Date(user.createdAt) <= toDate)
        console.log(`📅 Filtered by date to '${parameters.dateTo}': ${filteredData.length} users`)
      }
      
      if (parameters.limit) {
        filteredData = filteredData.slice(0, parseInt(parameters.limit))
        console.log(`🔢 Limited to ${parameters.limit} users`)
      }

      console.log(`✅ [DUMMY API] Returning ${filteredData.length} users`)
      
      return {
        success: true,
        data: filteredData
      }
    } catch (error: any) {
      console.error('❌ [DUMMY API] Error fetching users:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }

  const executeGetConversations = async (parameters: any): Promise<DataAnalysisResponse> => {
    try {
      console.log('💬 [DUMMY API] Fetching conversations with parameters:', parameters)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const fullMockData = [
        {
          id: 'conv_001',
          userId: 'usr_001',
          userName: 'John Doe',
          messageCount: 25,
          status: 'active',
          platform: 'web',
          satisfactionRating: 4.8,
          responseTime: '1.2s',
          createdAt: '2024-01-20T10:00:00Z',
          lastMessageAt: '2024-01-21T15:30:00Z',
          topic: 'Product Support',
          resolved: true
        },
        {
          id: 'conv_002',
          userId: 'usr_002',
          userName: 'Jane Smith',
          messageCount: 15,
          status: 'active',
          platform: 'mobile',
          satisfactionRating: 4.2,
          responseTime: '2.1s',
          createdAt: '2024-01-19T14:20:00Z',
          lastMessageAt: '2024-01-21T12:45:00Z',
          topic: 'Billing Inquiry',
          resolved: false
        },
        {
          id: 'conv_003',
          userId: 'usr_003',
          userName: 'Mike Johnson',
          messageCount: 32,
          status: 'closed',
          platform: 'facebook',
          satisfactionRating: 4.9,
          responseTime: '0.8s',
          createdAt: '2024-01-18T09:15:00Z',
          lastMessageAt: '2024-01-20T16:20:00Z',
          topic: 'Technical Issue',
          resolved: true
        },
        {
          id: 'conv_004',
          userId: 'usr_004',
          userName: 'Sarah Wilson',
          messageCount: 8,
          status: 'pending',
          platform: 'whatsapp',
          satisfactionRating: 3.5,
          responseTime: '5.2s',
          createdAt: '2024-01-17T11:30:00Z',
          lastMessageAt: '2024-01-18T14:20:00Z',
          topic: 'General Inquiry',
          resolved: false
        },
        {
          id: 'conv_005',
          userId: 'usr_005',
          userName: 'David Chen',
          messageCount: 18,
          status: 'active',
          platform: 'telegram',
          satisfactionRating: 4.6,
          responseTime: '1.5s',
          createdAt: '2024-01-21T08:00:00Z',
          lastMessageAt: '2024-01-21T16:15:00Z',
          topic: 'Feature Request',
          resolved: false
        }
      ]

      // Apply filters
      let filteredData = [...fullMockData]
      
      if (parameters.status && parameters.status !== 'all') {
        filteredData = filteredData.filter(conv => conv.status === parameters.status)
        console.log(`📊 Filtered by status '${parameters.status}': ${filteredData.length} conversations`)
      }
      
      if (parameters.platform && parameters.platform !== 'all') {
        filteredData = filteredData.filter(conv => conv.platform === parameters.platform)
        console.log(`📱 Filtered by platform '${parameters.platform}': ${filteredData.length} conversations`)
      }
      
      if (parameters.satisfactionRating) {
        filteredData = filteredData.filter(conv => conv.satisfactionRating >= parameters.satisfactionRating)
        console.log(`⭐ Filtered by satisfaction >= ${parameters.satisfactionRating}: ${filteredData.length} conversations`)
      }
      
      if (parameters.dateFrom) {
        const fromDate = new Date(parameters.dateFrom)
        filteredData = filteredData.filter(conv => new Date(conv.createdAt) >= fromDate)
        console.log(`📅 Filtered by date from '${parameters.dateFrom}': ${filteredData.length} conversations`)
      }
      
      if (parameters.dateTo) {
        const toDate = new Date(parameters.dateTo)
        filteredData = filteredData.filter(conv => new Date(conv.createdAt) <= toDate)
        console.log(`📅 Filtered by date to '${parameters.dateTo}': ${filteredData.length} conversations`)
      }

      console.log(`✅ [DUMMY API] Returning ${filteredData.length} conversations`)

      return {
        success: true,
        data: filteredData
      }
    } catch (error: any) {
      console.error('❌ [DUMMY API] Error fetching conversations:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }

  const executeGetAgentsPerformance = async (parameters: any): Promise<DataAnalysisResponse> => {
    try {
      console.log('🤖 [DUMMY API] Fetching agent performance with parameters:', parameters)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const fullMockData = [
        {
          id: 'agt_001',
          name: 'Customer Support Bot',
          type: 'support',
          conversationCount: 342,
          avgResponseTime: '1.2s',
          satisfactionRate: 4.7,
          status: 'active',
          responseTimeMs: 1200,
          resolutionRate: '89%',
          uptime: '99.8%',
          createdAt: '2023-12-01T00:00:00Z'
        },
        {
          id: 'agt_002',
          name: 'Sales Assistant Pro',
          type: 'sales',
          conversationCount: 198,
          avgResponseTime: '0.8s',
          satisfactionRate: 4.9,
          status: 'active',
          responseTimeMs: 800,
          resolutionRate: '94%',
          uptime: '99.9%',
          createdAt: '2023-11-15T00:00:00Z'
        },
        {
          id: 'agt_003',
          name: 'Technical Help Bot',
          type: 'support',
          conversationCount: 267,
          avgResponseTime: '2.1s',
          satisfactionRate: 4.4,
          status: 'active',
          responseTimeMs: 2100,
          resolutionRate: '76%',
          uptime: '98.5%',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'agt_004',
          name: 'General Assistant',
          type: 'general',
          conversationCount: 156,
          avgResponseTime: '1.5s',
          satisfactionRate: 4.3,
          status: 'active',
          responseTimeMs: 1500,
          resolutionRate: '82%',
          uptime: '99.2%',
          createdAt: '2023-10-20T00:00:00Z'
        },
        {
          id: 'agt_005',
          name: 'E-commerce Bot',
          type: 'sales',
          conversationCount: 423,
          avgResponseTime: '0.9s',
          satisfactionRate: 4.8,
          status: 'active',
          responseTimeMs: 900,
          resolutionRate: '91%',
          uptime: '99.7%',
          createdAt: '2023-09-10T00:00:00Z'
        }
      ]

      // Apply filters
      let filteredData = [...fullMockData]
      
      if (parameters.agentType && parameters.agentType !== 'all') {
        filteredData = filteredData.filter(agent => agent.type === parameters.agentType)
        console.log(`🤖 Filtered by agent type '${parameters.agentType}': ${filteredData.length} agents`)
      }
      
      if (parameters.metric && parameters.metric !== 'all') {
        // Filter by performance metric thresholds
        if (parameters.metric === 'response_time') {
          filteredData = filteredData.filter(agent => agent.responseTimeMs <= 2000) // Under 2 seconds
          console.log(`⚡ Filtered by response time: ${filteredData.length} agents`)
        } else if (parameters.metric === 'satisfaction') {
          filteredData = filteredData.filter(agent => agent.satisfactionRate >= 4.5) // High satisfaction
          console.log(`⭐ Filtered by satisfaction: ${filteredData.length} agents`)
        }
      }

      console.log(`✅ [DUMMY API] Returning ${filteredData.length} agents`)

      return {
        success: true,
        data: filteredData
      }
    } catch (error: any) {
      console.error('❌ [DUMMY API] Error fetching agent performance:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }

  const executeGetAnalyticsOverview = async (parameters: any): Promise<DataAnalysisResponse> => {
    try {
      console.log('📈 [DUMMY API] Fetching analytics overview with parameters:', parameters)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const fullMockData = [
        {
          metric: 'Total Users',
          value: 1847,
          change: '+23%',
          period: 'Last 30 days',
          platform: 'All Platforms',
          category: 'users',
          trend: 'up'
        },
        {
          metric: 'Active Conversations',
          value: 156,
          change: '+15%',
          period: 'Last 30 days',
          platform: 'All Platforms',
          category: 'conversations',
          trend: 'up'
        },
        {
          metric: 'Average Response Time',
          value: '1.4s',
          change: '-18%',
          period: 'Last 30 days',
          platform: 'All Platforms',
          category: 'response_time',
          trend: 'down'
        },
        {
          metric: 'Customer Satisfaction',
          value: 4.7,
          change: '+8%',
          period: 'Last 30 days',
          platform: 'All Platforms',
          category: 'satisfaction',
          trend: 'up'
        },
        {
          metric: 'Platform Usage - Web',
          value: '45%',
          change: '+5%',
          period: 'Last 30 days',
          platform: 'Web',
          category: 'platform_usage',
          trend: 'up'
        },
        {
          metric: 'Platform Usage - Mobile',
          value: '32%',
          change: '+12%',
          period: 'Last 30 days',
          platform: 'Mobile',
          category: 'platform_usage',
          trend: 'up'
        },
        {
          metric: 'Platform Usage - Social',
          value: '23%',
          change: '-3%',
          period: 'Last 30 days',
          platform: 'Social Media',
          category: 'platform_usage',
          trend: 'down'
        },
        {
          metric: 'Resolution Rate',
          value: '87%',
          change: '+4%',
          period: 'Last 30 days',
          platform: 'All Platforms',
          category: 'resolution',
          trend: 'up'
        }
      ]

      // Apply filters based on requested metrics
      let filteredData = [...fullMockData]
      
      if (parameters.metrics && Array.isArray(parameters.metrics)) {
        filteredData = filteredData.filter(item => parameters.metrics.includes(item.category))
        console.log(`📊 Filtered by metrics: ${parameters.metrics.join(', ')}: ${filteredData.length} metrics`)
      }
      
      if (parameters.dateFrom && parameters.dateTo) {
        console.log(`📅 Date range applied: ${parameters.dateFrom} to ${parameters.dateTo}`)
        // In a real API, this would filter the time range
        // For demo, we'll just log it
      }

      console.log(`✅ [DUMMY API] Returning ${filteredData.length} analytics metrics`)

      return {
        success: true,
        data: filteredData
      }
    } catch (error: any) {
      console.error('❌ [DUMMY API] Error fetching analytics:', error)
      return {
        success: false,
        data: [],
        error: error.message
      }
    }
  }



  const generateColumns = (data: any[]): TableColumn[] => {
    if (!data || data.length === 0) return []
    
    const firstRow = data[0]
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: inferColumnType(firstRow[key]),
      sortable: true,
      filterable: true
    }))
  }

  const inferColumnType = (value: any): 'text' | 'number' | 'date' | 'boolean' | 'link' => {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') {
      if (value.includes('@')) return 'link' // Email
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date' // ISO date
      if (value.startsWith('http')) return 'link' // URL
    }
    return 'text'
  }

  return {
    // State
    loading,
    error,
    data,
    columns,
    currentRequest,
    availableFilters,
    
    // Computed
    hasData,
    isEmpty,
    hasError,
    
    // Actions
    analyzeData,
    clearData,
    refreshData
  }
})