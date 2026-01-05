# Advanced Camunda Integration Guide for E-Commerce
## From POC to Production with Medusa

This guide demonstrates how to leverage Camunda's full power for complex real-world e-commerce scenarios beyond the simple POC.

---

## 📋 Table of Contents

1. [Real-World Complex Scenarios](#real-world-complex-scenarios)
2. [Architectural Patterns](#architectural-patterns)
3. [Implementation Deep Dives](#implementation-deep-dives)
4. [Production Best Practices](#production-best-practices)

---

## Real-World Complex Scenarios

### Scenario 1: **Multi-Vendor Marketplace Order Orchestration**

**Problem:** You're running a marketplace like Amazon/Etsy where one customer order contains items from multiple vendors. You need to:
- Split payment between vendors
- Coordinate fulfillment from different warehouses
- Handle partial fulfillment/cancellations
- Manage vendor-specific SLAs
- Handle escrow/payment holds until delivery confirmation

**Why Camunda Shines:**
- **Parallel Processing**: Process each vendor's items simultaneously
- **Compensation**: Auto-refund if one vendor fails
- **Timeouts**: Escalate if vendor doesn't respond in 24h
- **Visibility**: Real-time dashboard of all vendor statuses

**BPMN Design:**

```
Start → Split Order by Vendor (Parallel Gateway)
  ├─→ Vendor A Flow
  │   ├─→ Reserve Inventory
  │   ├─→ Create Fulfillment (with 24h timer)
  │   ├─→ Ship Items
  │   └─→ Release Payment
  ├─→ Vendor B Flow
  │   ├─→ Reserve Inventory
  │   ├─→ Create Fulfillment (with 24h timer)
  │   ├─→ Ship Items
  │   └─→ Release Payment
  └─→ Vendor C Flow
      └─→ (same as above)
→ Join (Parallel Gateway)
→ Send Customer Notification
→ Complete Order
```

**Implementation:**

```typescript
// src/modules/marketplace/service.ts
class MarketplaceService extends MedusaService({}) {
    private camunda: Camunda8;

    async startMarketplaceOrderWorkflow(order: Order) {
        // Group items by vendor
        const vendorGroups = this.groupItemsByVendor(order);
        
        const result = await this.client.createProcessInstance({
            bpmnProcessId: "marketplace-order-fulfillment",
            variables: {
                orderId: order.id,
                customerId: order.customer_id,
                totalAmount: order.total,
                vendors: vendorGroups.map(v => ({
                    vendorId: v.vendorId,
                    amount: v.subtotal,
                    items: v.items,
                    sla: v.vendor.fulfillmentSLA || 24, // hours
                })),
            },
        });
        
        return result;
    }
}

// src/workers/marketplace-workers.ts
// Vendor Fulfillment Worker
client.createWorker({
    taskType: "fulfill-vendor-items",
    taskHandler: async (job) => {
        const { vendorId, items, orderId } = job.variables as {
            vendorId: string;
            items: any[];
            orderId: string;
        };
        
        try {
            // Notify vendor via webhook/API
            await axios.post(
                `https://vendor-${vendorId}.api/fulfillments`,
                {
                    orderId,
                    items,
                    callbackUrl: `${MEDUSA_URL}/webhooks/vendor/${vendorId}/fulfillment`,
                }
            );
            
            return job.complete({
                fulfillmentRequested: true,
                requestedAt: new Date().toISOString(),
                status: 'pending_vendor',
            });
        } catch (error) {
            // If vendor API fails, retry with backoff
            return job.fail({
                errorMessage: `Vendor ${vendorId} API failed`,
                retries: 5,
                retryBackOff: 60000, // 1 minute
            });
        }
    },
});

// Payment Split Worker
client.createWorker({
    taskType: "split-payment-to-vendors",
    taskHandler: async (job) => {
        const { vendors, orderId } = job.variables as any;
        
        const paymentSplits = await Promise.all(
            vendors.map(async (vendor: any) => {
                // Calculate platform fee
                const platformFee = vendor.amount * 0.15; // 15% commission
                const vendorPayout = vendor.amount - platformFee;
                
                // Create escrow hold (release on delivery)
                const escrow = await createEscrowHold({
                    vendorId: vendor.vendorId,
                    amount: vendorPayout,
                    orderId,
                });
                
                return {
                    vendorId: vendor.vendorId,
                    escrowId: escrow.id,
                    platformFee,
                    vendorPayout,
                };
            })
        );
        
        return job.complete({ paymentSplits });
    },
});
```

**BPMN XML Snippet:**

```xml
<!-- Parallel Split by Vendor -->
<bpmn:parallelGateway id="SplitByVendor" />

<bpmn:serviceTask id="FulfillVendorA" name="Fulfill Vendor A Items">
  <bpmn:extensionElements>
    <zeebe:taskDefinition type="fulfill-vendor-items" />
    <zeebe:ioMapping>
      <zeebe:input source="=vendors[1]" target="vendor" />
    </zeebe:ioMapping>
  </bpmn:extensionElements>
</bpmn:serviceTask>

<!-- Boundary Timer - Escalate if vendor doesn't respond in 24h -->
<bpmn:boundaryEvent id="VendorTimeout" attachedToRef="FulfillVendorA">
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>PT24H</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>

<bpmn:serviceTask id="EscalateVendorDelay" name="Escalate to Support">
  <bpmn:extensionElements>
    <zeebe:taskDefinition type="escalate-vendor-delay" />
  </bpmn:extensionElements>
</bpmn:serviceTask>
```

**What Changes in Your Code:**

1. **Add Vendor Module:** `src/modules/vendor/`
   - Vendor entity, repository, service
   - Webhook handlers for vendor callbacks

2. **Enhanced Workers:** `src/workers/marketplace-workers.ts`
   - Vendor fulfillment coordination
   - Payment splitting logic
   - Escrow management
   - SLA monitoring

3. **New BPMN:** `src/workflows/marketplace-order.bpmn`
   - Parallel vendor processing
   - Timeout handling
   - Compensation flows

4. **Webhook Endpoints:** `src/api/webhooks/vendor/[vendor_id]/route.ts`
   - Receive shipping confirmations
   - Handle cancellations
   - Update order status

---

### Scenario 2: **International Fulfillment with Customs & Compliance**

**Problem:** Selling globally requires:
- Calculate duties/taxes per destination country
- Generate customs documentation
- Check export restrictions
- Handle currency conversion
- Manage international shipping carriers
- Deal with customs delays/holds

**Why Camunda:**
- **Complex Decision Trees**: Different flows per country
- **Long-Running**: Customs can take weeks
- **Event-Driven**: React to carrier tracking events
- **Compliance Audit Trail**: Every step logged

**BPMN Design:**

```
Start → Check Export Restrictions (Exclusive Gateway)
  ├─→ [Restricted] → Cancel Order + Refund
  └─→ [Allowed] → Calculate Duties & Taxes
      → Generate Commercial Invoice
      → Generate Certificate of Origin (if needed)
      → Submit to Customs Broker
      → Wait for Customs Clearance (with events)
        ├─→ [Cleared] → Ship Internationally
        ├─→ [Held] → Send Customer Notification
        └─→ [Rejected] → Compensation Flow
      → Track Shipment (with timer check every 24h)
      → Delivery Confirmation
      → Complete
```

**Implementation:**

```typescript
// src/workers/international-workers.ts
client.createWorker({
    taskType: "calculate-duties-taxes",
    taskHandler: async (job) => {
        const { orderId, destinationCountry, items, total } = job.variables as any;
        
        // Integration with customs calculation service
        const duties = await axios.post('https://api.customsapi.com/calculate', {
            origin: 'US',
            destination: destinationCountry,
            items: items.map((item: any) => ({
                hsCode: item.hsCode, // Harmonized System Code
                value: item.price,
                quantity: item.quantity,
                weight: item.weight,
            })),
        });
        
        return job.complete({
            dutyAmount: duties.data.duty,
            taxAmount: duties.data.vat,
            totalDuties: duties.data.total,
            estimatedDelivery: duties.data.estimatedDays,
        });
    },
});

client.createWorker({
    taskType: "check-export-restrictions",
    taskHandler: async (job) => {
        const { destinationCountry, items } = job.variables as any;
        
        const restrictions = await Promise.all(
            items.map((item: any) =>
                checkExportRestrictions(item.productId, destinationCountry)
            )
        );
        
        const hasRestrictions = restrictions.some(r => r.restricted);
        
        if (hasRestrictions) {
            return job.complete({
                exportAllowed: false,
                restrictionReason: restrictions
                    .filter(r => r.restricted)
                    .map(r => r.reason)
                    .join(', '),
            });
        }
        
        return job.complete({ exportAllowed: true });
    },
});

// Message correlation for customs events
client.createWorker({
    taskType: "submit-to-customs",
    taskHandler: async (job) => {
        const { orderId, documents } = job.variables as any;
        
        const submission = await axios.post(
            'https://customs-broker-api.com/submit',
            {
                documents,
                orderId,
                webhookUrl: `${MEDUSA_URL}/webhooks/customs/${orderId}`,
            }
        );
        
        return job.complete({
            customsReferenceId: submission.data.referenceId,
            submittedAt: new Date().toISOString(),
        });
    },
});

// Webhook handler to publish message to Camunda
// src/api/webhooks/customs/[order_id]/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const { order_id } = req.params;
    const { status, referenceId } = req.body;
    
    const camundaService = req.scope.resolve('camundaService');
    
    // Publish message to correlate with waiting process
    await camundaService.publishMessage({
        messageName: 'customs-update',
        correlationKey: order_id,
        variables: {
            customsStatus: status, // 'cleared', 'held', 'rejected'
            customsReferenceId: referenceId,
            updatedAt: new Date().toISOString(),
        },
    });
    
    res.json({ received: true });
}
```

**BPMN for Message Correlation:**

```xml
<!-- Intermediate Message Catch Event -->
<bpmn:intermediateCatchEvent id="WaitForCustomsClearance">
  <bpmn:incoming>Flow_AfterSubmission</bpmn:incoming>
  <bpmn:outgoing>Flow_AfterClearance</bpmn:outgoing>
  <bpmn:messageEventDefinition messageRef="Message_CustomsUpdate">
    <zeebe:subscription correlationKey="=orderId" />
  </bpmn:messageEventDefinition>
</bpmn:intermediateCatchEvent>

<!-- Gateway to handle different customs statuses -->
<bpmn:exclusiveGateway id="CheckCustomsStatus">
  <bpmn:incoming>Flow_AfterClearance</bpmn:incoming>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_Cleared" sourceRef="CheckCustomsStatus" targetRef="ShipInternational">
  <bpmn:conditionExpression>customsStatus = "cleared"</bpmn:conditionExpression>
</bpmn:sequenceFlow>

<bpmn:sequenceFlow id="Flow_Held" sourceRef="CheckCustomsStatus" targetRef="NotifyCustomerDelay">
  <bpmn:conditionExpression>customsStatus = "held"</bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

---

### Scenario 3: **Subscription Renewal with Dunning Management**

**Problem:** Managing recurring subscriptions requires:
- Automatic billing on schedule
- Handle failed payments (dunning)
- Retry with smart intervals
- Downgrade/cancel after X failures
- Send reminder emails
- Offer payment method update
- Pause/resume subscriptions

**Why Camunda:**
- **Timer Start Events**: Trigger renewals automatically
- **Complex Retry Logic**: Configurable dunning strategy
- **Customer Communication**: Multi-step email campaigns
- **State Management**: Track payment attempts

**BPMN Design:**

```
Timer Start (Monthly) → Fetch Due Subscriptions
  → For Each Subscription (Multi-Instance)
      → Check if Active
        [Yes] → Attempt Payment
          [Success] → Send Receipt → Extend Subscription → Complete
          [Failed] → Increment Retry Count
            → Retry Attempt 1 (after 3 days)
              [Success] → Send Receipt → Complete
              [Failed] → Retry Attempt 2 (after 7 days)
                [Success] → Send Receipt → Complete
                [Failed] → Retry Attempt 3 (after 14 days)
                  [Success] → Send Receipt → Complete
                  [Failed] → Cancel Subscription → Notify Customer
```

**Implementation:**

```typescript
// src/workflows/subscription-renewal.bpmn
// Timer Start Event triggers daily at 2 AM

// src/workers/subscription-workers.ts
client.createWorker({
    taskType: "attempt-subscription-payment",
    taskHandler: async (job) => {
        const { subscriptionId, customerId, amount, attempt = 1 } = job.variables as any;
        
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // cents
                currency: 'usd',
                customer: customerId,
                description: `Subscription renewal - ${subscriptionId}`,
                metadata: { subscriptionId, attempt },
            });
            
            if (paymentIntent.status === 'succeeded') {
                // Update subscription in Medusa
                await updateSubscription(subscriptionId, {
                    lastPaymentDate: new Date(),
                    nextBillingDate: addMonths(new Date(), 1),
                    status: 'active',
                });
                
                return job.complete({
                    paymentSuccess: true,
                    paymentIntentId: paymentIntent.id,
                    nextRetry: null,
                });
            } else {
                throw new Error('Payment requires action');
            }
        } catch (error: any) {
            // Determine next retry delay based on attempt number
            const retryDelays = [
                3 * 24 * 60 * 60 * 1000,  // 3 days
                7 * 24 * 60 * 60 * 1000,  // 7 days
                14 * 24 * 60 * 60 * 1000, // 14 days
            ];
            
            const nextRetryDelay = retryDelays[attempt - 1];
            
            if (attempt >= 3) {
                // Final attempt failed - cancel subscription
                return job.complete({
                    paymentSuccess: false,
                    shouldCancel: true,
                    failureReason: error.message,
                });
            }
            
            return job.complete({
                paymentSuccess: false,
                attempt: attempt + 1,
                nextRetryDelay,
                shouldCancel: false,
            });
        }
    },
});

client.createWorker({
    taskType: "send-payment-failed-email",
    taskHandler: async (job) => {
        const { customerId, subscriptionId, attempt, nextRetryDate } = job.variables as any;
        
        const customer = await getCustomer(customerId);
        const subscription = await getSubscription(subscriptionId);
        
        const emailTemplates = {
            1: 'payment-retry-1', // Gentle reminder
            2: 'payment-retry-2', // Update payment method
            3: 'payment-final',   // Last chance before cancellation
        };
        
        await sendEmail({
            to: customer.email,
            template: emailTemplates[attempt],
            data: {
                customerName: customer.first_name,
                subscriptionName: subscription.product.name,
                amount: subscription.amount,
                nextRetryDate,
                updatePaymentUrl: `${STORE_URL}/account/payment-methods`,
            },
        });
        
        return job.complete({ emailSent: true });
    },
});
```

**BPMN with Timer Intermediate Events:**

```xml
<!-- After failed payment, wait before retry -->
<bpmn:intermediateCatchEvent id="WaitBeforeRetry1">
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>P3D</bpmn:timeDuration> <!-- 3 days -->
  </bpmn:timerEventDefinition>
</bpmn:intermediateCatchEvent>

<!-- Multi-instance for processing all subscriptions -->
<bpmn:serviceTask id="ProcessSubscription" name="Process Subscription">
  <bpmn:extensionElements>
    <zeebe:taskDefinition type="attempt-subscription-payment" />
  </bpmn:extensionElements>
  <bpmn:multiInstanceLoopCharacteristics>
    <zeebe:loopCharacteristics inputCollection="=subscriptions" />
  </bpmn:multiInstanceLoopCharacteristics>
</bpmn:serviceTask>
```

---

### Scenario 4: **Return & Refund Workflow with Fraud Detection**

**Problem:**
- Customer initiates return
- Verify return eligibility (30-day window, original condition)
- Fraud check (too many returns from same customer?)
- Send return label
- Wait for item to arrive
- QA inspection
- Approve/reject return
- Process refund or store credit
- Restock inventory

**Implementation:**

```typescript
// src/workers/return-workers.ts
client.createWorker({
    taskType: "fraud-check-return",
    taskHandler: async (job) => {
        const { customerId, orderId, returnAmount } = job.variables as any;
        
        // Check customer's return history
        const returnHistory = await getCustomerReturnHistory(customerId, {
            last: 90, // days
        });
        
        const fraudIndicators = {
            highReturnRate: returnHistory.count > 10,
            highValueReturns: returnHistory.totalValue > 5000,
            multipleReturnsToday: returnHistory.todayCount > 2,
            alwaysReturnsSameItem: checkPatternMatch(returnHistory.items),
        };
        
        const fraudScore = calculateFraudScore(fraudIndicators);
        
        if (fraudScore > 75) {
            // Require manual review
            return job.complete({
                requiresReview: true,
                fraudScore,
                autoApprove: false,
            });
        }
        
        return job.complete({
            requiresReview: false,
            fraudScore,
            autoApprove: fraudScore < 30,
        });
    },
});

client.createWorker({
    taskType: "inspect-returned-item",
    taskHandler: async (job) => {
        const { returnId } = job.variables as any;
        
        // This would be triggered by warehouse staff scanning the item
        // For now, we wait for a message correlation from webhook
        
        return job.complete({
            awaitingInspection: true,
            inspectionDue: addDays(new Date(), 2),
        });
    },
});
```

**BPMN with User Tasks:**

```xml
<!-- User Task for manual review -->
<bpmn:userTask id="ReviewReturn" name="Review Return Request">
  <bpmn:extensionElements>
    <zeebe:assignmentDefinition assignee="=supportTeam" />
    <zeebe:formDefinition formKey="return-review-form" />
  </bpmn:extensionElements>
</bpmn:userTask>

<!-- Message correlation for QA inspection result -->
<bpmn:intermediateCatchEvent id="WaitForInspection">
  <bpmn:messageEventDefinition messageRef="Message_InspectionComplete">
    <zeebe:subscription correlationKey="=returnId" />
  </bpmn:messageEventDefinition>
</bpmn:intermediateCatchEvent>
```

---

## Architectural Patterns

### Pattern 1: **Saga Pattern for Distributed Transactions**

When an order spans multiple services (Payment, Inventory, Shipping), use Camunda to orchestrate the saga:

```typescript
// Saga with compensation
const orderSaga = {
    steps: [
        { task: 'reserve-inventory', compensation: 'release-inventory' },
        { task: 'authorize-payment', compensation: 'cancel-payment' },
        { task: 'create-shipment', compensation: 'cancel-shipment' },
    ],
};

// If any step fails, Camunda executes compensation in reverse order
```

**BPMN:**
```xml
<!-- Each service task has a compensateEventDefinition -->
<bpmn:serviceTask id="ReserveInventory">
  <bpmn:compensateEventDefinition />
</bpmn:serviceTask>

<bpmn:serviceTask id="CompensateInventory">
  <bpmn: isForCompensation>true</bpmn:isForCompensation>
</bpmn:serviceTask>
```

### Pattern 2: **Event-Driven Architecture**

React to external events (carrier tracking, payment webhooks, customer actions):

```typescript
// Publish messages from webhooks
await camundaService.publishMessage({
    messageName: 'package-delivered',
    correlationKey: orderId,
    variables: {
        deliveredAt: timestamp,
        signedBy: signature,
    },
});

// Process instance waits for this message
```

### Pattern 3: **Long-Running Processes with Human Tasks**

For processes that need manual intervention:

```xml
<bpmn:userTask id="ApproveRefund" name="Approve Refund">
  <bpmn:extensionElements>
    <zeebe:assignmentDefinition assignee="=manager" />
    <zeebe:taskHeaders>
      <zeebe:header key="priority" value="high" />
    </zeebe:taskHeaders>
  </bpmn:extensionElements>
</bpmn:userTask>
```

Integrate with Camunda Tasklist or build custom UI:

```typescript
// Fetch pending tasks
const tasks = await camundaService.getUserTasks({
    assignee: userId,
    state: 'CREATED',
});

// Complete task
await camundaService.completeUserTask(taskId, {
    approved: true,
    reason: 'Customer verified',
});
```

---

## Production Best Practices

### 1. **Separate Workers by Concern**

```
src/workers/
  ├── payment-workers.ts      # Payment processing
  ├── inventory-workers.ts    # Stock management
  ├── shipping-workers.ts     # Fulfillment
  ├── notification-workers.ts # Customer communication
  └── fraud-workers.ts        # Fraud detection
```

### 2. **Environment-Specific Deployment**

```typescript
// Deploy different BPMN versions per environment
const deployBPMN = async (env: 'dev' | 'staging' | 'prod') => {
    const bpmnFile = `workflows/${env}/order-fulfillment.bpmn`;
    
    await zeebe.deployProcess({
        definition: fs.readFileSync(bpmnFile),
        name: `order-fulfillment-${env}`,
    });
};
```

### 3. **Monitoring & Alerts**

```typescript
// Track process metrics
client.createWorker({
    taskType: 'any-task',
    taskHandler: async (job) => {
        const startTime = Date.now();
        
        try {
            const result = await executeTask(job);
            
            // Send metrics
            await metrics.timing('camunda.task.duration', Date.now() - startTime, {
                taskType: job.type,
                success: true,
            });
            
            return job.complete(result);
        } catch (error) {
            await metrics.timing('camunda.task.duration', Date.now() - startTime, {
                taskType: job.type,
                success: false,
            });
            
            // Alert on failures
            if (job.retries === 0) {
                await sendAlert({
                    title: `Task ${job.type} failed permanently`,
                    orderId: job.variables.orderId,
                });
            }
            
            throw error;
        }
    },
});
```

### 4. **Versioning Workflows**

```typescript
// Use version tags in process IDs
const WORKFLOW_VERSION = 'v2';

await zeebe.createProcessInstance({
    bpmnProcessId: `order-fulfillment-${WORKFLOW_VERSION}`,
    variables: { orderId },
});

// Old instances continue on old version
// New instances use new version
```

### 5. **Testing Workflows**

```typescript
// Integration test
describe('Order Fulfillment Workflow', () => {
    it('should complete successfully', async () => {
        const instance = await startWorkflow({ orderId: 'test-123' });
        
        // Wait for  first task
        const job = await waitForJob('verify-payment');
        expect(job.variables.orderId).toBe('test-123');
        
        // Complete it
        await completeJob(job, { paymentVerified: true });
        
        // Assert next task
        const nextJob = await waitForJob('reserve-inventory');
        expect(nextJob).toBeDefined();
    });
});
```

---

## Summary: What to Change Where

### **New Files to Add:**

1. **BPMN Workflows:** `src/workflows/*.bpmn`
   - One file per business process
   - Version control these!

2. **Specialized Workers:** `src/workers/*-workers.ts`
   - Domain-specific task handlers
   - Each worker = one microservice concern

3. **Webhook Handlers:** `src/api/webhooks/**/*.ts`
   - Receive external events
   - Publish messages to Camunda

4. **Camunda Admin UI:** `src/admin/extensions/camunda-monitor/`
   - Custom widgets to show workflow status
   - Embedded Operate/Tasklist

### **Modules to Modify:**

1. **Order Module:** Add workflow metadata
   ```typescript
   order.metadata = {
       workflow_instance_id,
       workflow_version,
       current_step,
       last_updated,
   };
   ```

2. **Subscription Module:** Trigger renewals
3. **Return Module:** Initiate return workflows
4. **Fulfillment Module:** Coordinate with Camunda

### **Infrastructure:**

1. **Separate Worker Pods:** Scale workers independently
2. **Redis/RabbitMQ:** For message queuing (optional)
3. **Monitoring:** Grafana dashboards for Camunda metrics
4. **Logging:** Centralized logging (ELK/Datadog)

---

## When to Use Camunda vs. Medusa Workflows

**Use Camunda when:**
- ✅ Process spans multiple days/weeks
- ✅ Need human tasks/approvals
- ✅ Complex branching logic
- ✅ External system coordination
- ✅ Audit trail requirements
- ✅ Need visual process monitoring

**Use Medusa Workflows when:**
- ✅ Simple, fast operations
- ✅ Everything stays in Medusa
- ✅ No external dependencies
- ✅ Immediate execution needed

---

**The key insight:** Camunda excels at **orchestrating chaos**—coordinating multiple systems, handling failures gracefully, and providing visibility into complex long-running processes. For simple e-commerce flows, Medusa's built-in workflows suffice. For marketplace, B2B, international, or subscription complexity, Camunda is essential.
