# Medusa Workflows

This directory contains Medusa workflows that orchestrate complex business operations.

## Workflows

### Order Placed Notification (`order-placed-notification.ts`)

Sends a Slack notification when an order is placed.

**Workflow ID:** `order-placed-notification`

**Input:**
```typescript
{
  id: string  // Order ID
}
```

**Flow:**
1. Query order graph for full order details (items, addresses, totals)
2. Send notification via Slack notification provider

**Usage:**
```typescript
import { orderPlacedNotificationWorkflow } from "../workflows/order-placed-notification";

await orderPlacedNotificationWorkflow(container).run({
  input: { id: orderId },
});
```

**Dependencies:**
- `useQueryGraphStep` - Fetches order with all related data
- `sendNotificationsStep` - Sends to configured notification channels

**Data Retrieved:**
- Order ID and display ID
- Customer email
- Shipping address
- Item details with thumbnails
- Subtotal, shipping, tax, discounts, total
- Currency code

## Note on Camunda vs Medusa Workflows

This project uses **both** Camunda and Medusa workflows for different purposes:

| Aspect | Medusa Workflows | Camunda Workflows |
|--------|------------------|-------------------|
| **Use Case** | In-process operations | Long-running orchestration |
| **Duration** | Milliseconds to seconds | Seconds to days |
| **External Systems** | No | Yes |
| **Visibility** | Logs | Operate UI |
| **Human Tasks** | No | Yes |

**Medusa workflows** (this directory) handle quick in-process tasks like sending notifications.

**Camunda workflows** (via `poc-workers.ts`) handle the order fulfillment orchestration with external system coordination, retries, and long-running processes.

## Adding New Workflows

```typescript
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

type WorkflowInput = {
  name: string;
};

export const myWorkflow = createWorkflow(
  "my-workflow-id",
  (input: WorkflowInput) => {
    // Define workflow steps
    return new WorkflowResponse({ success: true });
  }
);
```

For more information, see the [Medusa Workflows documentation](https://docs.medusajs.com/learn/fundamentals/workflows).
