import OpenAI from 'openai';

/**
 * Debug utility for OpenAI SDK setup
 * Use this to verify SDK version, client initialization, and API availability
 */
export class OpenAIDebugger {
  static logSDKInfo() {
    console.group('🔍 OpenAI SDK Debug Information');
    
    try {
      // Check if OpenAI is available
      console.log('✅ OpenAI SDK imported successfully');
      console.log('OpenAI constructor:', typeof OpenAI);
      
      // Try to create a client (without API key for structure check)
      const testClient = new OpenAI({
        apiKey: 'test-key',
        dangerouslyAllowBrowser: true
      });
      
      console.log('✅ OpenAI client created successfully');
      console.log('Client type:', typeof testClient);
      console.log('Has responses API:', !!testClient.responses);
      console.log('Has completions API:', !!testClient.completions);
      console.log('Has chat API:', !!testClient.chat);
      
      // Check available methods on responses
      if (testClient.responses) {
        console.log('Responses API methods:', Object.getOwnPropertyNames(testClient.responses));
        console.log('Has responses.create:', typeof testClient.responses.create);
      }
      
    } catch (error) {
      console.error('❌ Error during SDK check:', error);
    }
    
    console.groupEnd();
  }

  static async testConnection(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey === 'test-key') {
      console.warn('⚠️ No valid API key provided for connection test');
      return false;
    }

    console.group('🔗 Testing OpenAI Connection');
    
    try {
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      console.log('✅ Client initialized with real API key');
      
      // Test a simple non-streaming call first
      const testResponse = await client.responses.create({
        model: 'gpt-4o',
        input: 'Hello, this is a test message.',
        instructions: 'Reply with "Connection test successful"',
        stream: false,
        max_output_tokens: 50
      });

      console.log('✅ Connection test successful:', !!testResponse);
      console.log('Response type:', typeof testResponse);
      
      return true;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      return false;
    } finally {
      console.groupEnd();
    }
  }

  static clearCache() {
    console.log('🧹 Clearing browser cache for OpenAI SDK...');
    
    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('openai') || key.includes('vite')) {
        localStorage.removeItem(key);
        console.log(`Cleared: ${key}`);
      }
    });
    
    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('openai') || key.includes('vite')) {
        sessionStorage.removeItem(key);
        console.log(`Cleared session: ${key}`);
      }
    });
    
    console.log('✅ Cache cleared. Please refresh the page.');
  }

  static logEnvironment() {
    console.group('🌍 Environment Information');
    
    console.log('User Agent:', navigator.userAgent);
    console.log('Browser:', {
      chrome: !!(window as any).chrome,
      firefox: navigator.userAgent.includes('Firefox'),
      safari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
    });
    
    console.log('Environment Variables:');
    console.log('- VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
    console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('- DEV mode:', import.meta.env.DEV);
    
    console.log('Browser APIs:');
    console.log('- fetch available:', typeof fetch);
    console.log('- localStorage available:', typeof localStorage);
    console.log('- crypto available:', typeof crypto);
    console.log('- crypto.getRandomValues available:', typeof crypto?.getRandomValues);
    
    console.groupEnd();
  }

  static runFullDiagnostic(apiKey?: string) {
    console.log('🚀 Running full OpenAI SDK diagnostic...');
    
    this.logEnvironment();
    this.logSDKInfo();
    
    if (apiKey) {
      this.testConnection(apiKey).then(success => {
        if (success) {
          console.log('✅ All diagnostics passed!');
        } else {
          console.log('❌ Connection test failed. Check your API key and network.');
        }
      });
    } else {
      console.log('⚠️ No API key provided. Skipping connection test.');
      console.log('💡 To test connection, call: OpenAIDebugger.testConnection("your-api-key")');
    }
  }
}

// // Auto-run basic diagnostics in development
// if (import.meta.env.DEV) {
//   console.log('🔧 OpenAI Debug Utils loaded. Use OpenAIDebugger.runFullDiagnostic() to test setup.');
// } 