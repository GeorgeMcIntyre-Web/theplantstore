'use client';

import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key } from 'lucide-react';

interface TwoFactorSetupProps {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
  onVerify: (token: string) => Promise<boolean>;
  onComplete: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ 
  qrCodeUrl, 
  secret, 
  backupCodes, 
  onVerify, 
  onComplete, 
  onCancel 
}: TwoFactorSetupProps) {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');

  const handleVerify = async () => {
    if (token.length !== 6) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await onVerify(token);
      if (isValid) {
        setStep('backup');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderQRStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold">Set Up Two-Factor Authentication</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Scan this QR code with your authenticator app to enable 2FA:
        </p>
        
        <div className="bg-white p-4 rounded-lg border inline-block mb-4">
          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
        </div>
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Recommended apps:</strong> Google Authenticator, Microsoft Authenticator, Authy
          </p>
          <p>
            <strong>Manual entry code:</strong> <code className="bg-muted px-2 py-1 rounded font-mono">{secret}</code>
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => setStep('verify')} 
          className="flex-1"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          I've Scanned the Code
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Verify Setup</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the 6-digit code from your authenticator app:
        </p>
      </div>

      <div className="space-y-2">
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={handleVerify} 
          disabled={token.length !== 6 || isVerifying}
          className="flex-1"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setStep('qr')}
        >
          Back
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Key className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Backup Codes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator app.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Important:</strong> These codes are shown only once. Save them securely!
        </AlertDescription>
      </Alert>

      <div className="bg-muted p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="bg-background p-2 rounded text-center">
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• Each code can only be used once</p>
        <p>• Store them in a password manager or secure location</p>
        <p>• You can generate new codes later if needed</p>
      </div>

      <Button 
        onClick={handleComplete} 
        className="w-full"
      >
        Complete Setup
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {step === 'qr' && 'Set Up 2FA'}
          {step === 'verify' && 'Verify Code'}
          {step === 'backup' && 'Backup Codes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'qr' && renderQRStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
      </CardContent>
    </Card>
  );
} 