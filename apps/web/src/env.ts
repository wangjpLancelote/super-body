// Environment variables configuration
// Import these variables from your .env.local file

// Supabase Configuration
export const supabase = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// API Configuration
export const api = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
};

// Authentication Configuration
export const auth = {
  cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'sb-auth-token',
  sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '1800000'), // 30 minutes in ms
  maxAge: parseInt(process.env.NEXT_PUBLIC_AUTH_MAX_AGE || '604800'), // 7 days in seconds
};

// File Upload Configuration
export const upload = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB in bytes
  allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'text/plain',
  ],
  storagePath: process.env.NEXT_PUBLIC_STORAGE_PATH || 'public/files',
};

// Application Configuration
export const app = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Super Body',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  locale: process.env.NEXT_PUBLIC_LOCALE || 'en',
};

// Analytics and Monitoring Configuration
export const monitoring = {
  enabled: process.env.NEXT_PUBLIC_MONITORING_ENABLED === 'true',
  endpoint: process.env.NEXT_PUBLIC_MONITORING_ENDPOINT,
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_MONITORING_SAMPLE_RATE || '1.0'),
};

// Rate Limiting Configuration
export const rateLimit = {
  enabled: process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED !== 'false',
  windowMs: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_MAX || '100'),
};

// CORS Configuration
export const cors = {
  origin: process.env.NEXT_PUBLIC_CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://yourdomain.com',
  ],
  credentials: process.env.NEXT_PUBLIC_CORS_CREDENTIALS !== 'false',
};

// Development Configuration
export const dev = {
  mockData: process.env.NEXT_PUBLIC_MOCK_DATA === 'true',
  delay: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '0'),
};

// Validation
if (!supabase.url || !supabase.anonKey) {
  throw new Error('Missing required Supabase configuration');
}

// Export all configurations as a single object
export const config = {
  supabase,
  api,
  auth,
  upload,
  app,
  monitoring,
  rateLimit,
  cors,
  dev,
};

// Helper function to get environment variable with fallback
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  return value || fallback || '';
}

// Helper function to validate environment variables
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

// Initialize environment validation
if (typeof window === 'undefined') {
  // Only validate on server side
  validateEnvironment();
}