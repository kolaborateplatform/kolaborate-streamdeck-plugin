const path = require('path');
const crypto = require('crypto');

// Default configuration values
const defaults = {
  development: {
    logLevel: 'debug',
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
    },
    websocket: {
      port: 12345,
      heartbeatInterval: 30000,
      reconnectAttempts: 5,
    },
    security: {
      maxMessageSize: 1048576, // 1MB
      rateLimiting: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
      },
    },
    nativeMessaging: {
      maxMessageSize: 1048576, // 1MB
      timeout: 5000, // 5 seconds
    },
  },
  production: {
    logLevel: 'info',
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
    },
    websocket: {
      port: 12345,
      heartbeatInterval: 30000,
      reconnectAttempts: 3,
    },
    security: {
      maxMessageSize: 524288, // 512KB
      rateLimiting: {
        windowMs: 60000, // 1 minute
        maxRequests: 50,
      },
    },
    nativeMessaging: {
      maxMessageSize: 524288, // 512KB
      timeout: 3000, // 3 seconds
    },
  },
  test: {
    logLevel: 'debug',
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
    },
    websocket: {
      port: 12346,
      heartbeatInterval: 1000,
      reconnectAttempts: 1,
    },
    security: {
      maxMessageSize: 1048576, // 1MB
      rateLimiting: {
        windowMs: 1000, // 1 second
        maxRequests: 1000,
      },
    },
    nativeMessaging: {
      maxMessageSize: 1048576, // 1MB
      timeout: 1000, // 1 second
    },
  },
};

class Config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = { ...defaults[this.env] };
    
    // Generate encryption key if not exists
    if (!process.env.ENCRYPTION_KEY) {
      this.generateEncryptionKey();
    }
    
    // Load environment-specific configuration
    this.loadEnvConfig();
  }

  // Generate a secure encryption key
  generateEncryptionKey() {
    const key = crypto.randomBytes(this.config.encryption.keyLength);
    process.env.ENCRYPTION_KEY = key.toString('hex');
  }

  // Load configuration from environment variables
  loadEnvConfig() {
    // Map environment variables to configuration
    const envMapping = {
      LOG_LEVEL: 'logLevel',
      WEBSOCKET_PORT: 'websocket.port',
      HEARTBEAT_INTERVAL: 'websocket.heartbeatInterval',
      MAX_MESSAGE_SIZE: 'security.maxMessageSize',
      RATE_LIMIT_WINDOW: 'security.rateLimiting.windowMs',
      RATE_LIMIT_MAX: 'security.rateLimiting.maxRequests',
    };

    // Apply environment variables if they exist
    Object.entries(envMapping).forEach(([envKey, configPath]) => {
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        this.setConfigValue(configPath, this.parseEnvValue(envValue));
      }
    });
  }

  // Helper to set nested configuration values
  setConfigValue(path, value) {
    const parts = path.split('.');
    let current = this.config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  // Parse environment variable values to appropriate types
  parseEnvValue(value) {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    if (!isNaN(value)) return Number(value);
    return value;
  }

  // Get configuration value
  get(key, defaultValue = null) {
    const parts = key.split('.');
    let current = this.config;
    
    for (const part of parts) {
      if (current === undefined) return defaultValue;
      current = current[part];
    }
    
    return current === undefined ? defaultValue : current;
  }

  // Get all configuration
  getAll() {
    return { ...this.config };
  }

  // Get environment
  getEnv() {
    return this.env;
  }

  // Check if in production
  isProduction() {
    return this.env === 'production';
  }

  // Check if in development
  isDevelopment() {
    return this.env === 'development';
  }

  // Check if in test
  isTest() {
    return this.env === 'test';
  }
}

// Export a singleton instance
module.exports = new Config();