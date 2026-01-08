import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

const WORKFLOW_STEPS = [
  { key: "started", name: "Order Received", description: "Your order has been received and is being processed" },
  { key: "payment_verified", name: "Payment Confirmed", description: "Payment has been verified successfully" },
  { key: "inventory_reserved", name: "Items Reserved", description: "Inventory has been reserved for your order" },
  { key: "completed", name: "Order Complete", description: "Your order is complete and ready for shipping" },
];

/**
 * GET /store/orders/:id/workflow-status
 * Returns the Camunda workflow status for a specific order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    const orderModule = req.scope.resolve(Modules.ORDER);

    // Retrieve the order
    let order;
    try {
      order = await orderModule.retrieveOrder(orderId);
    } catch {
      return res.status(404).json({
        error: `Order not found: ${orderId}`,
      });
    }

    // Extract workflow metadata
    const metadata = order.metadata as Record<string, string> | null;
    const workflowStatus = metadata?.workflow_status || "pending";
    const workflowInstance = metadata?.workflow_instance;
    const workflowStartedAt = metadata?.workflow_started_at;
    const workflowMessage = metadata?.workflow_message;
    const workflowError = metadata?.workflow_error;
    const lastUpdated = metadata?.last_updated;

    // Determine current step index
    const currentStepIndex = WORKFLOW_STEPS.findIndex(
      (step) => step.key === workflowStatus
    );

    // Build steps with status
    const steps = WORKFLOW_STEPS.map((step, index) => {
      let status: "completed" | "current" | "pending";
      
      if (currentStepIndex === -1) {
        status = "pending";
      } else if (index < currentStepIndex) {
        status = "completed";
      } else if (index === currentStepIndex) {
        status = "current";
      } else {
        status = "pending";
      }

      return {
        ...step,
        status,
      };
    });

    return res.json({
      order_id: orderId,
      workflow: {
        instance_id: workflowInstance || null,
        status: workflowStatus,
        message: workflowMessage || null,
        error: workflowError || null,
        started_at: workflowStartedAt || null,
        last_updated: lastUpdated || null,
      },
      steps,
      progress: {
        current: currentStepIndex + 1,
        total: WORKFLOW_STEPS.length,
        percentage: Math.round(
          ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching workflow status:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
