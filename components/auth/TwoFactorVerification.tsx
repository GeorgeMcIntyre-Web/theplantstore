'use client';

import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, ArrowLeft } from 'lucide-react';

interface TwoFactorVerificationProps {
  onVerify: (token: string) => Promise<boolean>;
  onBackupCode?: (code: string) => Promise<boolean>;
  onCancel?: () => void;
  email?: string;
}

export function TwoFactorVerification({ 
  onVerify, 
  onBackupCode, 
  onCancel, 
  email 
}: TwoFactorVerificationProps) {
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

  const renderAuthenticatorStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        {email && (
          <p className="text-sm text-muted-foreground mb-4">
            Enter the 6-digit code from your authenticator app for <strong>{email}</strong>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">6-digit code:</label>
        <InputOTP
          value={token}
          onChange={setToken}
          maxLength={6}
          render={({ slots }) => (
            <InputOTPGroup className="justify-center">
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
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
          <Key className="h-4 w-4 mr-2" />
          Use Backup Code Instead
        </Button>
      )}
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Key className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Backup Code</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter one of your backup codes to access your account
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Backup code:</label>
        <input
          type="text"
          value={backupCode}
          onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border rounded-md font-mono text-center text-lg tracking-wider"
          placeholder="Enter 8-character code"
          maxLength={8}
          style={{ letterSpacing: '0.5em' }}
        />
      </div>

      <Button
        variant="outline"
        onClick={() => setUseBackupCode(false)}
        className="w-full"
      >
        <Smartphone className="h-4 w-4 mr-2" />
        Use Authenticator App Instead
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {useBackupCode ? 'Backup Code' : 'Two-Factor Authentication'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!useBackupCode ? renderAuthenticatorStep() : renderBackupStep()}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleVerify} 
            disabled={useBackupCode ? !backupCode : token.length !== 6 || isVerifying}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4">
          <p>Having trouble? Contact support if you've lost access to your authenticator app and backup codes.</p>
        </div>
      </CardContent>
    </Card>
  );
} 