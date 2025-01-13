const crypto = require('crypto');
const config = require('./config');
const logger = require('./logger');

class EncryptionService {
  constructor() {
    this.algorithm = config.get('encryption.algorithm');
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  /**
   * Encrypt a message
   * @param {string|object} message - Message to encrypt
   * @returns {string} Encrypted message in format: iv:authTag:encryptedData
   */
  encrypt(message) {
    try {
      // Convert message to string if it's an object
      const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
      
      // Generate a random initialization vector
      const iv = crypto.randomBytes(12);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Encrypt the message
      let encrypted = cipher.update(messageStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt a message
   * @param {string} encryptedMessage - Message to decrypt (format: iv:authTag:encryptedData)
   * @returns {string|object} Decrypted message
   */
  decrypt(encryptedMessage) {
    try {
      // Split the message into its components
      const [ivHex, authTagHex, encryptedData] = encryptedMessage.split(':');
      
      if (!ivHex || !authTagHex || !encryptedData) {
        throw new Error('Invalid encrypted message format');
      }
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the message
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Try to parse as JSON if possible
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate a secure random key
   * @returns {string} Hex-encoded key
   */
  static generateKey() {
    return crypto.randomBytes(config.get('encryption.keyLength')).toString('hex');
  }

  /**
   * Hash a message using SHA-256
   * @param {string} message - Message to hash
   * @returns {string} Hashed message
   */
  static hash(message) {
    return crypto
      .createHash('sha256')
      .update(message)
      .digest('hex');
  }

  /**
   * Create an HMAC for message authentication
   * @param {string} message - Message to authenticate
   * @param {string} key - Key to use for HMAC
   * @returns {string} HMAC of the message
   */
  static hmac(message, key) {
    return crypto
      .createHmac('sha256', key)
      .update(message)
      .digest('hex');
  }
}

module.exports = new EncryptionService();