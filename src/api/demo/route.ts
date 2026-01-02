import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";


type UpdateRequestBody = {
    orderId: string;
    status: string;
    message?: string;
};

// Update order status from Camunda workers
export async function POST(req: MedusaRequest<UpdateRequestBody>, res: MedusaResponse) {
    const { orderId, status, message } = req.body;

    console.log(`📝 Update from Camunda: ${orderId} → ${status}`);

    const orderModule = req.scope.resolve(Modules.ORDER);

    await orderModule.updateOrders(orderId, {
        metadata: {
            workflow_status: status,
            workflow_message: message,
            last_updated: new Date().toISOString(),
        },
    });

    if (status === "completed") {
        await orderModule.updateOrders(orderId, {
            status: "completed",
        });
    }

    res.json({ success: true });
}

// Health check
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    res.json({ status: "POC API ready" });
}