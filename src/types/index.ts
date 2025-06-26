export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant';
  status?: 'sending' | 'sent' | 'error';
  attachments?: Attachment[];
}

export interface PromptVersion {
  id: string;
  content: string;
  updatedAt: Date;
  version: number;
  isActive: boolean;
}

export interface Story {
  content: string;
  updatedAt: Date;
  versions: PromptVersion[];
  activeVersionId?: string;
}

export interface GlobalPromptTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
  unread?: boolean;
  story?: Story;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  preview?: string;
  uploadedUrl?: string;
  fileId?: string;
  uploadedAt?: string;
  isUploaded?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  apiKeyRequired: boolean;
  botIdRequired: boolean;
  connectionUrl?: string;
  isPopular?: boolean;
  features: string[];
  isCustom?: boolean;
  authMethod?: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'none';
  authLabel?: string;
}

export interface MCPConnection {
  id: string;
  serverId: string;
  serverName: string;
  apiKey?: string;
  botId?: string,
  isConnected: boolean;
  connectedAt?: Date;
  lastUsed?: Date;
  systemPrompt?: string;
  connectionUrl?: string;
  authMethod?: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth' | 'none';
}

export interface MCPServerConfig {
  server: MCPServer;
  connection?: MCPConnection;
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

export interface MCPConfiguration {
  id: string;
  botId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  connectedServers: {
    serverId: string;
    serverName: string;
    serverIcon: string;
    category: string;
    connectionUrl?: string;
    authMethod: string;
    hasAuthentication: boolean;
    features: string[];
    systemPrompt: string;
    connectedAt: Date;
  }[];
  combinedSystemPrompt: string;
  version: string;
}

export interface MCPConfigurationFile {
  configuration: MCPConfiguration;
  metadata: {
    generatedAt: Date;
    version: string;
    serverCount: number;
    categories: string[];
  };
}