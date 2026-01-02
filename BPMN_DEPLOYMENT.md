# Camunda 8 BPMN Deployment Guide

## Prerequisites

Before deploying the BPMN process, ensure you have:

1. A Camunda 8 SaaS account at https://console.camunda.io/
2. A cluster created in Camunda Cloud
3. Client credentials generated (Client ID and Secret)

## Deployment Options

### Option 1: Deploy via Camunda Web Modeler (Recommended for POC)

1. Navigate to https://console.camunda.io/
2. Select your cluster
3. Go to "Modeler" in the left sidebar
4. Click "Create New Project" or open existing project
5. Click "Create New File" → "BPMN Diagram"
6. Click the "Code" tab and paste the contents of `src/order-fulfillment-poc.bpmn`
7. Click "Deploy" button in the top right
8. Select your cluster and click "Deploy"

### Option 2: Deploy via Camunda Desktop Modeler

1. Download and install Camunda Modeler from https://camunda.com/download/modeler/
2. Open the file `src/order-fulfillment-poc.bpmn` in Camunda Modeler
3. Click the deploy icon (rocket) in the bottom right
4. Configure your cluster endpoint:
   - Cluster endpoint: Your `ZEEBE_ADDRESS`
   - Client ID: Your `ZEEBE_CLIENT_ID`
   - Client Secret: Your `ZEEBE_CLIENT_SECRET`
5. Click "Deploy"

### Option 3: Deploy via SDK (Automated - Coming Soon)

A deployment script can be created to automate this process:

```typescript
// scripts/deploy-bpmn.ts
import { Camunda8 } from "@camunda8/sdk";
import * as fs from "fs";
import * as path from "path";

const camunda = new Camunda8({
    ZEEBE_CLIENT_ID: process.env.ZEEBE_CLIENT_ID,
    ZEEBE_CLIENT_SECRET: process.env.ZEEBE_CLIENT_SECRET,
    CAMUNDA_OAUTH_URL: "https://login.cloud.camunda.io/oauth/token",
    ZEEBE_TOKEN_AUDIENCE: process.env.ZEEBE_TOKEN_AUDIENCE || "zeebe.camunda.io",
    ZEEBE_GRPC_ADDRESS: process.env.ZEEBE_ADDRESS,
});

const client = camunda.getZeebeGrpcApiClient();

async function deployBPMN() {
    const bpmnPath = path.join(__dirname, "../src/order-fulfillment-poc.bpmn");
    const bpmnContent = fs.readFileSync(bpmnPath, "utf8");

    const deployment = await client.deployResource({
        name: "order-fulfillment-poc.bpmn",
        process: Buffer.from(bpmnContent),
    });

    console.log("✅ BPMN deployed successfully:", deployment);
}

deployBPMN().catch(console.error);
```

## Verification

After deployment, verify the process is available:

1. Go to Camunda Console → Your Cluster → Operate
2. You should see "order-fulfillment-poc" in the list of processes
3. The process should show 0 running instances initially

## Process Definition

The deployed process has the following structure:

- **Process ID**: `order-fulfillment-poc`
- **Service Tasks**:
  - `verify-payment` - Handled by payment worker
  - `reserve-inventory` - Handled by inventory worker
  - `send-notification` - Handled by notification worker

Make sure your workers are running and listening for these task types before testing the integration.
