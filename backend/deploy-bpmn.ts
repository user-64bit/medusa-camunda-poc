import { Camunda8 } from "@camunda8/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

async function deployBPMN() {
    console.log("🚀 Starting BPMN deployment...");

    // Validate environment variables
    const requiredEnvVars = [
        "ZEEBE_CLIENT_ID",
        "ZEEBE_CLIENT_SECRET",
        "ZEEBE_ADDRESS",
    ];

    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        console.error(
            "❌ Missing required environment variables:",
            missing.join(", ")
        );
        console.error("Please check your .env file");
        process.exit(1);
    }

    try {
        // Initialize Camunda8 SDK
        const camunda = new Camunda8({
            ZEEBE_CLIENT_ID: process.env.ZEEBE_CLIENT_ID,
            ZEEBE_CLIENT_SECRET: process.env.ZEEBE_CLIENT_SECRET,
            CAMUNDA_OAUTH_URL: "https://login.cloud.camunda.io/oauth/token",
            ZEEBE_TOKEN_AUDIENCE:
                process.env.ZEEBE_TOKEN_AUDIENCE || "zeebe.camunda.io",
            ZEEBE_GRPC_ADDRESS: process.env.ZEEBE_ADDRESS,
        });

        console.log(`📡 Connecting to: ${process.env.ZEEBE_ADDRESS}`);

        const client = camunda.getZeebeGrpcApiClient();

        // Read BPMN file
        const bpmnPath = path.join(__dirname, "src/order-fulfillment-poc.bpmn");
        console.log(`📄 Reading BPMN from: ${bpmnPath}`);

        if (!fs.existsSync(bpmnPath)) {
            console.error(`❌ BPMN file not found: ${bpmnPath}`);
            process.exit(1);
        }

        const bpmnContent = fs.readFileSync(bpmnPath, "utf8");

        // Deploy to Camunda
        console.log("📤 Deploying to Camunda Cloud...");
        const result = await client.deployResource({
            name: "order-fulfillment-poc.bpmn",
            process: Buffer.from(bpmnContent, "utf8"),
        });

        console.log("\n✅ Deployment successful!");
        console.log(`   Deployment Key: ${result.key}`);
        console.log(`   Process ID: order-fulfillment-poc`);
        console.log(`   Deployments: ${JSON.stringify(result.deployments, null, 2)}`);

        console.log("\n🎉 BPMN process is now ready to use!");
        console.log("   You can now create orders and the workflow will trigger.");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Deployment failed:");
        if (error instanceof Error) {
            console.error(`   Error: ${error.message}`);
            if (error.stack) {
                console.error(`\n   Stack trace:\n${error.stack}`);
            }
        } else {
            console.error(error);
        }

        console.log("\n💡 Troubleshooting:");
        console.log("   1. Check that your Camunda credentials are correct in .env");
        console.log("   2. Verify your cluster is running at console.camunda.io");
        console.log("   3. Ensure network connectivity to Camunda Cloud");

        process.exit(1);
    }
}

// Run deployment
deployBPMN();
