import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorService {
  // Generate new 2FA secret
  static generateSecret(email: string): {
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } {
    const secret = speakeasy.generateSecret({
      name: `The Plant Store (${email})`,
      issuer: 'The Plant Store',
      length: 32
    });

    const backupCodes = this.generateBackupCodes();
    
    return {
      secret: secret.base32!,
      qrCode: secret.otpauth_url!,
      backupCodes
    };
  }

  // Verify 2FA token
  static verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (60 seconds) for clock skew
    });
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(speakeasy.generateSecret({ length: 20 }).base32!.slice(0, 8));
    }
    return codes;
  }

  // Generate QR code data URL
  static async generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Validate backup code format
  static isValidBackupCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  // Check if 2FA is required for user
  static is2FARequired(user: any): boolean {
    return user?.twoFactorEnabled === true && user?.twoFactorVerified !== true;
  }
} 