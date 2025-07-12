
// Configuration task interface
export interface ConfigurationTask {
    key: string;
    value: string;
  }
  
  // Configuration response interface
  export interface ConfigurationResponse {
    success: boolean;
    message: string;
    data?: ConfigurationResponseData;
  }
  
  // Configuration response data interface
  export interface ConfigurationResponseData {
    id?: string;
    status?: string;
    updated_at?: string;
    [key: string]: unknown;
  }
  
  // API request data interface
  export interface ApiRequestData {
    language?: string;
    logo_url?: string;
    color_scheme?: string;
    status?: string;
    message?: string;
    name?: string;
    action: string;
  }
  
  // Chat message interface
  export interface ChatMessage {
    role: string;
    content: string;
  }
  
  export interface OpenAIStreamResponse {
    delta?: string; 
    type?: string; 
    function?: { 
        name: string; 
        arguments: string 
    }
  }
  
  // Error interface
  export interface ApiError extends Error {
    status?: number;
    code?: string;
  }
  
  // OpenAI client instance - NOT reactive to avoid private member access issues