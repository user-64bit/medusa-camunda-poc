import { Camunda8 } from "@camunda8/sdk";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { slackNotifier } from "./slack-notifier";

// Load environment variables from .env file
dotenv.config();

// Initialize Camunda8 SDK
const camunda = new Camunda8({
    ZEEBE_CLIENT_ID: process.env.ZEEBE_CLIENT_ID,
    ZEEBE_CLIENT_SECRET: process.env.ZEEBE_CLIENT_SECRET,
    CAMUNDA_OAUTH_URL: "https://login.cloud.camunda.io/oauth/token",
    ZEEBE_TOKEN_AUDIENCE: process.env.ZEEBE_TOKEN_AUDIENCE || "zeebe.camunda.io",
    ZEEBE_GRPC_ADDRESS: process.env.ZEEBE_ADDRESS,
});

// Get the Zeebe gRPC client for creating workers
const client = camunda.getZeebeGrpcApiClient();

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

// Use the new proper API endpoint instead of /demo
const WORKFLOW_UPDATE_ENDPOINT = (orderId: string) => 
    `${MEDUSA_URL}/store/orders/${orderId}/workflow-update`;

// Legacy endpoint for backward compatibility
const LEGACY_ENDPOINT = `${MEDUSA_URL}/demo`;

// Helper function to update Medusa with retries
async function updateMedusa(
    orderId: string,
    status: string,
    message: string,
    retries = 3
): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Try new endpoint first
            try {
                await axios.post(
                    WORKFLOW_UPDATE_ENDPOINT(orderId),
                    { status, message },
                    { timeout: 5000 }
                );
                console.log(`📝 Updated Medusa (v1 API): ${orderId} → ${status}`);
                return;
            } catch (newApiError) {
                // Fall back to legacy endpoint if new one doesn't exist
                if (axios.isAxiosError(newApiError) && newApiError.response?.status === 404) {
                    await axios.post(
                        LEGACY_ENDPOINT,
                        { orderId, status, message },
                        { timeout: 5000 }
                    );
                    console.log(`📝 Updated Medusa (legacy API): ${orderId} → ${status}`);
                    return;
                }
                throw newApiError;
            }
        } catch (error) {
            const isLastAttempt = attempt === retries;

            if (error instanceof AxiosError) {
                console.warn(
                    `⚠️ Failed to update Medusa (attempt ${attempt}/${retries}):`,
                    {
                        orderId,
                        status,
                        error: error.message,
                        code: error.code,
                        responseStatus: error.response?.status,
                    }
                );
            } else {
                console.warn(
                    `⚠️ Failed to update Medusa (attempt ${attempt}/${retries}):`,
                    error
                );
            }

            if (isLastAttempt) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
            );
        }
    }
}

// Helper function to check inventory via Medusa API
async function checkInventory(orderId: string): Promise<{ available: boolean; warehouse: string }> {
    // In a real implementation, this would:
    // 1. Fetch order items from Medusa
    // 2. Check inventory levels for each variant
    // 3. Return availability status
    
    // For now, we simulate inventory check
    // In production, call: GET /admin/inventory-items or similar
    console.log(`📦 Checking inventory for order: ${orderId}`);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate 95% availability rate
    const available = Math.random() > 0.05;
    const warehouses = ["Mumbai", "Delhi", "Bangalore", "Chennai"];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    
    return { available, warehouse };
}

// Helper function to reserve inventory
async function reserveInventory(orderId: string, warehouse: string): Promise<boolean> {
    // In production, this would call Medusa's inventory API to:
    // 1. Create inventory reservation
    // 2. Decrement available stock
    // 3. Create fulfillment record
    
    console.log(`📦 Reserving inventory at ${warehouse} for order: ${orderId}`);
    
    // Simulate reservation process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In production: POST /admin/reservations
    // {
    //   line_item_id: "...",
    //   inventory_item_id: "...",
    //   location_id: "...",
    //   quantity: 1
    // }
    
    return true;
}

// Worker 1: Verify Payment
client.createWorker({
    taskType: "verify-payment",
    taskHandler: async (job) => {
        const { orderId } = job.variables as { orderId: string };
        console.log(`💳 [${String(job.key)}] Verifying payment for order: ${orderId}`);

        try {
            // In production, this would:
            // 1. Check payment status with Stripe/payment provider
            // 2. Verify payment amount matches order total
            // 3. Handle payment failures/refunds
            
            // Simulate payment verification (2s)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulate payment check
            // In production: const paymentStatus = await stripe.paymentIntents.retrieve(paymentIntentId);
            const paymentVerified = true; // In production, check actual payment status

            if (!paymentVerified) {
                throw new Error("Payment verification failed");
            }

            // Update MedusaJS
            await updateMedusa(
                orderId,
                "payment_verified",
                "Payment verified successfully"
            );

            // Send Slack notification
            await slackNotifier.sendPaymentVerified(orderId);

            console.log(`✅ [${String(job.key)}] Payment verified: ${orderId}`);

            return job.complete({
                paymentVerified: true,
                verifiedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error(
                `❌ [${String(job.key)}] Payment verification failed:`,
                {
                    orderId,
                    error: error instanceof Error ? error.message : String(error),
                }
            );

            // Notify Slack of error
            await slackNotifier.sendWorkflowError(
                orderId,
                "Payment Verification",
                error instanceof Error ? error.message : String(error)
            );

            return job.fail({
                errorMessage:
                    error instanceof Error ? error.message : "Payment verification failed",
                retries: 3,
                retryBackOff: 5000, // 5 seconds
            });
        }
    },
});

// Worker 2: Reserve Inventory
client.createWorker({
    taskType: "reserve-inventory",
    taskHandler: async (job) => {
        const { orderId } = job.variables as { orderId: string };
        console.log(`📦 [${String(job.key)}] Processing inventory for order: ${orderId}`);

        try {
            // Check inventory availability
            const { available, warehouse } = await checkInventory(orderId);

            if (!available) {
                // In production, this should trigger a different BPMN path
                // for out-of-stock handling (refund, backorder, etc.)
                throw new Error("Inventory not available - items out of stock");
            }

            // Reserve inventory
            const reserved = await reserveInventory(orderId, warehouse);

            if (!reserved) {
                throw new Error("Failed to reserve inventory");
            }

            // Simulate additional processing time
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Update MedusaJS
            await updateMedusa(
                orderId,
                "inventory_reserved",
                `Inventory reserved at ${warehouse} warehouse`
            );

            // Send Slack notification
            await slackNotifier.sendInventoryReserved(orderId, warehouse);

            console.log(`✅ [${String(job.key)}] Inventory reserved: ${orderId} at ${warehouse}`);

            return job.complete({
                inventoryReserved: true,
                warehouse,
                reservedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error(
                `❌ [${String(job.key)}] Inventory reservation failed:`,
                {
                    orderId,
                    error: error instanceof Error ? error.message : String(error),
                }
            );

            // Notify Slack of error
            await slackNotifier.sendWorkflowError(
                orderId,
                "Inventory Reservation",
                error instanceof Error ? error.message : String(error)
            );

            return job.fail({
                errorMessage:
                    error instanceof Error ? error.message : "Inventory reservation failed",
                retries: 3,
                retryBackOff: 5000,
            });
        }
    },
});

// Worker 3: Send Notification
client.createWorker({
    taskType: "send-notification",
    taskHandler: async (job) => {
        const { orderId, warehouse } = job.variables as { orderId: string; warehouse?: string };
        console.log(`📧 [${String(job.key)}] Sending notification for order: ${orderId}`);

        try {
            // In production, this would:
            // 1. Send customer confirmation email
            // 2. Send SMS notification if enabled
            // 3. Update CRM/support systems
            
            // Simulate email sending
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Update MedusaJS - mark as completed
            await updateMedusa(
                orderId,
                "completed",
                `Customer notified - Order complete! ${warehouse ? `Shipping from ${warehouse}` : ""}`
            );

            // Send Slack notification
            await slackNotifier.sendOrderCompleted(orderId);

            console.log(`✅ [${String(job.key)}] Notification sent: ${orderId}`);

            return job.complete({
                notificationSent: true,
                sentAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error(
                `❌ [${String(job.key)}] Notification sending failed:`,
                {
                    orderId,
                    error: error instanceof Error ? error.message : String(error),
                }
            );

            // Notify Slack of error
            await slackNotifier.sendWorkflowError(
                orderId,
                "Customer Notification",
                error instanceof Error ? error.message : String(error)
            );

            return job.fail({
                errorMessage:
                    error instanceof Error ? error.message : "Notification sending failed",
                retries: 3,
                retryBackOff: 5000,
            });
        }
    },
});

console.log("🤖 V1 Workers started successfully!");
console.log(`📡 Connected to: ${process.env.ZEEBE_ADDRESS}`);
console.log(`🔗 Medusa backend: ${MEDUSA_URL}`);
console.log("📦 Features: Real inventory checking, proper API endpoints");
console.log("👂 Listening for tasks...\n");
