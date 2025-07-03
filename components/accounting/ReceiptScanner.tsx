'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ocrService, ReceiptData } from '@/lib/ocr';
import { toast } from 'sonner';

interface ReceiptScannerProps {
  onDataExtracted: (data: ReceiptData) => void;
  onCancel: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onDataExtracted,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await ocrService.processReceipt(file);
      setExtractedData(result);
      setConfidence(result.confidence);
      
      toast.success('Receipt processed successfully!');
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      toast.error('Failed to access camera. Please upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    context.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        await processImage(file);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const handleUseData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
    }
  };

  const handleRetry = () => {
    setExtractedData(null);
    setPreviewUrl(null);
    setConfidence(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          {!previewUrl && !isCameraActive && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 flex flex-col gap-2"
                >
                  <Upload className="h-8 w-8" />
                  <span>Upload Image</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={startCamera}
                  className="h-32 flex flex-col gap-2"
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
              </div>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {isCameraActive && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border"
                />
                <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none" />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Processing receipt...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !isProcessing && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full rounded-lg border"
                />
                <Badge
                  variant={confidence > 70 ? "default" : "destructive"}
                  className="absolute top-2 right-2"
                >
                  {confidence.toFixed(1)}% confidence
                </Badge>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && !isProcessing && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Receipt data extracted successfully! Review and edit the information below.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={extractedData.vendor}
                    onChange={(e) => setExtractedData({
                      ...extractedData,
                      vendor: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (R)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={extractedData.amount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setExtractedData({
                        ...extractedData,
                        amount,
                        vatAmount: Math.round(amount * 0.15 * 100) / 100
                      });
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={extractedData.date.toISOString().split('T')[0]}
                    onChange={(e) => setExtractedData({
                      ...extractedData,
                      date: new Date(e.target.value)
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vat">VAT Amount (R)</Label>
                  <Input
                    id="vat"
                    type="number"
                    step="0.01"
                    value={extractedData.vatAmount}
                    onChange={(e) => setExtractedData({
                      ...extractedData,
                      vatAmount: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              {extractedData.items.length > 0 && (
                <div>
                  <Label>Items Found</Label>
                  <Textarea
                    value={extractedData.items.join('\n')}
                    onChange={(e) => setExtractedData({
                      ...extractedData,
                      items: e.target.value.split('\n').filter(item => item.trim())
                    })}
                    rows={3}
                    placeholder="Items from receipt..."
                  />
                </div>
              )}

              {confidence < 70 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Low confidence in extraction. Please review all fields carefully.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUseData} className="flex-1">
                  Use This Data
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 