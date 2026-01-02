# Medusa + Camunda 8 Integration POC

A proof-of-concept integration between **MedusaJS v2** (e-commerce platform) and **Camunda 8** (workflow orchestration engine) for automated order fulfillment workflows.

## 🎯 Overview

This project demonstrates how to orchestrate e-commerce order fulfillment using BPMN workflows in Camunda while maintaining order state in Medusa.

### Architecture

```
Order Placed (Medusa)
    ↓
Subscriber listens to event
    ↓
CamundaService starts BPMN workflow
    ↓
Camunda Cloud executes process
    ↓
Workers pick up tasks → Update Medusa via API
```

### Workflow Steps

1. **Verify Payment** - Validates order payment (simulated)
2. **Reserve Inventory** - Reserves warehouse inventory (simulated)
3. **Send Notification** - Sends customer email (simulated)

## 📋 Prerequisites

### Required

- **Node.js** >= 20
- **Camunda 8 SaaS Account** - [Sign up here](https://console.camunda.io/)
- **PostgreSQL** or **SQLite** (for Medusa)

### Optional

- **PM2** - For process management (recommended)
- **Docker** - For containerized deployment

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd medusa-camunda-poc
npm install
```

### 2. Configure Environment

```bash
cp .env.template .env
```

Edit `.env` and fill in your credentials:

```bash
# Database (PostgreSQL or SQLite)
DATABASE_URL=postgres://user:password@localhost:5432/medusa

# Camunda 8 SaaS credentials
# Get these from: https://console.camunda.io/ → Cluster → API
ZEEBE_CLIENT_ID=your-cluster-client-id
ZEEBE_CLIENT_SECRET=your-cluster-client-secret
ZEEBE_ADDRESS=your-cluster.zeebe.camunda.io:443
ZEEBE_TOKEN_AUDIENCE=zeebe.camunda.io

# Medusa Backend URL
MEDUSA_BACKEND_URL=http://localhost:9000
```

### 3. Setup Database

```bash
# Run migrations
npx medusa db:migrate

# Seed demo data (optional)
npm run seed
```

### 4. Deploy BPMN to Camunda Cloud

⚠️ **CRITICAL STEP** - The workflow won't work without this!

See [BPMN_DEPLOYMENT.md](./BPMN_DEPLOYMENT.md) for detailed instructions.

**Quick method:**
1. Go to https://console.camunda.io/
2. Open Web Modeler
3. Create new BPMN diagram
4. Copy contents of `src/order-fulfillment-poc.bpmn`
5. Click "Deploy" → Select your cluster

### 5. Start Services

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start both Medusa and Workers
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Stop all
pm2 stop all
```

#### Option B: Manual (Two Terminals)

**Terminal 1 - Medusa Backend:**
```bash
npm run dev
```

**Terminal 2 - Camunda Workers:**
```bash
npm run workers
```

### 6. Test the Integration

1. Place an order in Medusa (via Admin or API)
2. Watch the logs for workflow execution
3. Check order metadata in Medusa for workflow status

## 📁 Project Structure

```
src/
├── modules/
│   └── camunda/
│       ├── index.ts          # Module registration
│       └── service.ts        # Camunda service (starts workflows)
├── subscribers/
│   └── order-placed.ts       # Listens to order.placed event
├── workers/
│   └── poc-workers.ts        # Camunda task workers
├── api/
│   └── demo/
│       └── route.ts          # Webhook for worker updates
├── scripts/
│   └── seed.ts               # Database seeding
└── order-fulfillment-poc.bpmn # BPMN workflow definition
```

## 🔧 How It Works

### 1. Order Event Subscription

When an order is placed, the `order-placed.ts` subscriber:
- Resolves the `CamundaService` from DI container
- Starts a new workflow instance
- Stores workflow instance key in order metadata

### 2. Workflow Orchestration

Camunda Cloud:
- Executes the BPMN process
- Creates tasks for each service task
- Distributes tasks to workers

### 3. Worker Execution

Each worker:
- Polls Camunda for tasks matching their type
- Executes business logic (payment, inventory, notification)
- Calls `/demo` API to update order metadata in Medusa
- Completes the task or reports failure

### 4. Order Status Updates

The `/demo` API endpoint:
- Receives status updates from workers
- Validates order existence
- Updates order metadata
- Marks order as completed when workflow finishes

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://localhost/medusa` |
| `ZEEBE_CLIENT_ID` | Camunda cluster client ID | `abc123...` |
| `ZEEBE_CLIENT_SECRET` | Camunda cluster client secret | `xyz789...` |
| `ZEEBE_ADDRESS` | Camunda cluster gRPC address | `foo.zeebe.camunda.io:443` |
| `MEDUSA_BACKEND_URL` | Medusa backend URL for workers | `http://localhost:9000` |

### Workflow Configuration

Edit `src/order-fulfillment-poc.bpmn` to modify the workflow:
- Add/remove service tasks
- Add conditional gateways
- Implement error boundaries
- Add timers or human tasks

## 📊 Monitoring

### View Workflow Instances

1. Go to https://console.camunda.io/
2. Select your cluster
3. Open "Operate"
4. View running/completed instances

### Check Order Metadata

Query order metadata to see workflow status:

```javascript
const order = await orderModule.retrieveOrder(orderId);
console.log(order.metadata);
// {
//   workflow_instance: "123456789",
//   workflow_status: "completed",
//   workflow_message: "Customer notified - Order complete!",
//   last_updated: "2026-01-02T10:00:00.000Z"
// }
```

## 🔍 Troubleshooting

### Workers not receiving tasks

**Problem:** Workers start but don't execute tasks

**Solutions:**
1. Check BPMN is deployed: Go to Camunda Console → Operate
2. Verify task types match: `verify-payment`, `reserve-inventory`, `send-notification`
3. Check worker logs for connection errors
4. Verify credentials in `.env`

### CamundaService not found

**Problem:** Error: "camundaService" is not registered

**Solution:** Ensure `medusa-config.ts` includes:
```typescript
modules: [
  {
    resolve: "./src/modules/camunda",
  },
],
```

### Process instance creation fails

**Problem:** Error creating process instance

**Solutions:**
1. Deploy BPMN to Camunda Cloud (see [BPMN_DEPLOYMENT.md](./BPMN_DEPLOYMENT.md))
2. Verify process ID is `order-fulfillment-poc`
3. Check Camunda credentials

### Workers can't reach Medusa

**Problem:** Workers log "Failed to update Medusa"

**Solutions:**
1. Verify `MEDUSA_BACKEND_URL` is correct
2. Ensure Medusa is running on expected port
3. Check network connectivity
4. Review worker retry logs

## 🧪 Testing

### Manual Test

1. Start services:
   ```bash
   pm2 start ecosystem.config.js
   ```

2. Place test order:
   ```bash
   curl -X POST http://localhost:9000/store/carts/{cart_id}/complete
   ```

3. Check logs:
   ```bash
   pm2 logs camunda-workers
   ```

4. Verify in Camunda Operate:
   - Process instance created
   - All tasks completed
   - No incidents

### Integration Test (Future)

```bash
npm run test:integration
```

## 🚧 Production Considerations

### Before Going to Production

- [ ] Add comprehensive error handling
- [ ] Implement dead letter queues
- [ ] Add monitoring and alerting (Datadog, New Relic)
- [ ] Set up Camunda Optimize for analytics
- [ ] Implement authentication on `/demo` endpoint
- [ ] Add input validation with Zod
- [ ] Write unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling for workers
- [ ] Implement graceful shutdown handling
- [ ] Add circuit breakers for external calls
- [ ] Set up log aggregation (ELK, Datadog)
- [ ] Configure Camunda incident handling
- [ ] Implement compensation transactions
- [ ] Add rate limiting on APIs

### Recommended Architecture Changes

1. **Separate Worker Service**: Deploy workers as independent service
2. **Message Queue**: Add RabbitMQ/Kafka for async communication
3. **State Management**: Dedicated database table for workflow state
4. **API Gateway**: Add Kong/NGINX for routing and auth
5. **Service Mesh**: Consider Istio for microservices communication

## 📚 Resources

- [MedusaJS Documentation](https://docs.medusajs.com/)
- [Camunda 8 Documentation](https://docs.camunda.io/)
- [Camunda Platform 8 SDK](https://github.com/camunda/camunda-8-js-sdk)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT

## 🆘 Support

For issues and questions:
- Open an issue in this repository
- Check [BPMN_DEPLOYMENT.md](./BPMN_DEPLOYMENT.md) for deployment help
- Review troubleshooting section above
- Join [Medusa Discord](https://discord.gg/medusajs)
- Join [Camunda Forum](https://forum.camunda.io/)

---

**Built with ❤️ using MedusaJS and Camunda 8**
