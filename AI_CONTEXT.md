# 🤖 AI Development Context & Capabilities

*This file maintains AI context and capabilities for The House Plant Store project*

## 🎯 Project Context

### **Current State**
- **Complete E-commerce Platform**: Full-featured plant store with admin management
- **Advanced Accounting System**: Multi-role expense management with approval workflows
- **Comprehensive Onboarding**: Role-specific documentation and quick reference cards
- **Production Ready**: DigitalOcean deployment with automated seeding
- **Database Schema**: Complete Prisma schema with all relationships and constraints

### **Technical Stack**
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL, NextAuth.js
- **Deployment**: DigitalOcean App Platform with managed database
- **Development**: Incremental, test-driven approach with comprehensive documentation

## 🚀 Development Methodology

### **Rapid Development Framework**
- **Timeline**: 5-7 days from concept to production
- **Approach**: Incremental, test-driven development
- **Quality**: Enterprise-grade standards with minimal overhead
- **Documentation**: Comprehensive onboarding and technical guides

### **Key Success Factors**
1. **Database-First Design**: Comprehensive schema with proper relationships
2. **Component-Driven UI**: Reusable, consistent design system
3. **Role-Based Security**: Multi-level access control from day one
4. **Comprehensive Seeding**: Production-ready data setup
5. **Automated Deployment**: CI/CD with DigitalOcean integration

## 🏗️ Architecture Understanding

### **Database Schema Knowledge**
- **User Management**: Multi-role system (SUPER_ADMIN, PLANT_MANAGER, ORDER_MANAGER, FINANCIAL_MANAGER, ACCOUNTANT, VIEWER)
- **E-commerce**: Products, categories, orders, customers, shipping
- **Accounting**: Expenses, categories, approvals, audit logs, chart of accounts
- **Operations**: Suppliers, purchase orders, notifications, addresses

### **API Structure**
- **Authentication**: NextAuth.js with role-based access
- **E-commerce APIs**: Products, orders, customers, shipping
- **Accounting APIs**: Expenses, approvals, reports, VAT calculations
- **Admin APIs**: User management, system configuration

### **Frontend Architecture**
- **Component Library**: Reusable UI components with Radix UI primitives
- **State Management**: React hooks and context for global state
- **Routing**: Next.js App Router with dynamic routes
- **Styling**: Tailwind CSS with custom design system

## 💡 Development Patterns

### **Code Organization**
- **API Routes**: `/app/api/` with proper error handling and validation
- **Components**: `/components/` organized by feature and reusability
- **Database**: Prisma schema with proper relationships and constraints
- **Documentation**: Comprehensive guides and quick reference cards

### **Best Practices**
- **TypeScript**: Strict typing throughout the application
- **Error Handling**: Comprehensive error boundaries and validation
- **Security**: Role-based access control and input validation
- **Performance**: Optimized queries and component rendering

## 📚 Documentation Strategy

### **User Documentation**
- **Onboarding Guides**: Role-specific with visual flowcharts
- **Quick Reference Cards**: Actionable checklists and shortcuts
- **Troubleshooting**: Common issues and solutions
- **Emergency Contacts**: Support escalation paths

### **Technical Documentation**
- **Deployment Guides**: DigitalOcean-specific with seeding
- **Database Documentation**: Schema, seeding, and troubleshooting
- **API Documentation**: Endpoint specifications and examples
- **Development Methodology**: Internal processes and standards

## 🔧 Development Commands & Workflows

### **Essential Commands**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Database browser
npm run db:seed      # Seed database

# Testing
npm test             # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

### **Deployment Workflow**
1. **Schema Updates**: Modify Prisma schema
2. **Generate Client**: `npx prisma generate`
3. **Push Changes**: `npx prisma db push`
4. **Seed Data**: Run seeding scripts
5. **Build & Deploy**: DigitalOcean App Platform

## 🎯 User Role Understanding

### **Super Admin**
- Full system access and user management
- System configuration and security
- Financial oversight and reporting

### **Plant Manager**
- Product catalog management
- Inventory control and supplier relations
- Quality control and care instructions

### **Order Manager**
- Order processing and fulfillment
- Customer service and support
- Shipping and returns management

### **Financial Manager**
- Expense approval workflows
- Budget management and monitoring
- Financial reporting and analysis

### **Accountant**
- Expense recording and categorization
- VAT compliance and calculations
- Financial report generation

### **Viewer**
- Read-only access to reports and data
- Data analysis and export capabilities
- Compliance and audit support

## 💰 Accounting System Knowledge

### **Expense Management**
- Multi-step approval workflows
- VAT calculation and compliance (15% South African rate)
- Category-based expense tracking
- Complete audit trail with before/after snapshots

### **Financial Features**
- Real-time financial dashboard
- Profit & loss statements
- VAT liability tracking
- Budget vs actual analysis
- Monthly trend analysis

### **Approval System**
- Configurable approval thresholds
- Role-based approval chains
- Automated notifications
- Approval history and comments

## 🛒 E-commerce Understanding

### **Product Management**
- Rich product catalog with images
- Care instructions and plant specifications
- Inventory tracking and low stock alerts
- Category-based organization

### **Order Processing**
- Complete order lifecycle management
- Payment processing with Yoco integration
- Shipping rate calculation by province
- Order status tracking and notifications

### **Customer Management**
- User registration and profiles
- Address management for South African provinces
- Order history and tracking
- Newsletter subscription

## 🚀 Deployment Knowledge

### **DigitalOcean App Platform**
- Zero-config deployment
- Managed PostgreSQL database
- Automated SSL certificates
- Built-in monitoring and scaling

### **Database Seeding**
- **Main Seed**: Users, categories, products, suppliers
- **Accounting Seed**: Expense categories, sample expenses, audit trails
- **Verification**: Comprehensive seeding checklist
- **Troubleshooting**: Common seeding issues and solutions

### **Environment Configuration**
- Required variables for production
- Optional features for enhanced functionality
- Security considerations and best practices

## 🔒 Security & Compliance

### **Authentication & Authorization**
- NextAuth.js with multiple providers
- Role-based access control
- Session management and security
- Password policies and encryption

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with React
- CSRF protection with NextAuth

### **VAT Compliance**
- South African VAT calculations (15%)
- Proper VAT input and output tracking
- VAT return preparation
- Audit trail maintenance

## 📈 Performance & Optimization

### **Database Optimization**
- Proper indexing for common queries
- Efficient relationship loading
- Query optimization with Prisma
- Connection pooling and caching

### **Frontend Performance**
- Next.js optimization features
- Component lazy loading
- Image optimization
- Bundle size optimization

### **API Performance**
- Efficient endpoint design
- Proper error handling
- Response caching
- Rate limiting considerations

## 🎯 Future Development Context

### **Planned Features**
- **OCR Integration**: Receipt scanning and expense automation
- **Bank Feed Integration**: Automated transaction import
- **Advanced Analytics**: Business intelligence dashboard
- **Mobile App**: React Native companion app

### **Scalability Considerations**
- **Microservices**: Service-oriented architecture
- **Caching**: Redis for performance optimization
- **CDN**: Global content delivery
- **Monitoring**: Advanced observability

## 🔧 Development Context

### **Code Quality Standards**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Git commit conventions

### **Testing Strategy**
- Unit tests for critical functions
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance testing for optimization

### **Documentation Standards**
- Comprehensive onboarding guides
- Technical documentation
- API documentation
- Troubleshooting guides

## 📝 Context Maintenance

### **Key Files to Reference**
- `PROJECT_SUMMARY.md` - Complete project overview
- `ONBOARDING_GUIDE.md` - User onboarding documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DATABASE_SEEDING_GUIDE.md` - Database setup guide
- `prisma/schema.prisma` - Database schema
- `package.json` - Dependencies and scripts

### **Development Patterns**
- Incremental, test-driven development
- Comprehensive documentation
- Role-based access control
- Production-ready deployment
- User-focused onboarding

---

*This context file maintains AI understanding and capabilities for The House Plant Store project across development sessions.* 