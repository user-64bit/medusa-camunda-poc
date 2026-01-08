# Custom API Routes

This directory contains custom API endpoints that extend the Medusa API.

## Endpoints

### Store API

#### `GET /store/orders/:id/workflow-status`

Returns the Camunda workflow status for a specific order.

**Response:**
```json
{
  "order_id": "order_01...",
  "workflow": {
    "instance_id": "2251799813685251",
    "status": "payment_verified",
    "message": "Payment verified successfully",
    "error": null,
    "started_at": "2026-01-05T...",
    "last_updated": "2026-01-05T..."
  },
  "steps": [
    { "key": "started", "name": "Order Received", "status": "completed" },
    { "key": "payment_verified", "name": "Payment Confirmed", "status": "current" },
    { "key": "inventory_reserved", "name": "Items Reserved", "status": "pending" },
    { "key": "completed", "name": "Order Complete", "status": "pending" }
  ],
  "progress": {
    "current": 2,
    "total": 4,
    "percentage": 50
  }
}
```

#### `POST /store/orders/:id/workflow-update`

Updates the workflow status for an order. Called by Camunda workers.

**Request Body:**
```json
{
  "status": "payment_verified",
  "message": "Payment verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_01...",
  "status": "payment_verified"
}
```

**Note:** In production, this endpoint should be secured with an API key.

### Legacy API

#### `POST /demo` (Deprecated)

Legacy endpoint for workflow status updates. Use `/store/orders/:id/workflow-update` instead.

**Request Body:**
```json
{
  "orderId": "order_01...",
  "status": "payment_verified",
  "message": "Payment verified successfully"
}
```

**Note:** This endpoint exists for backward compatibility and will be removed in a future version.

## Adding New Routes

Create a new file at the appropriate path:

```
src/api/
├── admin/           # Admin-only endpoints (requires admin auth)
│   └── my-route/
│       └── route.ts
├── store/           # Store/customer endpoints
│   └── my-route/
│       └── route.ts
└── my-route/        # Public endpoints
    └── route.ts
```

**Example:**
```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModule = req.scope.resolve(Modules.ORDER);
  // Handle request
  res.json({ success: true });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { data } = req.body;
  // Handle request
  res.json({ success: true });
}
```

For more information, see the [Medusa API Routes documentation](https://docs.medusajs.com/learn/fundamentals/api-routes).
