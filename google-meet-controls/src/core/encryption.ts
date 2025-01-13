import CryptoJS from 'crypto-js';

export class EncryptionService {
  private readonly key: string;
  
  constructor() {
    // In production, this should be securely generated and stored
    this.key = 'your-secret-key-here';
  }

  public encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.key).toString();
  }

  public decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  public generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
} 