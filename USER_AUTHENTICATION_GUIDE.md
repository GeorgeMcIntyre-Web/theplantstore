# The Plant Store - User Authentication & Role Management Guide

## 🔐 Authentication System Overview

The Plant Store uses **NextAuth.js** with multiple authentication providers and role-based access control (RBAC).

### Authentication Providers
1. **Email/Password** (Credentials)
2. **Google OAuth** 
3. **Azure AD** (Enterprise SSO)

## 👥 User Roles & Permissions

### 1. **CUSTOMER** (Default Role)
**Purpose**: End customers who browse and purchase plants

**Access**:
- ✅ Browse products and categories
- ✅ Add items to cart
- ✅ Place orders
- ✅ View order history
- ✅ Write product reviews
- ✅ Manage profile and addresses
- ✅ Subscribe to newsletter

**Username/Email**: Customer's personal email
**Password**: Customer-chosen password (minimum 8 characters)

**Best Practices**:
- Allow self-registration
- Email verification required
- Password reset functionality
- GDPR-compliant data handling

---

### 2. **SUPER_ADMIN** (System Administrator)
**Purpose**: Full system access and user management

**Access**:
- ✅ All system features
- ✅ User management (create, edit, delete users)
- ✅ System settings and configuration
- ✅ Database management
- ✅ Security and audit logs
- ✅ All admin dashboards

**Username/Email**: `admin@theplantstore.com` or `system@theplantstore.com`
**Password**: Complex password (16+ characters, special chars, numbers)

**Best Practices**:
- Use dedicated admin email domain
- Enable 2FA (Two-Factor Authentication)
- Regular password rotation (90 days)
- Monitor login attempts
- Use strong, unique passwords

---

### 3. **PLANT_MANAGER** (Inventory & Product Management)
**Purpose**: Manage product catalog and inventory

**Access**:
- ✅ Product management (CRUD operations)
- ✅ Inventory tracking
- ✅ Category management
- ✅ Supplier management
- ✅ Purchase orders
- ✅ Product images and descriptions
- ✅ Stock level monitoring

**Username/Email**: `plants@theplantstore.com` or `inventory@theplantstore.com`
**Password**: Strong password (12+ characters)

**Best Practices**:
- Regular inventory audits
- Image quality standards
- Product description guidelines
- Supplier relationship management

---

### 4. **ORDER_MANAGER** (Order Processing)
**Purpose**: Process customer orders and manage fulfillment

**Access**:
- ✅ Order management and processing
- ✅ Order status updates
- ✅ Customer communication
- ✅ Shipping and tracking
- ✅ Returns and refunds
- ✅ Customer service tools

**Username/Email**: `orders@theplantstore.com` or `fulfillment@theplantstore.com`
**Password**: Strong password (12+ characters)

**Best Practices**:
- Order processing SLAs
- Customer communication templates
- Shipping partner coordination
- Quality control procedures

---

### 5. **FINANCIAL_MANAGER** (Financial Operations)
**Purpose**: Manage financial aspects and reporting

**Access**:
- ✅ Financial reporting and analytics
- ✅ Expense management
- ✅ Revenue tracking
- ✅ Budget monitoring
- ✅ Financial dashboards
- ✅ Tax and VAT management

**Username/Email**: `finance@theplantstore.com` or `accounts@theplantstore.com`
**Password**: Strong password (12+ characters)

**Best Practices**:
- Financial data security
- Regular backup procedures
- Audit trail maintenance
- Compliance monitoring

---

### 6. **ACCOUNTANT** (Accounting & Bookkeeping)
**Purpose**: Handle detailed accounting tasks

**Access**:
- ✅ Detailed financial records
- ✅ Journal entries
- ✅ Bank reconciliation
- ✅ Expense categorization
- ✅ Tax calculations
- ✅ Financial statements

**Username/Email**: `accounting@theplantstore.com` or `bookkeeper@theplantstore.com`
**Password**: Strong password (12+ characters)

**Best Practices**:
- Regular reconciliation
- Document retention policies
- Audit trail maintenance
- Professional accounting standards

---

### 7. **VIEWER** (Read-Only Access)
**Purpose**: View-only access for stakeholders or consultants

**Access**:
- ✅ View dashboards and reports
- ✅ Read-only access to data
- ✅ No modification capabilities

**Username/Email**: `viewer@theplantstore.com` or `consultant@theplantstore.com`
**Password**: Standard password (10+ characters)

**Best Practices**:
- Limited access for security
- Regular access reviews
- Temporary access when needed

## 🔒 Security Best Practices

### Password Requirements
```
CUSTOMER: Minimum 8 characters
STAFF: Minimum 12 characters, include:
- Uppercase letters
- Lowercase letters
- Numbers
- Special characters
SUPER_ADMIN: Minimum 16 characters, include all above
```

### Account Security
- **2FA**: Enable for all admin accounts
- **Session Timeout**: 8 hours for staff, 24 hours for customers
- **Failed Login Attempts**: Lock account after 5 failed attempts
- **Password History**: Prevent reuse of last 5 passwords
- **Account Lockout**: 30 minutes after failed attempts

### Email Domains
```
Admin Accounts: @theplantstore.com
Customer Accounts: Any valid email domain
```

## 📋 User Creation Workflow

### 1. **Customer Registration** (Self-Service)
```
1. Customer visits website
2. Clicks "Sign Up"
3. Enters email and password
4. Email verification sent
5. Account activated after verification
6. Role: CUSTOMER (automatic)
```

### 2. **Staff Account Creation** (Admin-Only)
```
1. SUPER_ADMIN creates account
2. Temporary password generated
3. Account details sent to user
4. User must change password on first login
5. 2FA setup required
6. Role assigned based on job function
```

### 3. **Account Deactivation**
```
1. Mark account as inactive
2. Preserve data for audit purposes
3. Remove access immediately
4. Notify relevant parties
```

## 🛡️ Access Control Matrix

| Feature | CUSTOMER | VIEWER | PLANT_MANAGER | ORDER_MANAGER | FINANCIAL_MANAGER | ACCOUNTANT | SUPER_ADMIN |
|---------|----------|--------|---------------|---------------|-------------------|------------|-------------|
| Browse Products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place Orders | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Products | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Process Orders | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Financial Reports | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🔄 Account Lifecycle Management

### Onboarding Process
1. **Account Creation**: Admin creates account with temporary password
2. **First Login**: User changes password and sets up 2FA
3. **Training**: Role-specific training and access review
4. **Monitoring**: Regular access reviews and activity monitoring

### Offboarding Process
1. **Access Removal**: Immediate deactivation
2. **Data Export**: Export user's work if needed
3. **Audit Trail**: Maintain logs for compliance
4. **Notification**: Inform relevant team members

## 📊 Monitoring & Auditing

### Login Monitoring
- Track login attempts and locations
- Monitor unusual activity patterns
- Alert on suspicious behavior
- Regular security reviews

### Activity Logging
- All admin actions logged
- Data access tracking
- Change history maintained
- Compliance reporting

## 🚨 Emergency Procedures

### Compromised Account
1. **Immediate Lockout**: Disable account immediately
2. **Password Reset**: Force password change
3. **Activity Review**: Audit recent activity
4. **Security Assessment**: Evaluate system impact
5. **Communication**: Notify relevant parties

### System Breach
1. **Incident Response**: Follow security incident procedures
2. **Account Review**: Audit all admin accounts
3. **Password Reset**: Force all password changes
4. **Security Hardening**: Implement additional security measures

## 📞 Support & Maintenance

### Password Reset Process
1. User requests password reset
2. Email sent with reset link
3. Link expires in 1 hour
4. New password must meet requirements
5. Account unlocked after reset

### Account Recovery
1. Verify user identity
2. Review account history
3. Reset access credentials
4. Monitor for suspicious activity

---

**Last Updated**: July 29, 2025  
**Version**: 1.0.0  
**Maintained By**: Development Team 