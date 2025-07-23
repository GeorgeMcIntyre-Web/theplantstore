# OCR & Bank Feed Integration Guide

## Overview

The House Plant Store now includes advanced OCR (Optical Character Recognition) and bank feed integration capabilities to streamline expense management and reduce manual data entry.

## OCR Receipt Scanning

### Features

- **Camera Integration**: Take photos directly with device camera
- **File Upload**: Upload receipt images from device
- **Automatic Data Extraction**: Extract vendor, amount, date, and items
- **Confidence Scoring**: Shows accuracy of extraction
- **Manual Override**: Edit extracted data before submission

### How It Works

1. **Image Processing**: Uses Tesseract.js for OCR processing
2. **Pattern Recognition**: Identifies common receipt patterns
3. **Data Extraction**: Parses vendor names, amounts, dates, and line items
4. **VAT Calculation**: Automatically calculates VAT based on South African rates
5. **Validation**: Provides confidence scores and allows manual correction

### Supported Receipt Formats

- **Vendor Names**: Extracted from header lines
- **Amounts**: Recognizes currency symbols and decimal formats
- **Dates**: Multiple date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- **Items**: Line items with prices
- **VAT**: Automatic 15% calculation (configurable)

### Usage

1. Navigate to Expenses → Create New Expense
2. Click "Scan Receipt" button
3. Choose camera or upload option
4. Review extracted data
5. Edit if necessary
6. Submit expense

## Bank Feed Integration

### Features

- **Multi-Bank Support**: Connect multiple bank accounts
- **Auto-Reconciliation**: Automatic matching of transactions
- **Transaction Import**: Import bank statements
- **Category Mapping**: Map bank categories to expense categories
- **Reconciliation Suggestions**: AI-powered matching suggestions

### Bank Account Setup

1. **Add Bank Account**:
   - Bank name
   - Account number
   - Auto-reconcile settings
   - Category mappings

2. **Security**:
   - API keys stored securely
   - Encrypted connections
   - Role-based access control

### Transaction Processing

1. **Import**: Fetch transactions from bank APIs
2. **Deduplication**: Prevent duplicate imports
3. **Matching**: Auto-match with existing expenses
4. **Suggestions**: Provide reconciliation options
5. **Creation**: Auto-create expenses from unmatched transactions

### Reconciliation Workflow

1. **Automatic Matching**:
   - Vendor name similarity
   - Amount matching (with tolerance)
   - Date proximity
   - Category correlation

2. **Manual Reconciliation**:
   - Review unmatched transactions
   - Select appropriate expenses
   - Confirm matches

3. **Audit Trail**:
   - Track all reconciliation actions
   - Maintain data integrity
   - Compliance reporting

## Technical Implementation

### OCR Service (`lib/ocr.ts`)

```typescript
interface ReceiptData {
  vendor: string;
  amount: number;
  date: Date;
  vatAmount: number;
  items: string[];
  confidence: number;
}

class OCRService {
  async processReceipt(imageFile: File): Promise<ReceiptData>
  private parseReceiptText(text: string): ExtractedData
  async terminate(): Promise<void>
}
```

### Bank Feed Service (`lib/bank-feed.ts`)

```typescript
interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference: string;
  category?: string;
  balance: number;
}

class BankFeedService {
  async addBankAccount(config: BankFeedConfig): Promise<void>
  async importTransactions(accountNumber: string, transactions: BankTransaction[]): Promise<void>
  async autoReconcileTransaction(transaction: BankTransaction, config: BankFeedConfig): Promise<void>
}
```

### Database Schema

```sql
-- Bank Account Management
CREATE TABLE "BankAccount" (
  "id" TEXT PRIMARY KEY,
  "accountNumber" TEXT UNIQUE,
  "bankName" TEXT,
  "autoReconcile" BOOLEAN DEFAULT false,
  "categories" JSON,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Bank Transactions
CREATE TABLE "BankTransaction" (
  "id" TEXT PRIMARY KEY,
  "accountNumber" TEXT,
  "transactionDate" TIMESTAMP,
  "description" TEXT,
  "amount" DECIMAL(10,2),
  "type" TEXT,
  "bankReference" TEXT UNIQUE,
  "category" TEXT,
  "balance" DECIMAL(10,2),
  "reconciled" BOOLEAN DEFAULT false,
  "reconciledAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Reconciliation Suggestions
CREATE TABLE "ReconciliationSuggestion" (
  "id" TEXT PRIMARY KEY,
  "bankTransactionId" TEXT,
  "suggestedExpenseIds" TEXT[],
  "confidence" FLOAT,
  "createdAt" TIMESTAMP DEFAULT now()
);
```

## API Endpoints

### OCR Processing
- `POST /api/accounting/ocr/process` - Process receipt image
- `GET /api/accounting/ocr/status` - Get processing status

### Bank Feed Management
- `GET /api/accounting/bank-feed` - List bank accounts
- `POST /api/accounting/bank-feed` - Add/update bank account
- `DELETE /api/accounting/bank-feed/[id]` - Remove bank account
- `POST /api/accounting/bank-feed/[id]/import` - Import transactions
- `POST /api/accounting/bank-feed/reconcile` - Manual reconciliation

## Security Considerations

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete audit trail
- **Data Retention**: Configurable retention policies

### API Security
- **Authentication**: JWT-based authentication
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **Error Handling**: Secure error messages

## Performance Optimization

### OCR Processing
- **Client-side Processing**: Reduces server load
- **Image Compression**: Optimize file sizes
- **Caching**: Cache processed results
- **Background Processing**: Non-blocking operations

### Bank Feed
- **Batch Processing**: Process multiple transactions
- **Incremental Updates**: Only fetch new transactions
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking imports

## Troubleshooting

### Common OCR Issues

1. **Low Confidence Scores**:
   - Ensure good image quality
   - Check lighting conditions
   - Verify receipt is clearly visible

2. **Incorrect Data Extraction**:
   - Review and edit extracted data
   - Use manual entry for complex receipts
   - Report issues for model improvement

### Bank Feed Issues

1. **Connection Problems**:
   - Verify API credentials
   - Check network connectivity
   - Review bank API status

2. **Reconciliation Issues**:
   - Review matching criteria
   - Check transaction dates
   - Verify amount tolerances

## Future Enhancements

### Planned Features
- **Multi-language Support**: OCR for different languages
- **Advanced AI**: Machine learning for better accuracy
- **Real-time Sync**: Live bank transaction updates
- **Mobile App**: Native mobile OCR capabilities
- **Integration APIs**: Third-party accounting software

### Performance Improvements
- **GPU Acceleration**: Faster OCR processing
- **Distributed Processing**: Scalable architecture
- **Smart Caching**: Intelligent result caching
- **Predictive Matching**: AI-powered reconciliation

## Support

For technical support or feature requests:
- **Documentation**: Check this guide first
- **Issues**: Report bugs via GitHub
- **Enhancements**: Submit feature requests
- **Training**: Contact for user training

---

*This guide covers the OCR and bank feed integration features. For general accounting documentation, see the main accounting guide.* 