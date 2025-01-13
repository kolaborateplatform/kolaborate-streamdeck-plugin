const encryption = require('../../src/core/encryption');
const config = require('../../src/core/config');

describe('Encryption Service', () => {
  let originalKey;

  beforeAll(() => {
    // Store original encryption key
    originalKey = process.env.ENCRYPTION_KEY;
  });

  afterAll(() => {
    // Restore original encryption key
    process.env.ENCRYPTION_KEY = originalKey;
  });

  beforeEach(() => {
    // Generate new key for each test
    process.env.ENCRYPTION_KEY = encryption.generateKey();
  });

  describe('encrypt', () => {
    it('should encrypt a string message', () => {
      const message = 'test message';
      const encrypted = encryption.encrypt(message);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(message);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encryptedData
    });

    it('should encrypt an object message', () => {
      const message = { test: 'data', number: 123 };
      const encrypted = encryption.encrypt(message);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should throw error if message is undefined', () => {
      expect(() => encryption.encrypt(undefined)).toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string message', () => {
      const message = 'test message';
      const encrypted = encryption.encrypt(message);
      const decrypted = encryption.decrypt(encrypted);
      
      expect(decrypted).toBe(message);
    });

    it('should decrypt an encrypted object message', () => {
      const message = { test: 'data', number: 123 };
      const encrypted = encryption.encrypt(message);
      const decrypted = encryption.decrypt(encrypted);
      
      expect(decrypted).toEqual(message);
    });

    it('should throw error for invalid encrypted message format', () => {
      expect(() => encryption.decrypt('invalid')).toThrow();
      expect(() => encryption.decrypt('invalid:format')).toThrow();
    });

    it('should throw error for tampered encrypted message', () => {
      const message = 'test message';
      const encrypted = encryption.encrypt(message);
      const [iv, authTag, data] = encrypted.split(':');
      
      // Tamper with the encrypted data
      const tamperedEncrypted = `${iv}:${authTag}:${data}tampered`;
      
      expect(() => encryption.decrypt(tamperedEncrypted)).toThrow();
    });
  });

  describe('generateKey', () => {
    it('should generate a key of correct length', () => {
      const key = encryption.generateKey();
      const keyLength = config.get('encryption.keyLength') * 2; // Hex encoded
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key).toHaveLength(keyLength);
    });

    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(encryption.generateKey());
      }
      
      expect(keys.size).toBe(100);
    });
  });

  describe('hash', () => {
    it('should generate consistent hashes for same input', () => {
      const message = 'test message';
      const hash1 = encryption.hash(message);
      const hash2 = encryption.hash(message);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = encryption.hash('message1');
      const hash2 = encryption.hash('message2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hmac', () => {
    it('should generate consistent HMACs for same input and key', () => {
      const message = 'test message';
      const key = 'test key';
      const hmac1 = encryption.hmac(message, key);
      const hmac2 = encryption.hmac(message, key);
      
      expect(hmac1).toBe(hmac2);
    });

    it('should generate different HMACs for different keys', () => {
      const message = 'test message';
      const hmac1 = encryption.hmac(message, 'key1');
      const hmac2 = encryption.hmac(message, 'key2');
      
      expect(hmac1).not.toBe(hmac2);
    });
  });
});