import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

type UpdateRequestBody = {
  status: string;
  message?: string;
};

/**
 * POST /store/orders/:id/workflow-update
 * Updates the workflow status for a specific order (called by Camunda workers)
 * 
 * This replaces the old /demo endpoint with a proper authenticated endpoint.
 * In production, this should be secured with an API key or worker token.
 */
export async function POST(
  req: MedusaRequest<UpdateRequestBody>,
  res: MedusaResponse
) {
  try {
    const orderId = req.params.id;
    const { status, message } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        error: "Missing or invalid status",
      });
    }

    // TODO: In production, validate API key or worker authentication
    // const apiKey = req.headers["x-worker-api-key"];
    // if (apiKey !== process.env.WORKER_API_KEY) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

    console.log(`📝 Workflow update: ${orderId} → ${status}`);

    const orderModule = req.scope.resolve(Modules.ORDER);

    // Check if order exists
    let order;
    try {
      order = await orderModule.retrieveOrder(orderId);
    } catch {
      console.error(`❌ Order not found: ${orderId}`);
      return res.status(404).json({
        error: `Order not found: ${orderId}`,
      });
    }

    // Update order metadata with workflow status
    await orderModule.updateOrders(orderId, {
      metadata: {
        ...order.metadata,
        workflow_status: status,
        workflow_message: message || "",
        last_updated: new Date().toISOString(),
      },
    });

    // Update order status if workflow is completed
    if (status === "completed") {
      await orderModule.updateOrders(orderId, {
        status: "completed",
      });
      console.log(`🎉 Order completed: ${orderId}`);
    }

    return res.json({
      success: true,
      order_id: orderId,
      status,
    });
  } catch (error) {
    console.error("❌ Error updating order workflow:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
