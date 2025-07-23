# 🤖 Automated Deployment Quick Reference

## 🎯 What This Does

Automatically deploys your application when you push to the main branch - **no manual intervention required!**

## ⚡ Quick Setup Checklist

### GitHub Repository Setup
- [ ] **Enable GitHub Actions** in repository settings
- [ ] **Add Repository Secrets**:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `SERVER_HOST`
  - `SERVER_USER`
  - `SERVER_SSH_KEY`
  - `SERVER_PORT`

### Server Setup
- [ ] **Install Node.js 18+** and PM2
- [ ] **Create app directory**: `/var/www/plant-store`
- [ ] **Clone repository** to server
- [ ] **Set up environment variables** in `.env`
- [ ] **Run initial setup**: `npm ci && npx prisma generate && npm run build`

## 🔄 How It Works

1. **Push to main** → Triggers GitHub Actions
2. **Tests run** → Linting, type checking, unit tests, E2E tests
3. **If tests pass** → Deploys to production server
4. **Server updates** → Pulls latest code, builds, restarts
5. **Health check** → Verifies deployment success

## 📁 Key Files

- `.github/workflows/deploy.yml` - Main deployment workflow
- `.github/workflows/test.yml` - Testing workflow
- `scripts/auto-deploy.sh` - Server deployment script
- `ecosystem.config.js` - PM2 configuration

## 🛠️ Manual Commands (if needed)

```bash
# On server - manual deployment
cd /var/www/plant-store
./scripts/auto-deploy.sh

# Check app status
pm2 status
pm2 logs plant-store

# Health check
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify environment variables
3. Check server logs: `pm2 logs plant-store`
4. Test manually: `./scripts/auto-deploy.sh`

### Common Issues
- **SSH connection failed** → Check SSH key in GitHub secrets
- **Build fails** → Check Node.js version (needs 18+)
- **Database issues** → Verify DATABASE_URL
- **PM2 issues** → Check if PM2 is installed globally

## 🎉 Success Indicators

- ✅ GitHub Actions workflow completes successfully
- ✅ PM2 shows app as "online"
- ✅ Health check endpoint responds
- ✅ Website loads without errors

---

**🎯 Once set up, every push to main automatically deploys to production!** 