import { SubscriberArgs } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";
import CamundaService from "../modules/camunda/service";
import { CAMUNDA_MODULE } from "../modules/camunda";
import { orderPlacedNotificationWorkflow } from "../workflows/order-placed-notification";

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const orderId = data.id;
    console.log(`📦 Order placed: ${orderId}`);

    const camundaService = container.resolve<CamundaService>(CAMUNDA_MODULE);
    const orderModule = container.resolve(Modules.ORDER);

    try {
        // Get order
        const order = await orderModule.retrieveOrder(orderId);

        if (!order) {
            throw new Error(`Order not found: ${orderId}`);
        }

        console.log(`🚀 Starting Camunda workflow for order: ${orderId}`);

        // Start workflow
        const workflow = await camundaService.startOrderWorkflow(order.id);

        // Update order metadata with workflow instance
        await orderModule.updateOrders(order.id, {
            metadata: {
                workflow_instance: workflow.processInstanceKey,
                workflow_started_at: new Date().toISOString(),
                workflow_status: "started",
            },
        });

        console.log(
            `✅ Workflow started successfully - Order: ${order.id}, Instance: ${workflow.processInstanceKey}`
        );

        await orderPlacedNotificationWorkflow(container)
            .run({
                input: {
                    id: order.id,
                },
            })

    } catch (error) {
        console.error(
            `❌ Failed to start workflow for order: ${orderId}`,
            {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            }
        );

        // Update order metadata to indicate workflow failure
        try {
            await orderModule.updateOrders(orderId, {
                metadata: {
                    workflow_error: error instanceof Error ? error.message : String(error),
                    workflow_error_at: new Date().toISOString(),
                },
            });
        } catch (updateError) {
            console.error(`❌ Failed to update order metadata:`, updateError);
        }

        // Re-throw to ensure the error is visible
        throw error;
    }
}

export const config = {
    event: "order.placed",
};
