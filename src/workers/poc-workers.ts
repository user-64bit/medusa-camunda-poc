import { Camunda8 } from "@camunda8/sdk";
import axios from "axios";

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

// Worker 1: Verify Payment
client.createWorker({
    taskType: "verify-payment",
    taskHandler: async (job) => {
        const { orderId } = job.variables;
        console.log(`💳 Verifying payment for order: ${orderId}`);

        // Simulate payment verification
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update MedusaJS
        await axios.post(`${MEDUSA_URL}/demo`, {
            orderId,
            status: "payment_verified",
            message: "Payment verified successfully",
        });

        console.log(`✅ Payment verified: ${orderId}`);

        return job.complete({
            paymentVerified: true,
            verifiedAt: new Date().toISOString(),
        });
    },
});

// Worker 2: Reserve Inventory
client.createWorker({
    taskType: "reserve-inventory",
    taskHandler: async (job) => {
        const { orderId } = job.variables;
        console.log(`📦 Reserving inventory for order: ${orderId}`);

        // Simulate inventory reservation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Update MedusaJS
        await axios.post(`${MEDUSA_URL}/demo`, {
            orderId,
            status: "inventory_reserved",
            message: "Inventory reserved at Mumbai warehouse",
        });

        console.log(`✅ Inventory reserved: ${orderId}`);

        return job.complete({
            inventoryReserved: true,
            warehouse: "Mumbai",
            reservedAt: new Date().toISOString(),
        });
    },
});

// Worker 3: Send Notification
client.createWorker({
    taskType: "send-notification",
    taskHandler: async (job) => {
        const { orderId } = job.variables;
        console.log(`📧 Sending notification for order: ${orderId}`);

        // Simulate email sending
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Update MedusaJS
        await axios.post(`${MEDUSA_URL}/demo`, {
            orderId,
            status: "completed",
            message: "Customer notified - Order complete!",
        });

        console.log(`✅ Notification sent: ${orderId}`);

        return job.complete({
            notificationSent: true,
            sentAt: new Date().toISOString(),
        });
    },
});

console.log("🤖 POC Workers started successfully!");
console.log("Listening for tasks...");
