// MCP (Model Context Protocol) Types

export interface MCPConnection {
  id: string;
  serverId: string;
  serverName: string;
  apiKey?: string;
  botId?: number;
  isConnected: boolean;
  connectedAt?: Date;
  lastUsed?: Date;
  systemPrompt?: string;
  connectionUrl?: string;
  authMethod?: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'none';
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  apiKeyRequired?: boolean;
  allowed_tools?: string[];
  isPopular?: boolean;
  server_url?: string;
  isCustom?: boolean;
  connectionId?: number;
  authMethod?: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'none';
  authLabel?: string;
}

export interface CustomMCPServerForm {
  name: string;
  description: string;
  category: string;
  icon: string;
  connectionUrl: string;
  authMethod: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'none';
  authLabel: string;
  features: string[];
}

// MCP Configuration Types
export interface MCPConfigurationFile {
  servers: MCPServer[];
  connections: MCPConnection[];
}

// MCP JSON-RPC Types
export interface MCPJsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  id: number;
  params: Record<string, unknown>;
}

export interface MCPJsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// MCP Tool Call Types
export interface MCPToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolCallRequest extends Omit<MCPJsonRpcRequest, 'params'> {
  method: "tools/call";
  params: MCPToolCallParams;
}

// Shopify-specific Types
export interface ShopifyMCPServer extends MCPServer {
  id: 'shopify';
  domain?: string;
  shopifyAuthMethod?: 'none' | 'bearer_token' | 'api_key';
}

export interface ShopifyToolCallParams {
  name: "search_shop_catalog";
  arguments: {
    query: string;
    context: string;
  };
}

export interface ShopifyToolCallRequest extends Omit<MCPJsonRpcRequest, 'params'> {
  method: "tools/call";
  params: ShopifyToolCallParams;
}

// MCP Connection Parameters
export interface MCPConnectionParams {
  domain?: string;
  authMethod?: 'none' | 'bearer_token' | 'api_key';
}

// MCP Validation Types
export interface MCPValidationResult {
  serverStatus: 'reachable' | 'unreachable' | 'auth_required' | 'format_validated' | 'simulated_validation' | 'local_validated';
  responseTime: number;
  serverInfo?: unknown;
  authRequired?: boolean;
  note?: string;
  errorType?: 'missing_api_key' | 'invalid_format' | 'timeout' | 'connection_failed' | 'cors_error' | 'network_error' | 'auth_failed' | 'not_found' | 'unknown';
}

// MCP Headers Types
export interface MCPHeaders {
  'Authorization'?: string;
  'X-API-Key'?: string;
  'X-Shopify-Access-Token'?: string;
  'Content-Type'?: string;
  'Notion-Version'?: string;
  [key: string]: string | undefined;
}

// MCP Server Configuration Types
export interface MCPServerConfig {
  serverId: string;
  serverName: string;
  connectionUrl?: string;
  apiKey?: string;
  authMethod?: string;
  domain?: string;
  features?: string[];
}

// MCP Payload Types
export interface MCPConfigurationPayload {
  settings: {
    apikey: string;
    type: "mcp";
    server_label: string;
    server_url: string;
    headers: MCPHeaders;
    allowed_tools: string[];
    require_approval: "never";
  };
  apikey: string;
}

// MCP Store Types
export interface MCPStoreState {
  servers: MCPServer[];
  connectedServers: MCPServer[];
}

export interface MCPStoreActions {
  addCustomServer: (formData: CustomMCPServerForm) => MCPServer;
  removeServer: (server: MCPServer) => void;
  getCombinedSystemPrompt: () => string;
  generateDefaultSystemPrompt: (server: MCPServer) => string;
  getConnectedMCPs: () => Promise<{ success: boolean; message: string }>;
}

export type MCPStore = MCPStoreState & MCPStoreActions; 