import { BankFeedManager } from '@/components/accounting/BankFeedManager';
import { AccountingNavigation } from '@/components/accounting/AccountingNavigation';

export default function BankFeedPage() {
  return (
    <div className="container mx-auto py-6">
      <AccountingNavigation />
      <BankFeedManager />
    </div>
  );
} 