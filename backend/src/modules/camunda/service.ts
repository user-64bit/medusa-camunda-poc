import { MedusaService } from "@medusajs/framework/utils";
import { Camunda8 } from "@camunda8/sdk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

class CamundaService extends MedusaService({}) {
    private camunda: Camunda8;
    private client: ReturnType<Camunda8["getZeebeGrpcApiClient"]>;

    constructor(container: any) {
        super(container);

        // Initialize Camunda8 SDK
        this.camunda = new Camunda8({
            ZEEBE_CLIENT_ID: process.env.ZEEBE_CLIENT_ID,
            ZEEBE_CLIENT_SECRET: process.env.ZEEBE_CLIENT_SECRET,
            CAMUNDA_OAUTH_URL: "https://login.cloud.camunda.io/oauth/token",
            ZEEBE_TOKEN_AUDIENCE: process.env.ZEEBE_TOKEN_AUDIENCE || "zeebe.camunda.io",
            ZEEBE_GRPC_ADDRESS: process.env.ZEEBE_ADDRESS,
        });

        // Use Zeebe gRPC client (same as workers)
        this.client = this.camunda.getZeebeGrpcApiClient();
    }

    async startOrderWorkflow(orderId: string) {
        console.log(`🚀 Starting workflow for order: ${orderId}`);

        const result = await this.client.createProcessInstance({
            bpmnProcessId: "order-fulfillment-poc",
            variables: {
                orderId,
                timestamp: new Date().toISOString(),
            },
        });

        console.log(`✅ Workflow started: ${result.processInstanceKey}`);
        return result;
    }
}

export default CamundaService;

