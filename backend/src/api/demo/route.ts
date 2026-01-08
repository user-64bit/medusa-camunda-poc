import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

type UpdateRequestBody = {
    orderId: string;
    status: string;
    message?: string;
};

/**
 * @deprecated This endpoint is deprecated and will be removed in a future version.
 * Use POST /store/orders/:id/workflow-update instead.
 * 
 * This legacy endpoint exists for backward compatibility with older worker versions.
 * New implementations should use the proper REST endpoint.
 */
export async function POST(req: MedusaRequest<UpdateRequestBody>, res: MedusaResponse) {
    try {
        const { orderId, status, message } = req.body;

        // Validate required fields
        if (!orderId || typeof orderId !== "string") {
            return res.status(400).json({
                error: "Missing or invalid orderId",
            });
        }

        if (!status || typeof status !== "string") {
            return res.status(400).json({
                error: "Missing or invalid status",
            });
        }

        console.log(`📝 Update from Camunda: ${orderId} → ${status}`);

        const orderModule = req.scope.resolve(Modules.ORDER);

        // Check if order exists
        try {
            const order = await orderModule.retrieveOrder(orderId);
            if (!order) {
                return res.status(404).json({
                    error: `Order not found: ${orderId}`,
                });
            }
        } catch (error) {
            console.error(`❌ Order not found: ${orderId}`, error);
            return res.status(404).json({
                error: `Order not found: ${orderId}`,
            });
        }

        // Update order metadata with workflow status
        await orderModule.updateOrders(orderId, {
            metadata: {
                workflow_status: status,
                workflow_message: message || "",
                last_updated: new Date().toISOString(),
            },
        });

        // Update order status if completed
        if (status === "completed") {
            await orderModule.updateOrders(orderId, {
                status: "completed",
            });
            console.log(`🎉 Order completed: ${orderId}`);
        }

        return res.json({
            success: true,
            orderId,
            status,
        });
    } catch (error) {
        console.error("❌ Error updating order:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * @deprecated This endpoint is deprecated. Use /health for health checks.
 * Kept for backward compatibility.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    return res.json({
        status: "POC API ready (deprecated - use /health)",
        timestamp: new Date().toISOString(),
        notice: "This endpoint is deprecated. Use /store/orders/:id/workflow-update for workflow updates.",
    });
}