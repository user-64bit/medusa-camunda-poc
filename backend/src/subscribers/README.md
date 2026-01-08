# Event Subscribers

This directory contains event subscribers that react to Medusa events.

## Subscribers

### Order Placed Subscriber (`order-placed.ts`)

Triggers when an order is placed (completed from cart).

**Event:** `order.placed`

**Actions:**
1. Retrieves the order from the order module
2. Starts a Camunda workflow via `CamundaService`
3. Updates order metadata with workflow instance ID
4. Triggers Slack notification via `orderPlacedNotificationWorkflow`

**Flow:**
```
Order Completed → order.placed event
    ↓
Order Retrieved from DB
    ↓
Camunda Workflow Started
    ↓
Order Metadata Updated:
  - workflow_instance
  - workflow_started_at
  - workflow_status: "started"
    ↓
Slack Notification Sent
```

**Error Handling:**
- On workflow failure, error details are stored in order metadata
- Errors are logged with structured context
- Error is re-thrown for visibility in logs

**Metadata Stored:**
```typescript
{
  workflow_instance: string,      // Camunda instance key
  workflow_started_at: string,    // ISO timestamp
  workflow_status: "started" | "error",
  workflow_error?: string,        // On failure
  workflow_error_at?: string,     // On failure
}
```

## Adding New Subscribers

Create a new TypeScript file in this directory:

```typescript
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function myEventHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Handle the event
  console.log("Event received:", data);
}

export const config: SubscriberConfig = {
  event: "event.name",
};
```

For more information, see the [Medusa Events documentation](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers).
