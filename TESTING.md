# Complete End-to-End Testing Guide
## Medusa-Camunda Integration POC

This guide provides step-by-step instructions to test the complete order fulfillment workflow from order placement to completion.

---

## 📋 Table of Contents

1. [Prerequisites Check](#prerequisites-check)
2. [Initial Setup](#initial-setup)
3. [BPMN Deployment](#bpmn-deployment)
4. [Service Startup](#service-startup)
5. [End-to-End Testing](#end-to-end-testing)
6. [Verification & Monitoring](#verification--monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites Check

### 1. System Requirements

```bash
# Check Node.js version (must be >= 20)
node --version
# Expected: v20.x.x or higher

# Check npm
npm --version
# Expected: 9.x.x or higher

# Check if PostgreSQL is running (if using PostgreSQL)
psql --version
# Or check SQLite
sqlite3 --version
```

### 2. Camunda 8 Account Setup

- [ ] Account created at https://console.camunda.io/
- [ ] Cluster created and running
- [ ] API credentials generated (Client ID + Secret)
- [ ] Cluster address noted (e.g., `abc123.zeebe.camunda.io:443`)

**Get Credentials:**
1. Go to https://console.camunda.io/
2. Select your cluster
3. Click "API" tab
4. Click "Create new credentials"
5. Save the Client ID and Client Secret

---

## Initial Setup

### Step 1: Install Dependencies

```bash
cd /Users/arth/Code/medusa-camunda-poc

# Install all packages
npm install

# Verify PM2 is installed
npx pm2 --version
# Expected: 5.3.0 or similar
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.template .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Fill in these required variables:**

```bash
# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/medusa-camunda
# OR for SQLite:
# DATABASE_URL=sqlite:///data/medusa.db

# Camunda 8 Credentials (from console.camunda.io)
ZEEBE_CLIENT_ID=your-client-id-here
ZEEBE_CLIENT_SECRET=your-client-secret-here
ZEEBE_ADDRESS=your-cluster.zeebe.camunda.io:443
ZEEBE_TOKEN_AUDIENCE=zeebe.camunda.io

# Medusa Backend URL
MEDUSA_BACKEND_URL=http://localhost:9000

# CORS Settings (default is fine for testing)
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000
```

**Verify your .env file:**

```bash
# Check that credentials are set
cat .env | grep ZEEBE_CLIENT_ID
cat .env | grep ZEEBE_ADDRESS
cat .env | grep DATABASE_URL
```

### Step 3: Database Setup

```bash
# Run database migrations
npx medusa db:migrate

# Expected output:
# ✓ Migrations completed successfully

# Seed demo data (products, regions, etc.)
npm run seed

# Expected output:
# ✓ Seeding store data...
# ✓ Seeding region data...
# ✓ Finished seeding regions.
# ✓ Seeding product data...
# (takes 1-2 minutes)
```

**Verify database:**

```bash
# Check if database has data
# For PostgreSQL:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM product;"

# Should show products count (e.g., 3 products from seed)
```

---

## BPMN Deployment

### Step 1: Verify BPMN File

```bash
# Check that BPMN file exists and has correct content
cat src/order-fulfillment-poc.bpmn | grep "order-fulfillment-poc"

# Expected: Should show process ID
```

### Step 2: Deploy to Camunda Cloud

**Method 1: Web Modeler (Recommended)**

1. **Open Camunda Console:**
   ```
   https://console.camunda.io/
   ```

2. **Navigate to Modeler:**
   - Click "Modeler" in left sidebar
   - Click "New Project" (or select existing)
   - Give it a name: "Medusa Order Fulfillment"

3. **Create Diagram:**
   - Click "New" → "BPMN Diagram"
   - Name it: "order-fulfillment-poc"

4. **Import BPMN:**
   - Click "Code" tab (top right)
   - Delete all existing XML
   - Open `src/order-fulfillment-poc.bpmn` in your local editor
   - Copy ALL contents
   - Paste into Camunda Web Modeler

5. **Verify Diagram:**
   - Click "Diagram" tab
   - You should see:
     - Start event: "Order Placed"
     - Task 1: "Verify Payment"
     - Task 2: "Reserve Inventory"
     - Task 3: "Send Notification"
     - End event: "Order Complete"
   - All connected in sequence

6. **Deploy:**
   - Click "Deploy" button (blue, top right)
   - Select your cluster from dropdown
   - Click "Deploy"
   - Wait for success message

**Method 2: Desktop Modeler**

```bash
# Download from https://camunda.com/download/modeler/
# Install and open

# In Modeler:
# 1. File → Open → select src/order-fulfillment-poc.bpmn
# 2. Click Deploy icon (rocket)
# 3. Configure:
#    - Cluster endpoint: your ZEEBE_ADDRESS
#    - Client ID: your ZEEBE_CLIENT_ID
#    - Client secret: your ZEEBE_CLIENT_SECRET
# 4. Click Deploy
```

### Step 3: Verify Deployment

1. **In Camunda Console:**
   - Go to "Operate" (left sidebar)
   - Click "Processes" tab
   - Look for "Order Fulfillment POC" or "order-fulfillment-poc"
   - Should show: 0 running instances, 0 incidents

2. **Check Process Details:**
   - Click on the process name
   - You should see the BPMN diagram
   - Verify all 3 service tasks are visible

**✅ Checkpoint:** BPMN is deployed if you see the process in Operate!

---

## Service Startup

### Step 1: Start Services with PM2 (Recommended)

```bash
# Start both Medusa backend and Camunda workers
pm2 start ecosystem.config.js

# Expected output:
# [PM2] Spawning PM2 daemon with pm2_home=...
# [PM2] PM2 Successfully daemonized
# [PM2] Starting /path/to/npm in fork_mode (1 instance)
# [PM2] Done.
# 
# ┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
# │ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
# ├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
# │ 0  │ medusa-backend     │ fork     │ 0    │ online    │ 0%       │ 50.0mb   │
# │ 1  │ camunda-workers    │ fork     │ 0    │ online    │ 0%       │ 30.0mb   │
# └────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### Step 2: Verify Service Logs

```bash
# Watch all logs
pm2 logs

# Expected logs for medusa-backend:
# ✓ Database connection successful
# ✓ Server is ready on port: 9000
# ✓ Module camundaService registered  ← IMPORTANT!

# Expected logs for camunda-workers:
# 🤖 POC Workers started successfully!
# 📡 Connected to: your-cluster.zeebe.camunda.io:443
# 🔗 Medusa backend: http://localhost:9000
# 👂 Listening for tasks...
```

**Check specific service:**

```bash
# Only Medusa logs
pm2 logs medusa-backend

# Only worker logs
pm2 logs camunda-workers
```

### Step 3: Verify Services Are Running

```bash
# Check PM2 status
pm2 status

# Both should show "online"

# Test Medusa backend health
curl http://localhost:9000/health

# Expected: {"status":"ok"}

# Test demo API endpoint
curl http://localhost:9000/demo

# Expected: {"status":"POC API ready","timestamp":"2026-01-02T..."}
```

**✅ Checkpoint:** Both services show "online" in PM2 status!

### Alternative: Manual Startup (Two Terminals)

If PM2 doesn't work:

**Terminal 1 - Medusa:**
```bash
npm run dev

# Wait for:
# ✓ Server is ready on port: 9000
```

**Terminal 2 - Workers:**
```bash
npm run workers

# Wait for:
# 🤖 POC Workers started successfully!
```

---

## End-to-End Testing

### Step 1: Access Medusa Admin

```bash
# Open browser to:
http://localhost:9000/app

# Default credentials (if seeded):
# Email: admin@medusa-test.com
# Password: supersecret

# OR create admin user:
npx medusa user --email admin@test.com --password admin123
```

### Step 2: Create an Order

**Option A: Via Admin UI**

1. **Login to Admin:**
   - Go to http://localhost:9000/app
   - Login with your credentials

2. **Draft Order Method:**
   - Click "Orders" in sidebar
   - Click "Create Order" button
   - Select a customer (or create one)
   - Add products (from seeded data)
   - Select region: "Europe"
   - Select shipping method
   - Click "Complete Order"

**Option B: Via Store API (Recommended for Testing)**

```bash
# 1. Create a cart
curl -X POST http://localhost:9000/store/carts \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": "REGION_ID_HERE"
  }'

# Save the cart_id from response

# 2. Add item to cart
curl -X POST http://localhost:9000/store/carts/{cart_id}/line-items \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "VARIANT_ID_HERE",
    "quantity": 1
  }'

# 3. Complete cart (creates order)
curl -X POST http://localhost:9000/store/carts/{cart_id}/complete \
  -H "Content-Type: application/json"

# Save the order_id from response
```

**Option C: Simple Test Script**

Create `test-order.sh`:

```bash
#!/bin/bash

# Get first region ID
REGION_ID=$(curl -s http://localhost:9000/admin/regions | jq -r '.regions[0].id')
echo "Using Region: $REGION_ID"

# Create cart
CART=$(curl -s -X POST http://localhost:9000/store/carts \
  -H "Content-Type: application/json" \
  -d "{\"region_id\": \"$REGION_ID\"}")

CART_ID=$(echo $CART | jq -r '.cart.id')
echo "Cart created: $CART_ID"

# Get first product variant
VARIANT_ID=$(curl -s http://localhost:9000/admin/products | jq -r '.products[0].variants[0].id')
echo "Using variant: $VARIANT_ID"

# Add to cart
curl -s -X POST http://localhost:9000/store/carts/$CART_ID/line-items \
  -H "Content-Type: application/json" \
  -d "{\"variant_id\": \"$VARIANT_ID\", \"quantity\": 1}" > /dev/null

echo "Item added to cart"

# Complete cart
ORDER=$(curl -s -X POST http://localhost:9000/store/carts/$CART_ID/complete \
  -H "Content-Type: application/json")

ORDER_ID=$(echo $ORDER | jq -r '.order.id')
echo "✅ Order created: $ORDER_ID"

# Wait and check workflow
sleep 2
echo "Checking workflow status..."
pm2 logs camunda-workers --lines 50
```

Run it:
```bash
chmod +x test-order.sh
./test-order.sh
```

### Step 3: Watch the Workflow Execute

**Monitor Logs in Real-Time:**

```bash
# Watch all logs
pm2 logs --lines 100

# You should see this sequence:
```

**Expected Log Flow:**

```
# 1. Medusa Backend (order-placed subscriber):
📦 Order placed: order_01HXXX...
🚀 Starting Camunda workflow for order: order_01HXXX...
✅ Workflow started successfully - Order: order_01HXXX..., Instance: 2251799813685251

# 2. Camunda Workers (verify-payment):
💳 [2251799813685251] Verifying payment for order: order_01HXXX...
📝 Updated Medusa: order_01HXXX... → payment_verified
✅ [2251799813685251] Payment verified: order_01HXXX...

# 3. Camunda Workers (reserve-inventory):
📦 [2251799813685251] Reserving inventory for order: order_01HXXX...
📝 Updated Medusa: order_01HXXX... → inventory_reserved
✅ [2251799813685251] Inventory reserved: order_01HXXX...

# 4. Camunda Workers (send-notification):
📧 [2251799813685251] Sending notification for order: order_01HXXX...
📝 Updated Medusa: order_01HXXX... → completed
✅ [2251799813685251] Notification sent: order_01HXXX...
🎉 Order completed: order_01HXXX...
```

**Total execution time:** ~6.5 seconds (2s + 3s + 1.5s delays)

---

## Verification & Monitoring

### Step 1: Verify in Camunda Operate

1. **Open Camunda Console:**
   ```
   https://console.camunda.io/
   ```

2. **Go to Operate:**
   - Click "Operate" in left sidebar
   - You should see dashboard

3. **Check Instances:**
   - Look for "order-fulfillment-poc" process
   - Should show: "1 running" or "1 completed"
   - Click the number

4. **View Process Instance:**
   - Click on the instance ID
   - You'll see the diagram with execution highlighted
   - All tasks should be completed (green checkmarks)
   - End event should be reached

5. **Check Variables:**
   - In instance view, click "Variables" tab
   - Should see:
     ```
     orderId: "order_01HXXX..."
     timestamp: "2026-01-02T..."
     paymentVerified: true
     verifiedAt: "2026-01-02T..."
     inventoryReserved: true
     warehouse: "Mumbai"
     reservedAt: "2026-01-02T..."
     notificationSent: true
     sentAt: "2026-01-02T..."
     ```

6. **Check Audit Log:**
   - Click "Audit Log" tab
   - Shows all events in order:
     - Process instance created
     - Start event activated
     - Verify Payment started → completed
     - Reserve Inventory started → completed
     - Send Notification started → completed
     - End event reached
     - Process instance completed

**✅ Checkpoint:** Process instance shows "completed" with no incidents!

### Step 2: Verify Order Metadata in Medusa

**Via Admin UI:**

1. Go to http://localhost:9000/app/orders
2. Find your order (most recent)
3. Click to open
4. Scroll down to "Metadata" section
5. Should see:
   ```json
   {
     "workflow_instance": "2251799813685251",
     "workflow_started_at": "2026-01-02T11:30:00.000Z",
     "workflow_status": "completed",
     "workflow_message": "Customer notified - Order complete!",
     "last_updated": "2026-01-02T11:30:07.000Z"
   }
   ```

**Via API:**

```bash
# Get order details
curl -s http://localhost:9000/admin/orders/{order_id} \
  -H "Authorization: Bearer {admin_token}" | jq '.order.metadata'

# Expected output:
{
  "workflow_instance": "2251799813685251",
  "workflow_started_at": "2026-01-02T11:30:00.000Z",
  "workflow_status": "completed",
  "workflow_message": "Customer notified - Order complete!",
  "last_updated": "2026-01-02T11:30:07.000Z"
}
```

### Step 3: Performance Verification

Test the timing:

```bash
# Create order and measure time
START=$(date +%s)
./test-order.sh
END=$(date +%s)
DIFF=$((END - START))
echo "Total time: ${DIFF} seconds"

# Expected: ~7-10 seconds (includes API calls + workflow execution)
```

---

## Troubleshooting

### Issue 1: "camundaService is not registered"

**Error in logs:**
```
Error: camundaService is not registered in the container
```

**Solution:**

```bash
# 1. Check medusa-config.ts
cat medusa-config.ts | grep "modules:"

# Should show:
# modules: [
#   {
#     resolve: "./src/modules/camunda",
#   },
# ],

# 2. Check module index exists
ls src/modules/camunda/index.ts

# 3. Restart Medusa
pm2 restart medusa-backend
```

### Issue 2: Workers Not Receiving Tasks

**Symptoms:**
- Order placed, workflow started
- But no worker logs
- Tasks timeout in Camunda

**Solution:**

```bash
# 1. Check workers are connected
pm2 logs camunda-workers | grep "Connected to"

# Should show: Connected to: your-cluster.zeebe.camunda.io:443

# 2. Verify credentials
cat .env | grep ZEEBE

# 3. Test connection manually
curl -v https://your-cluster.zeebe.camunda.io:443

# 4. Restart workers
pm2 restart camunda-workers
```

### Issue 3: BPMN Process Not Found

**Error in logs:**
```
Failed to create process instance: process definition 'order-fulfillment-poc' not found
```

**Solution:**

1. **Verify deployment in Camunda Operate:**
   - Go to console.camunda.io → Operate
   - Check if "order-fulfillment-poc" exists

2. **Redeploy BPMN:**
   - Follow [BPMN Deployment](#bpmn-deployment) steps again
   - Ensure process ID is exactly: `order-fulfillment-poc`

3. **Check BPMN file:**
   ```bash
   cat src/order-fulfillment-poc.bpmn | grep 'id="order-fulfillment-poc"'
   ```

### Issue 4: Workers Can't Update Medusa

**Error in worker logs:**
```
⚠️ Failed to update Medusa (attempt 1/3): connect ECONNREFUSED 127.0.0.1:9000
```

**Solution:**

```bash
# 1. Check Medusa is running
curl http://localhost:9000/health

# 2. Check MEDUSA_BACKEND_URL
cat .env | grep MEDUSA_BACKEND_URL

# Should be: http://localhost:9000

# 3. Test demo endpoint
curl http://localhost:9000/demo

# 4. Check firewall/network
netstat -an | grep 9000
```

### Issue 5: Database Errors

**Error:**
```
Database connection failed
```

**Solution:**

```bash
# For PostgreSQL:
# 1. Check database is running
pg_isready -h localhost -p 5432

# 2. Verify DATABASE_URL
cat .env | grep DATABASE_URL

# 3. Test connection
psql "$DATABASE_URL" -c "SELECT 1"

# 4. Run migrations again
npx medusa db:migrate

# For SQLite:
# Check file permissions
ls -la data/medusa.db
```

---

## Advanced Testing Scenarios

### Test 1: Multiple Concurrent Orders

```bash
# Place 5 orders simultaneously
for i in {1..5}; do
  ./test-order.sh &
done
wait

# Check Camunda Operate
# Should show 5 completed instances
```

### Test 2: Worker Failure Recovery

```bash
# 1. Place an order
./test-order.sh

# 2. Kill workers mid-execution
pm2 stop camunda-workers

# 3. Wait 30 seconds

# 4. Restart workers
pm2 start camunda-workers

# Workers should pick up pending tasks and complete them
```

### Test 3: Network Interruption

```bash
# 1. Start order
./test-order.sh

# 2. Disconnect network briefly
# Workers will retry with exponential backoff

# 3. Reconnect
# Should see retry logs and eventual success
```

---

## Success Criteria

Your integration is working correctly if:

- ✅ All services start without errors
- ✅ BPMN process is deployed in Camunda Cloud
- ✅ Workers connect to Camunda successfully
- ✅ Order placement triggers workflow
- ✅ All 3 workers execute tasks
- ✅ Order metadata is updated at each step
- ✅ Process completes in ~7 seconds
- ✅ Camunda Operate shows completed instance
- ✅ No incidents or errors in logs
- ✅ Order status changes to "completed"

---

## Next Steps

After successful testing:

1. **Review logs** for any warnings
2. **Test error scenarios** (network failures, invalid data)
3. **Add custom business logic** to workers
4. **Implement real services** (payment gateway, inventory system)
5. **Add monitoring** (Datadog, New Relic)
6. **Write automated tests**
7. **Deploy to staging environment**

---

## Quick Test Checklist

Use this for rapid testing:

```bash
# ✅ Environment configured
cat .env | grep ZEEBE_CLIENT_ID

# ✅ Dependencies installed
npm list pm2

# ✅ Database migrated
npx medusa db:migrate

# ✅ BPMN deployed
# Check in console.camunda.io/operate

# ✅ Services running
pm2 status

# ✅ Workers connected
pm2 logs camunda-workers | tail -n 5

# ✅ Create test order
./test-order.sh

# ✅ Verify completion
# Check logs + Camunda Operate
```

---

**Testing Complete!** 🎉

Your Medusa-Camunda integration is fully operational when all checkpoints pass.
