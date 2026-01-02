# Quick Reference - Medusa-Camunda POC

## 🚀 Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.template .env
# Edit .env with your Camunda credentials

# 3. Setup database
npx medusa db:migrate
npm run seed

# 4. Deploy BPMN to Camunda Cloud
# See BPMN_DEPLOYMENT.md for instructions
```

## ▶️ Running the Application

### Using PM2 (Recommended)

```bash
# Start everything
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Stop everything
pm2 stop all

# Restart everything
pm2 restart all

# Delete all processes
pm2 delete all
```

### Manual (Two Terminals)

**Terminal 1 - Medusa Backend:**
```bash
npm run dev
```

**Terminal 2 - Camunda Workers:**
```bash
npm run workers
```

## 🔍 Monitoring & Debugging

### Check Logs

```bash
# PM2 logs (all services)
pm2 logs

# PM2 logs (specific service)
pm2 logs medusa-backend
pm2 logs camunda-workers

# PM2 status
pm2 status
```

### Camunda Operate

1. Open https://console.camunda.io/
2. Select your cluster
3. Click "Operate"
4. View running/completed workflows

### Check Order Metadata

Use Medusa Admin or API to check order metadata:
```javascript
// Example order metadata after workflow
{
  workflow_instance: "2251799813685251",
  workflow_status: "completed",
  workflow_message: "Customer notified - Order complete!",
  workflow_started_at: "2026-01-02T10:00:00.000Z",
  last_updated: "2026-01-02T10:01:30.000Z"
}
```

## 🧪 Testing

### Test Workflow Execution

1. Place an order (via Admin or API)
2. Check PM2 logs for workflow start
3. Watch worker logs for task execution
4. Verify in Camunda Operate
5. Check order metadata

### API Health Check

```bash
curl http://localhost:9000/demo
# Expected: {"status":"POC API ready","timestamp":"..."}
```

## 🛠️ Common Tasks

### Restart After Code Changes

```bash
pm2 restart all
```

### View Environment Variables

```bash
pm2 env 0  # View env for first process
```

### Clear Logs

```bash
pm2 flush
```

### Update Dependencies

```bash
npm install
pm2 restart all
```

### Database Migrations

```bash
# Run new migrations
npx medusa db:migrate

# Rollback migration
npx medusa db:rollback
```

## ❌ Troubleshooting

### Workers Not Starting

```bash
# Check credentials
cat .env | grep ZEEBE

# Test connection manually
npm run workers
# Look for connection errors
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Restart
pm2 restart all
```

### BPMN Not Deployed

1. Go to https://console.camunda.io/
2. Navigate to Operate
3. Check if "order-fulfillment-poc" exists
4. If not, see BPMN_DEPLOYMENT.md

### Port Already in Use

```bash
# Find process using port 9000
lsof -i :9000

# Kill the process
kill -9 <PID>

# Restart
pm2 restart all
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables & credentials |
| `medusa-config.ts` | Medusa configuration |
| `ecosystem.config.js` | PM2 process configuration |
| `src/modules/camunda/service.ts` | Camunda service |
| `src/workers/poc-workers.ts` | Worker implementations |
| `src/subscribers/order-placed.ts` | Event subscriber |
| `src/order-fulfillment-poc.bpmn` | Workflow definition |

## 🔗 Useful Links

- [Camunda Console](https://console.camunda.io/)
- [Medusa Admin](http://localhost:9000/app)
- [API Endpoint](http://localhost:9000/demo)
- [Camunda Docs](https://docs.camunda.io/)
- [Medusa Docs](https://docs.medusajs.com/)

## 📞 Get Help

- **Setup Issues**: See README.md
- **BPMN Deployment**: See BPMN_DEPLOYMENT.md
- **Implementation Details**: See IMPLEMENTATION_SUMMARY.md
- **Architecture Analysis**: See architecture_analysis.md

---

**Pro Tip:** Keep this file open in a terminal for quick reference! 🚀
