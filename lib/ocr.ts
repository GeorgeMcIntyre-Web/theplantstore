import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    vendor?: string;
    amount?: number;
    date?: string;
    vatAmount?: number;
    items?: string[];
  };
}

export interface ReceiptData {
  vendor: string;
  amount: number;
  date: Date;
  vatAmount: number;
  items: string[];
  confidence: number;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.worker = await Tesseract.createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$%()-/: ',
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async processReceipt(imageFile: File): Promise<ReceiptData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(imageFile);
      
      // Perform OCR
      const result = await this.worker.recognize(base64);
      
      // Extract and parse the text
      const extractedData = this.parseReceiptText(result.data.text);
      
      return {
        vendor: extractedData.vendor || 'Unknown Vendor',
        amount: extractedData.amount || 0,
        date: extractedData.date ? new Date(extractedData.date) : new Date(),
        vatAmount: extractedData.vatAmount || 0,
        items: extractedData.items || [],
        confidence: result.data.confidence
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parseReceiptText(text: string): OCRResult['extractedData'] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const extractedData: OCRResult['extractedData'] = {
      vendor: '',
      amount: 0,
      date: '',
      vatAmount: 0,
      items: []
    };

    // Extract vendor (usually first few lines)
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 50 && !line.match(/^\d/)) {
        extractedData.vendor = line;
        break;
      }
    }

    // Extract amount (look for currency patterns)
    const amountPatterns = [
      /total[\s:]*[\$£€]?[\s]*([\d,]+\.?\d*)/i,
      /amount[\s:]*[\$£€]?[\s]*([\d,]+\.?\d*)/i,
      /[\$£€][\s]*([\d,]+\.?\d*)/,
      /([\d,]+\.?\d*)[\s]*[\$£€]/
    ];

    for (const line of lines) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match) {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          if (amount > 0 && amount < 100000) {
            extractedData.amount = amount;
            break;
          }
        }
      }
      if (extractedData.amount && extractedData.amount > 0) break;
    }

    // Extract VAT amount (15% of total)
    if (extractedData.amount && extractedData.amount > 0) {
      extractedData.vatAmount = Math.round(extractedData.amount * 0.15 * 100) / 100;
    }

    // Extract date (look for date patterns)
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const [_, day, month, year] = match;
          const fullYear = year.length === 2 ? `20${year}` : year;
          extractedData.date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          break;
        }
      }
      if (extractedData.date) break;
    }

    // Extract items (lines with prices)
    const itemPatterns = [
      /^(.+?)[\s]*[\$£€]?[\s]*([\d,]+\.?\d*)$/,
      /^(.+?)[\s]*([\d,]+\.?\d*)[\s]*[\$£€]?$/
    ];

    for (const line of lines) {
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          const itemName = match[1].trim();
          const price = parseFloat(match[2].replace(/,/g, ''));
          if (itemName.length > 2 && price > 0 && price < 10000) {
            extractedData.items?.push(`${itemName} - R${price.toFixed(2)}`);
          }
        }
      }
    }

    return extractedData;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService(); 