import { SubscriberArgs } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";
import CamundaService from "../modules/camunda/service";

export default async function orderPlacedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    console.log(`📦 Order placed: ${data.id}`);

    const camundaService = container.resolve<CamundaService>("camundaService");
    const orderModule = container.resolve(Modules.ORDER);

    try {
        // Get order
        const order = await orderModule.retrieveOrder(data.id);

        // Start workflow
        const workflow = await camundaService.startOrderWorkflow(order.id);

        // Update order metadata
        await orderModule.updateOrders(order.id, {
            metadata: {
                workflow_instance: workflow.processInstanceKey,
            },
        });

        console.log(`✅ Workflow triggered for order: ${order.id}`);
    } catch (error) {
        console.error(`❌ Error:`, error);
    }
}

export const config = {
    event: "order.placed",
};
