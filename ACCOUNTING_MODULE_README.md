# Accounting Module - The Plant Store

A comprehensive financial management system for The Plant Store, providing complete expense tracking, reporting, audit trails, and financial analysis.

## 🚀 Features

### 📊 Financial Dashboard
- **Real-time Financial Overview**: Key metrics including revenue, expenses, profit, and VAT liability
- **Period Selection**: View data for current month, quarter, or year
- **Interactive Charts**: Visual representation of financial trends
- **Quick Actions**: Direct access to create expenses and view reports

### 💰 Expense Management
- **Complete CRUD Operations**: Create, read, update, and delete expenses
- **Approval Workflow**: Multi-level approval system with comments
- **VAT Calculation**: Automatic VAT calculation and tracking
- **Category Organization**: Organized expense categorization
- **Receipt Upload**: Support for receipt attachments
- **Bulk Operations**: Select and manage multiple expenses at once
- **Advanced Filtering**: Filter by status, category, date range, and more
- **Export Functionality**: Export expenses to CSV format

### 📈 Financial Reports
- **Summary Reports**: High-level financial overview
- **Detailed Analysis**: Comprehensive expense and revenue breakdown
- **VAT Reports**: Complete VAT tracking and liability calculation
- **Trends Analysis**: Monthly and quarterly trend analysis
- **Top Products**: Revenue analysis by product performance
- **Category Breakdown**: Expense analysis by category
- **Export Options**: CSV export for all report types

### 🔍 Audit Logs
- **Complete Audit Trail**: Track all changes to expenses
- **User Activity**: Monitor who made what changes and when
- **Before/After Data**: See exactly what changed in each modification
- **Search & Filter**: Find specific audit entries quickly
- **Export Capability**: Export audit logs for compliance

### 📁 Category Management
- **Category CRUD**: Create, edit, and delete expense categories
- **Active/Inactive Status**: Manage category availability
- **Expense Count**: See how many expenses use each category
- **Validation**: Prevent deletion of categories with associated expenses

## 🛠️ Technical Architecture

### Database Schema
The accounting module uses the following Prisma models:

- **ExpenseCategory**: Expense categorization
- **Expense**: Main expense records with approval workflow
- **ExpenseApproval**: Approval tracking and comments
- **ExpenseAuditLog**: Complete audit trail
- **User**: Role-based access control

### API Endpoints

#### Expense Management
- `GET /api/accounting/expenses` - List expenses with filtering
- `POST /api/accounting/expenses` - Create new expense
- `PATCH /api/accounting/expenses/[id]` - Update expense
- `DELETE /api/accounting/expenses/[id]` - Delete expense
- `POST /api/accounting/expenses/[id]/approve` - Approve/reject expense

#### Categories
- `GET /api/accounting/expense-categories` - List categories
- `POST /api/accounting/expense-categories` - Create category
- `PATCH /api/accounting/expense-categories/[id]` - Update category
- `DELETE /api/accounting/expense-categories/[id]` - Delete category

#### Reports
- `GET /api/accounting/reports` - Generate financial reports
- `GET /api/accounting/reports/export` - Export reports to CSV

#### Audit Logs
- `GET /api/accounting/audit-logs` - List audit logs
- `GET /api/accounting/audit-logs/export` - Export audit logs

#### Financial Summary
- `GET /api/accounting/financial-summary` - Dashboard data

### Role-Based Access Control

The module implements comprehensive RBAC:

- **SUPER_ADMIN**: Full access to all features
- **FINANCIAL_MANAGER**: Can approve expenses, full accounting access
- **ACCOUNTANT**: Can manage expenses, run reports, cannot approve
- **Other Roles**: No access to accounting features

## 🚀 Setup Instructions

### 1. Database Setup

Ensure your Prisma schema includes the accounting models:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 2. Seed Initial Data

Run the accounting seed script to create initial categories and sample data:

```bash
# Run the seed script
npx tsx scripts/seed-accounting.ts
```

### 3. Create Financial Users

Create users with appropriate roles:

```sql
-- Example: Create a financial manager
INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt")
VALUES ('user_id', 'Financial Manager', 'finance@plantstore.com', 'FINANCIAL_MANAGER', NOW(), NOW());
```

### 4. Environment Variables

Ensure these environment variables are set:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 📖 Usage Guide

### Accessing the Accounting Module

1. Navigate to `/admin/accounting` in your browser
2. Ensure you're logged in with appropriate permissions
3. Use the sidebar navigation to access different sections

### Creating an Expense

1. Go to **Expenses** → Click **New Expense**
2. Fill in the required fields:
   - Description
   - Amount (VAT inclusive)
   - Expense Date
   - Category
3. Add optional details:
   - Vendor Name
   - Notes
4. Click **Create Expense**

### Approving Expenses

1. Go to **Expenses** → Find pending expenses
2. Click the **Approve** button (✓)
3. Add approval comments if needed
4. Click **Approve** or **Reject**

### Generating Reports

1. Go to **Reports**
2. Select report type:
   - Summary Report
   - Detailed Analysis
   - VAT Report
   - Trends Analysis
3. Choose date range
4. Click **Export CSV** to download

### Managing Categories

1. Go to **Categories**
2. Click **New Category** to create
3. Use edit/delete buttons to manage existing categories
4. Categories with expenses cannot be deleted

### Viewing Audit Logs

1. Go to **Audit Logs**
2. Use filters to find specific entries
3. Click the eye icon to view detailed changes
4. Export logs for compliance purposes

## 🔧 Configuration

### VAT Settings

The system uses 15% VAT by default. To modify:

1. Update the VAT rate in expense creation
2. Modify VAT calculations in API endpoints
3. Update report calculations accordingly

### Approval Workflow

The approval workflow can be customized:

1. Modify the `ExpenseStatus` enum in Prisma schema
2. Update approval logic in API endpoints
3. Adjust UI components to reflect new statuses

### Category Management

Categories are managed through the admin interface:

1. Create categories as needed
2. Set active/inactive status
3. Monitor usage through expense counts

## 🧪 Testing

### Manual Testing

1. **Create Test Expenses**: Use the seed script or manual creation
2. **Test Approval Flow**: Create expenses and test approval/rejection
3. **Verify Reports**: Generate reports and verify calculations
4. **Check Audit Logs**: Make changes and verify audit trail

### API Testing

Test all endpoints with appropriate permissions:

```bash
# Test expense creation
curl -X POST /api/accounting/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","amount":"100","categoryId":"..."}'

# Test report generation
curl -X GET "/api/accounting/reports?type=summary&period=current-month"
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure user has correct role
2. **Category Not Found**: Run seed script or create categories manually
3. **VAT Calculation Errors**: Verify VAT rate settings
4. **Report Generation Fails**: Check date ranges and data availability

### Debug Mode

Enable debug logging:

```env
DEBUG=prisma:*
NODE_ENV=development
```

### Database Issues

If you encounter database issues:

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## 📈 Performance Considerations

### Large Datasets

For large expense datasets:

1. Implement pagination (already included)
2. Use database indexes on frequently queried fields
3. Consider caching for report generation
4. Optimize date range queries

### Report Generation

Reports are generated on-demand. For better performance:

1. Consider implementing report caching
2. Use background jobs for large reports
3. Implement report scheduling for regular reports

## 🔒 Security

### Data Protection

1. All financial data is protected by role-based access
2. Audit logs track all changes
3. API endpoints validate user permissions
4. Input validation prevents injection attacks

### Compliance

The system supports compliance requirements:

1. Complete audit trail
2. User activity tracking
3. Data export capabilities
4. Role-based access control

## 🚀 Future Enhancements

### Planned Features

1. **Advanced Analytics**: Machine learning insights
2. **Budget Management**: Budget tracking and alerts
3. **Multi-Currency**: Support for multiple currencies
4. **Integration**: Connect with external accounting systems
5. **Mobile App**: Native mobile application
6. **Real-time Notifications**: Instant approval notifications

### API Extensions

1. **Webhook Support**: Real-time data synchronization
2. **Bulk Import**: CSV import for expenses
3. **Advanced Filtering**: More sophisticated query options
4. **GraphQL API**: Alternative to REST endpoints

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review audit logs for error details
3. Verify user permissions and roles
4. Check database connectivity and schema

## 📄 License

This accounting module is part of The Plant Store application and follows the same licensing terms. 