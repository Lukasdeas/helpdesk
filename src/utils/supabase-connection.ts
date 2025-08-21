import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials, validateConfig } from './supabase/info';

export interface ConnectionResult {
  success: boolean;
  client?: any;
  apiBaseUrl?: string;
  error?: string;
}

// Helper function to create timeout signal
const createTimeoutSignal = (timeout: number): AbortSignal | undefined => {
  try {
    // Try modern AbortSignal.timeout if available
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      return AbortSignal.timeout(timeout);
    }
    
    // Fallback to AbortController
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), timeout);
      return controller.signal;
    }
  } catch (error) {
    console.warn('AbortSignal not available, continuing without timeout');
  }
  
  return undefined;
};

export const initializeSupabaseConnection = async (): Promise<ConnectionResult> => {
  try {
    console.log('🔧 Checking Supabase configuration...');
    
    const configValidation = validateConfig();
    console.log('📋 Config validation:', configValidation);
    
    if (!configValidation.isValid) {
      return {
        success: false,
        error: `Configuration invalid: ${configValidation.issues.join(', ')}`
      };
    }

    const credentials = getSupabaseCredentials();
    console.log('🔗 Attempting to connect with valid credentials');
    
    // Create Supabase client
    const client = createClient(credentials.url, credentials.anonKey);
    const apiBaseUrl = `${credentials.url}/functions/v1/make-server-577f6020`;
    
    // Test connection with health check
    const healthRequestOptions: RequestInit = {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${credentials.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    // Add timeout signal if available
    const timeoutSignal = createTimeoutSignal(10000);
    if (timeoutSignal) {
      healthRequestOptions.signal = timeoutSignal;
    }

    const healthResponse = await fetch(`${apiBaseUrl}/health`, healthRequestOptions);
    
    if (!healthResponse.ok) {
      const errorText = await healthResponse.text();
      return {
        success: false,
        error: `Health check failed: ${healthResponse.status} - ${errorText}`
      };
    }

    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Initialize database
    const initRequestOptions: RequestInit = {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${credentials.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    // Add timeout signal if available
    const initTimeoutSignal = createTimeoutSignal(15000);
    if (initTimeoutSignal) {
      initRequestOptions.signal = initTimeoutSignal;
    }

    const initResponse = await fetch(`${apiBaseUrl}/init`, initRequestOptions);
    
    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      return {
        success: false,
        error: `Database initialization failed: ${errorText}`
      };
    }

    const initData = await initResponse.json();
    console.log('✅ Database initialized:', initData);
    
    return {
      success: true,
      client,
      apiBaseUrl
    };
  } catch (error: any) {
    console.error('❌ Connection error:', error);
    return {
      success: false,
      error: `Network error: ${error.message || 'Unknown error'}`
    };
  }
};

export const testSupabaseConnection = async (): Promise<ConnectionResult> => {
  try {
    const configValidation = validateConfig();
    
    if (!configValidation.isValid) {
      return {
        success: false,
        error: `Invalid configuration: ${configValidation.issues.join(', ')}`
      };
    }
    
    const credentials = getSupabaseCredentials();
    const healthUrl = `${credentials.url}/functions/v1/make-server-577f6020/health`;
    
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${credentials.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    // Add timeout signal if available
    const timeoutSignal = createTimeoutSignal(10000);
    if (timeoutSignal) {
      requestOptions.signal = timeoutSignal;
    }

    const response = await fetch(healthUrl, requestOptions);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection test passed:', data);
      return { success: true };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Connection failed: ${response.status} - ${errorText}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Network error: ${error.message || 'Unknown error'}`
    };
  }
};