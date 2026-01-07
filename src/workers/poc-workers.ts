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

// Helper function to update Medusa with retries
async function updateMedusa(
    orderId: string,
    status: string,
    message: string,
    retries = 3
): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await axios.post(
                `${MEDUSA_URL}/demo`,
                { orderId, status, message },
                { timeout: 5000 }
            );
            console.log(`📝 Updated Medusa: ${orderId} → ${status}`);
            return;
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

// Worker 1: Verify Payment
client.createWorker({
    taskType: "verify-payment",
    taskHandler: async (job) => {
        const { orderId } = job.variables as { orderId: string };
        console.log(`💳 [${String(job.key)}] Verifying payment for order: ${orderId}`);

        try {
            // Simulate payment verification
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Update MedusaJS
            await updateMedusa(
                orderId,
                "payment_verified",
                "Payment verified successfully"
            );

            // Send Slack notification
            await slackNotifier.sendPaymentVerified(orderId);

            console.log(`✅ [${String(job.key)}] Payment verified: ${orderId}`);
            console.log("\n\n job -->", job);
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
        console.log(`📦 [${String(job.key)}] Reserving inventory for order: ${orderId}`);

        try {
            // Simulate inventory reservation
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Update MedusaJS
            await updateMedusa(
                orderId,
                "inventory_reserved",
                "Inventory reserved at Mumbai warehouse"
            );

            // Send Slack notification
            await slackNotifier.sendInventoryReserved(orderId, "Mumbai");

            console.log(`✅ [${String(job.key)}] Inventory reserved: ${orderId}`);
            console.log("\n\n job -->", job);

            return job.complete({
                inventoryReserved: true,
                warehouse: "Mumbai",
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
        const { orderId } = job.variables as { orderId: string };
        console.log(`📧 [${String(job.key)}] Sending notification for order: ${orderId}`);

        try {
            // Simulate email sending
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Update MedusaJS
            await updateMedusa(
                orderId,
                "completed",
                "Customer notified - Order complete!"
            );

            // Send Slack notification
            await slackNotifier.sendOrderCompleted(orderId);

            console.log(`✅ [${String(job.key)}] Notification sent: ${orderId}`);
            console.log("\n\n job -->", job);

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

console.log("🤖 POC Workers started successfully!");
console.log(`📡 Connected to: ${process.env.ZEEBE_ADDRESS}`);
console.log(`🔗 Medusa backend: ${MEDUSA_URL}`);
console.log("👂 Listening for tasks...\n");
