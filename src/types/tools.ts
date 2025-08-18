// Tools configuration for LLM
export interface BotsifyTool {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export interface ToolCall {
  name: string
  parameters: Record<string, any>
}

export interface LLMToolResponse {
  tool_calls?: ToolCall[]
  message?: string
  error?: string
}

// Available Botsify API tools
export const BOTSIFY_TOOLS: BotsifyTool[] = [
  {
    name: "get_users",
    description: "Retrieve user data with optional filtering by status, date range, and platform",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["all", "active", "inactive", "pending"],
          description: "Filter users by status"
        },
        dateFrom: {
          type: "string",
          format: "date",
          description: "Start date for filtering users (YYYY-MM-DD)"
        },
        dateTo: {
          type: "string", 
          format: "date",
          description: "End date for filtering users (YYYY-MM-DD)"
        },
        platform: {
          type: "string",
          enum: ["all", "web", "mobile", "facebook", "whatsapp", "telegram"],
          description: "Filter users by platform"
        },
        limit: {
          type: "number",
          description: "Maximum number of users to return",
          default: 100
        }
      }
    }
  },
  {
    name: "get_conversations",
    description: "Retrieve conversation data with filtering options",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["all", "active", "closed", "pending"],
          description: "Filter conversations by status"
        },
        dateFrom: {
          type: "string",
          format: "date",
          description: "Start date for filtering conversations"
        },
        dateTo: {
          type: "string",
          format: "date", 
          description: "End date for filtering conversations"
        },
        platform: {
          type: "string",
          enum: ["all", "web", "mobile", "facebook", "whatsapp", "telegram"],
          description: "Filter conversations by platform"
        },
        satisfactionRating: {
          type: "number",
          minimum: 1,
          maximum: 5,
          description: "Minimum satisfaction rating"
        }
      }
    }
  },
  {
    name: "get_agents_performance",
    description: "Retrieve agent performance metrics and analytics",
    parameters: {
      type: "object",
      properties: {
        dateFrom: {
          type: "string",
          format: "date",
          description: "Start date for performance data"
        },
        dateTo: {
          type: "string",
          format: "date",
          description: "End date for performance data"
        },
        agentType: {
          type: "string",
          enum: ["all", "support", "sales", "general"],
          description: "Filter by agent type"
        },
        metric: {
          type: "string",
          enum: ["response_time", "satisfaction", "conversations", "all"],
          description: "Specific metric to retrieve"
        }
      }
    }
  },
  {
    name: "get_analytics_overview",
    description: "Get general analytics and KPI overview",
    parameters: {
      type: "object",
      properties: {
        dateFrom: {
          type: "string",
          format: "date",
          description: "Start date for analytics"
        },
        dateTo: {
          type: "string",
          format: "date",
          description: "End date for analytics"
        },
        metrics: {
          type: "array",
          items: {
            type: "string",
            enum: ["users", "conversations", "satisfaction", "response_time", "platform_usage"]
          },
          description: "Specific metrics to include"
        }
      }
    }
  }
]