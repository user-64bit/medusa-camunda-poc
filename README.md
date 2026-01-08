# Medusa-Camunda E-commerce Platform V1

**Version:** 1.0

A complete e-commerce platform with MedusaJS v2 backend, Next.js storefront, Camunda Cloud workflow orchestration, and Slack notifications.

---

## 🚀 Quick Start

```bash
# 1. Install all dependencies (from root)
npm install

# 2. Configure environment
cp .env.template backend/.env
# Edit backend/.env with your Camunda and Slack credentials

# Create frontend env
echo "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000" > frontend/.env.local

# 3. Setup database
cd backend && npx medusa db:migrate && npm run seed && cd ..

# 4. Deploy BPMN to Camunda Cloud (see BPMN_DEPLOYMENT.md)

# 5. Start all services
npm run dev

# Services:
# - Medusa Backend: http://localhost:9000
# - Medusa Admin:   http://localhost:9000/app
# - Frontend:       http://localhost:8000
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MEDUSA E-COMMERCE V1                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐         │
│   │   Next.js    │      │   Medusa     │      │   Camunda    │         │
│   │   Frontend   │─────>│   Backend    │─────>│    Cloud     │         │
│   │              │      │              │      │              │         │
│   │ - Products   │      │ - Store API  │      │ - Workflows  │         │
│   │ - Cart       │      │ - Admin API  │      │ - Workers    │         │
│   │ - Checkout   │      │ - Auth       │      │ - State      │         │
│   │ - Account    │      │ - Orders     │      │              │         │
│   │ - Tracking   │      │ - Inventory  │      │              │         │
│   └──────────────┘      └──────────────┘      └──────────────┘         │
│         :8000                  :9000                                     │
│                                   │                                      │
│                                   │                                      │
│                            ┌──────▼───────┐                             │
│                            │    Slack     │                             │
│                            │ Notifications│                             │
│                            └──────────────┘                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Order Workflow

```
Customer Places Order
        ↓
    ┌─────────────────┐
    │ Order Received  │ ← Slack: Order notification
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Verify Payment  │ ← Worker checks payment status
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Reserve Stock   │ ← Worker checks & reserves inventory
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Send Notify     │ ← Customer confirmation
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Order Complete  │ ← Slack: Completion notification
    └─────────────────┘
```

---

## 📁 Project Structure

```
medusa-camunda-poc/               # Monorepo root
├── backend/                      # Medusa Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── camunda/          # Camunda integration module
│   │   │   │   ├── index.ts      # Module registration
│   │   │   │   └── service.ts    # CamundaService
│   │   │   └── slack/            # Slack notification provider
│   │   │       ├── index.ts
│   │   │       └── service.ts
│   │   ├── subscribers/
│   │   │   └── order-placed.ts   # Event → Workflow trigger
│   │   ├── workers/
│   │   │   ├── poc-workers.ts    # Camunda task workers
│   │   │   └── slack-notifier.ts # Worker Slack utility
│   │   ├── api/
│   │   │   ├── demo/             # Legacy endpoint (deprecated)
│   │   │   └── store/orders/[id]/
│   │   │       ├── workflow-status/  # GET workflow status
│   │   │       └── workflow-update/  # POST workflow updates (use this)
│   │   ├── workflows/
│   │   │   └── order-placed-notification.ts
│   │   ├── admin/widgets/
│   │   │   └── workflow-status.tsx   # Admin order widget
│   │   └── order-fulfillment-poc.bpmn
│   ├── medusa-config.ts          # Backend configuration
│   └── package.json
│
├── frontend/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Login, Register
│   │   │   ├── (account)/        # Account, Orders, Profile
│   │   │   ├── (shop)/           # Products, Cart, Checkout
│   │   │   └── page.tsx          # Home page
│   │   ├── components/
│   │   │   ├── products/         # Product components
│   │   │   ├── orders/           # Order tracking
│   │   │   ├── auth/             # Auth forms
│   │   │   └── ui/               # UI primitives
│   │   └── lib/
│   │       ├── medusa.ts         # SDK client
│   │       └── auth.ts           # Auth utilities
│   └── package.json
│
├── ecosystem.config.js           # PM2 multi-process config
├── package.json                  # Monorepo workspace config
├── ARCHITECTURE.md               # System architecture analysis
├── TESTING.md                    # End-to-end testing guide
└── PRODUCTION_GUIDE.md           # Production best practices
```

---

## ✨ Features

### Frontend (Next.js)
- **Product Catalog** - Browse products with categories
- **Shopping Cart** - Real-time cart management
- **Checkout Flow** - Multi-step checkout with Stripe support
- **Customer Auth** - Medusa native authentication
- **Order History** - View all past orders
- **Workflow Tracking** - Real-time order progress visualization
- **Responsive Design** - Mobile-first with Tailwind CSS

### Backend (Medusa)
- **Store API** - Products, carts, orders, customers
- **Admin API** - Full e-commerce management
- **Custom Modules** - Camunda & Slack integrations
- **Event System** - Order events trigger workflows
- **Workflow APIs** - Status endpoints for orders

### Workflow (Camunda)
- **Payment Verification** - Validate payment completion
- **Inventory Reservation** - Check & reserve stock
- **Customer Notification** - Send confirmation
- **Real-time Updates** - Status pushed to Medusa
- **Error Handling** - Retry with exponential backoff

### Admin Dashboard
- **Workflow Widget** - See order workflow status
- **Progress Indicator** - Visual step tracker
- **Error Display** - Workflow errors highlighted
- **Camunda Link** - Quick access to Operate

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgres://...

# Medusa
JWT_SECRET=your-secret
COOKIE_SECRET=your-secret
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000

# Camunda Cloud
ZEEBE_ADDRESS=cluster.region.zeebe.camunda.io:443
ZEEBE_CLIENT_ID=your-client-id
ZEEBE_CLIENT_SECRET=your-client-secret
ZEEBE_TOKEN_AUDIENCE=zeebe.camunda.io

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ADMIN_URL=http://localhost:9000/app

# Stripe (optional)
STRIPE_API_KEY=sk_test_...
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_DEFAULT_REGION=us
```

---

## 📜 Scripts

### Root (Monorepo)

```bash
# Start all services via PM2
npm run dev

# Individual services
npm run dev:backend       # Start Medusa backend only
npm run dev:frontend      # Start Next.js frontend only

# Build
npm run build             # Build backend + frontend
npm run build:backend     # Build backend only
npm run build:frontend    # Build frontend only

# Workers & BPMN
npm run workers           # Start Camunda workers
npm run deploy-bpmn       # Deploy workflow to Camunda

# Database & Seed
npm run seed              # Seed demo data

# Testing
npm run test:integration:http
npm run test:unit

# PM2 Management
npm run stop              # Stop all services
npm run logs              # View all logs
pm2 status                # Service status
```

### Backend (in `backend/` directory)

```bash
npm run dev               # Start Medusa backend
npm run workers           # Start Camunda workers
npm run build             # Build for production
npm run seed              # Seed demo data
npm run deploy-bpmn       # Deploy BPMN
npx medusa db:migrate     # Run migrations
```

### Frontend (in `frontend/` directory)

```bash
npm run dev               # Start Next.js (port 8000)
npm run build             # Build for production
npm run start             # Start production server
```

---

## 🧪 Testing the Flow

1. **Start all services:**
   ```bash
   npm run dev
   ```

2. **Create products in Admin:**
   - Open http://localhost:9000/app
   - Add products with prices

3. **Shop as a customer:**
   - Open http://localhost:8000
   - Browse products
   - Add to cart
   - Complete checkout

4. **Track the order:**
   - Go to Account → Orders
   - Watch workflow progress
   - Receive Slack notifications

5. **Monitor in Camunda:**
   - Open https://console.camunda.io
   - View process instances in Operate

---

## 📊 API Endpoints

### Store API (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/store/products` | List products |
| GET | `/store/products/:id` | Product details |
| POST | `/store/carts` | Create cart |
| POST | `/store/carts/:id/line-items` | Add to cart |
| POST | `/store/carts/:id/complete` | Complete checkout |
| GET | `/store/orders/:id/workflow-status` | Get workflow status |

### Admin API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List orders |
| GET | `/admin/orders/:id` | Order details |

### Worker API (Internal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store/orders/:id/workflow-update` | Update workflow status |

---

## 🔒 Security Notes

- Worker API endpoints should be secured with API keys in production
- Stripe webhook signing should be enabled
- Use environment variables for all secrets
- Enable HTTPS in production
- Configure proper CORS settings

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture analysis |
| [TESTING.md](./TESTING.md) | End-to-end testing guide |
| [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) | Production best practices |
| [frontend/README.md](./frontend/README.md) | Frontend documentation |
| [backend/](./backend/) | Backend source code |

---

## 🛠 Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | MedusaJS v2.12.3 |
| **Frontend** | Next.js 15, React 19 |
| **Styling** | Tailwind CSS |
| **Workflow** | Camunda Cloud 8.0 |
| **SDK** | @camunda8/sdk, @medusajs/js-sdk |
| **Runtime** | Node.js 20+ |
| **Database** | PostgreSQL |
| **Process Manager** | PM2 |
| **Payments** | Stripe (optional) |
| **Notifications** | Slack |

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Order Processing | ~7 seconds |
| Worker Throughput | 8-10 orders/min |
| Memory (Dev) | ~200 MB total |
| Scalability | Horizontal workers |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

## 📄 License

MIT

---

**Built with ❤️ using MedusaJS, Next.js, and Camunda Cloud**
