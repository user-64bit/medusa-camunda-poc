# Custom Modules

This directory contains custom Medusa modules that extend the platform's functionality.

## Modules

### Camunda Module (`./camunda/`)

Provides Camunda Cloud workflow orchestration integration.

**Service:** `CamundaService`
**Module Key:** `camundaService`

**Features:**
- Initialize Camunda8 SDK with OAuth2 credentials
- Create Zeebe gRPC client for process instance management
- Start order fulfillment workflows

**Usage:**
```typescript
import CamundaService from "../modules/camunda/service";
import { CAMUNDA_MODULE } from "../modules/camunda";

// In API route or subscriber
const camundaService = container.resolve<CamundaService>(CAMUNDA_MODULE);
const workflow = await camundaService.startOrderWorkflow(orderId);
```

**Configuration:**
Requires the following environment variables:
- `ZEEBE_CLIENT_ID` - OAuth2 client ID
- `ZEEBE_CLIENT_SECRET` - OAuth2 client secret
- `ZEEBE_ADDRESS` - Cluster endpoint (e.g., `cluster.zeebe.camunda.io:443`)
- `ZEEBE_TOKEN_AUDIENCE` - Token audience (default: `zeebe.camunda.io`)

### Slack Module (`./slack/`)

Provides Slack notification integration via the Medusa notification provider system.

**Service:** `SlackNotificationProviderService`
**Provider ID:** `slack`

**Features:**
- Send rich order creation notifications to Slack
- Format order details with items, pricing, and customer info
- Support for webhook-based delivery

**Configuration:**
Set in `medusa-config.ts` under notification providers:
```typescript
{
  resolve: "./src/modules/slack",
  id: "slack",
  options: {
    channels: ["slack"],
    webhook_url: process.env.SLACK_WEBHOOK_URL,
    admin_url: process.env.SLACK_ADMIN_URL,
  },
}
```

**Supported Templates:**
- `order-created` - Sends detailed order notification with items and totals

## Adding New Modules

1. Create a new directory under `src/modules/`
2. Create `service.ts` with your service class extending `MedusaService`
3. Create `index.ts` exporting the module definition
4. Add to `medusa-config.ts` modules array
5. Run `npx medusa db:migrate` if the module has data models

For more information, see the [Medusa Modules documentation](https://docs.medusajs.com/learn/fundamentals/modules).
