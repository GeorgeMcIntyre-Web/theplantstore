# The Plant Store - Two-Factor Authentication (2FA) Implementation Guide

## 🔐 2FA Strategy Overview

Based on your current setup with NextAuth.js and the existing `input-otp` component, we'll implement **TOTP (Time-based One-Time Password)** using authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator.

## 🎯 Recommended 2FA Solution: TOTP

### **Why TOTP?**
- ✅ **Industry Standard**: Used by Google, Microsoft, GitHub, etc.
- ✅ **Offline Capable**: Works without internet connection
- ✅ **Universal Compatibility**: Works with any authenticator app
- ✅ **Secure**: 6-digit codes that change every 30 seconds
- ✅ **User-Friendly**: Easy to set up and use
- ✅ **Cost-Effective**: No SMS costs or hardware tokens needed

### **Supported Authenticator Apps:**
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator
- Bitwarden
- Any TOTP-compatible app

## 🏗️ Implementation Plan

### **Phase 1: Core 2FA Infrastructure**

#### 1. **Database Schema Updates**
```sql
-- Add 2FA fields to User model
ALTER TABLE "User" ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "backupCodes" TEXT[]; -- JSON array of backup codes
ALTER TABLE "User" ADD COLUMN "twoFactorVerified" BOOLEAN DEFAULT false;
```

#### 2. **Required Dependencies**
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

#### 3. **2FA Service Functions**
```typescript
// lib/2fa.ts
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
}
```

### **Phase 2: User Interface Components**

#### 1. **2FA Setup Component**
```typescript
// components/auth/TwoFactorSetup.tsx
import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TwoFactorSetupProps {
  qrCodeUrl: string;
  secret: string;
  onVerify: (token: string) => Promise<boolean>;
  onComplete: () => void;
}

export function TwoFactorSetup({ qrCodeUrl, secret, onVerify, onComplete }: TwoFactorSetupProps) {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (token.length !== 6) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await onVerify(token);
      if (isValid) {
        onComplete();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Scan this QR code with your authenticator app:
          </p>
          <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">
            Or enter this code manually: <code className="bg-muted px-1 rounded">{secret}</code>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter 6-digit code:</label>
          <InputOTP
            value={token}
            onChange={setToken}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button 
          onClick={handleVerify} 
          disabled={token.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2. **2FA Verification Component**
```typescript
// components/auth/TwoFactorVerification.tsx
import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TwoFactorVerificationProps {
  onVerify: (token: string) => Promise<boolean>;
  onBackupCode?: (code: string) => Promise<boolean>;
  onCancel?: () => void;
}

export function TwoFactorVerification({ onVerify, onBackupCode, onCancel }: TwoFactorVerificationProps) {
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (useBackupCode ? !backupCode : token.length !== 6) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = useBackupCode 
        ? await onBackupCode?.(backupCode) ?? false
        : await onVerify(token);
        
      if (!isValid) {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!useBackupCode ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter 6-digit code from your authenticator app:</label>
              <InputOTP
                value={token}
                onChange={setToken}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            {onBackupCode && (
              <Button
                variant="outline"
                onClick={() => setUseBackupCode(true)}
                className="w-full"
              >
                Use Backup Code Instead
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter backup code:</label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter 8-character backup code"
                maxLength={8}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setUseBackupCode(false)}
              className="w-full"
            >
              Use Authenticator App Instead
            </Button>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={useBackupCode ? !backupCode : token.length !== 6 || isVerifying}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Phase 3: API Routes**

#### 1. **2FA Setup API**
```typescript
// app/api/auth/2fa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/2fa';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 });
    }

    // Generate 2FA secret and QR code
    const { secret, qrCode, backupCodes } = TwoFactorService.generateSecret(user.email);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        backupCodes: backupCodes
      }
    });

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
```

#### 2. **2FA Verification API**
```typescript
// app/api/auth/2fa/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/2fa';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, backupCode } = await request.json();
    const prisma = getPrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isValid = false;

    if (backupCode) {
      // Verify backup code
      isValid = user.backupCodes?.includes(backupCode) ?? false;
      if (isValid) {
        // Remove used backup code
        const updatedBackupCodes = user.backupCodes.filter(code => code !== backupCode);
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: updatedBackupCodes }
        });
      }
    } else if (token && user.twoFactorSecret) {
      // Verify TOTP token
      isValid = TwoFactorService.verifyToken(token, user.twoFactorSecret);
    }

    if (isValid) {
      // Mark 2FA as verified for this session
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorVerified: true }
      });
    }

    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

#### 3. **2FA Enable API**
```typescript
// app/api/auth/2fa/enable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.twoFactorVerified) {
      return NextResponse.json({ error: '2FA not verified' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorVerified: false // Reset for next login
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json({ error: 'Enable failed' }, { status: 500 });
  }
}
```

### **Phase 4: NextAuth Integration**

#### 1. **Update Auth Configuration**
```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrismaClient } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { TwoFactorService } from "./2fa";

export const authOptions: NextAuthOptions = {
  // ... existing config ...
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.twoFactorVerified = user.twoFactorVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
        session.user.twoFactorVerified = token.twoFactorVerified;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Check if 2FA is required
      if (user.twoFactorEnabled && !user.twoFactorVerified) {
        // Redirect to 2FA verification
        return '/auth/2fa-verify';
      }
      return true;
    }
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
```

## 🔒 Security Features

### **1. Backup Codes**
- Generate 10 one-time backup codes
- 8-character alphanumeric codes
- Automatically removed after use
- Can be regenerated by user

### **2. Rate Limiting**
- Limit 2FA verification attempts
- Temporary lockout after failed attempts
- Progressive delays for repeated failures

### **3. Session Management**
- 2FA verification required per session
- Automatic logout after inactivity
- Secure session handling

### **4. Audit Logging**
- Log all 2FA setup attempts
- Track verification successes/failures
- Monitor backup code usage

## 📱 User Experience Flow

### **Setup Flow:**
1. User logs in to admin panel
2. Navigates to Security Settings
3. Clicks "Enable 2FA"
4. Scans QR code with authenticator app
5. Enters 6-digit code to verify
6. Receives backup codes
7. 2FA is now enabled

### **Login Flow:**
1. User enters email/password
2. If 2FA is enabled, redirected to verification page
3. User enters 6-digit code from authenticator app
4. Or uses backup code if needed
5. Access granted to admin panel

### **Recovery Flow:**
1. User loses access to authenticator app
2. Uses backup code to log in
3. Disables old 2FA
4. Sets up new 2FA with new device

## 🚀 Implementation Steps

### **Step 1: Install Dependencies**
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

### **Step 2: Update Database Schema**
```bash
npx prisma migrate dev --name add-two-factor-auth
```

### **Step 3: Create 2FA Service**
Create `lib/2fa.ts` with the service functions

### **Step 4: Build UI Components**
Create the setup and verification components

### **Step 5: Implement API Routes**
Create the 2FA API endpoints

### **Step 6: Update NextAuth Configuration**
Integrate 2FA into the authentication flow

### **Step 7: Add Admin Interface**
Create 2FA management in admin panel

### **Step 8: Testing**
Test all flows and edge cases

## 📊 Monitoring & Analytics

### **2FA Adoption Metrics:**
- Percentage of admin users with 2FA enabled
- Setup completion rates
- Verification success rates
- Backup code usage patterns

### **Security Metrics:**
- Failed verification attempts
- Account lockouts
- Backup code usage
- Suspicious activity patterns

---

**This TOTP-based 2FA solution provides enterprise-grade security while maintaining excellent user experience and compatibility with all major authenticator apps.** 