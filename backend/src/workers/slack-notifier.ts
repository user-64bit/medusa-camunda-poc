import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ADMIN_URL = process.env.SLACK_ADMIN_URL || "http://localhost:9000/app";

type SlackBlock = Record<string, unknown>;

interface SlackMessage {
    text: string;
    blocks?: SlackBlock[];
}

/**
 * Slack Notifier utility for Camunda workers
 * Sends real-time workflow progress updates to Slack
 */
class SlackNotifier {
    private webhookUrl: string | undefined;
    private adminUrl: string;

    constructor() {
        this.webhookUrl = SLACK_WEBHOOK_URL;
        this.adminUrl = ADMIN_URL;
    }

    private isEnabled(): boolean {
        return !!this.webhookUrl;
    }

    private async send(message: SlackMessage): Promise<void> {
        if (!this.isEnabled()) {
            console.log("⚠️ Slack webhook not configured, skipping notification");
            return;
        }

        try {
            await axios.post(this.webhookUrl!, message, { timeout: 5000 });
            console.log("📨 Slack notification sent");
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("❌ Failed to send Slack notification:", {
                    error: error.message,
                    code: error.code,
                    responseStatus: error.response?.status,
                });
            } else {
                console.error("❌ Failed to send Slack notification:", error);
            }
            // Don't throw - Slack failures shouldn't block workflow
        }
    }

    private buildOrderLink(orderId: string, displayId?: string): string {
        const display = displayId || orderId.slice(0, 8);
        return `<${this.adminUrl}/orders/${orderId}|#${display}>`;
    }

    /**
     * Send notification when payment is verified
     */
    async sendPaymentVerified(orderId: string, displayId?: string): Promise<void> {
        const orderLink = this.buildOrderLink(orderId, displayId);

        await this.send({
            text: `Payment verified for Order ${displayId || orderId}`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `💳 *Payment Verified*\n\nOrder ${orderLink} payment has been successfully verified.`,
                    },
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `⏱️ Workflow Stage: *1 of 3* | Next: Reserve Inventory`,
                        },
                    ],
                },
            ],
        });
    }

    /**
     * Send notification when inventory is reserved
     */
    async sendInventoryReserved(
        orderId: string,
        warehouse: string,
        displayId?: string
    ): Promise<void> {
        const orderLink = this.buildOrderLink(orderId, displayId);

        await this.send({
            text: `Inventory reserved for Order ${displayId || orderId}`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `📦 *Inventory Reserved*\n\nOrder ${orderLink} inventory has been reserved at *${warehouse}* warehouse.`,
                    },
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `⏱️ Workflow Stage: *2 of 3* | Next: Send Notification`,
                        },
                    ],
                },
            ],
        });
    }

    /**
     * Send notification when order workflow is completed
     */
    async sendOrderCompleted(orderId: string, displayId?: string): Promise<void> {
        const orderLink = this.buildOrderLink(orderId, displayId);

        await this.send({
            text: `Order ${displayId || orderId} workflow completed!`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🎉 *Order Complete!*\n\nOrder ${orderLink} has completed all workflow stages and customer has been notified.`,
                    },
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `✅ Workflow Stage: *3 of 3* | Status: Complete`,
                        },
                    ],
                },
            ],
        });
    }

    /**
     * Send notification when a workflow stage fails
     */
    async sendWorkflowError(
        orderId: string,
        stage: string,
        errorMessage: string,
        displayId?: string
    ): Promise<void> {
        const orderLink = this.buildOrderLink(orderId, displayId);

        await this.send({
            text: `⚠️ Workflow error for Order ${displayId || orderId}`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🚨 *Workflow Error*\n\nOrder ${orderLink} encountered an error during *${stage}*.`,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `\`\`\`${errorMessage}\`\`\``,
                    },
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `❌ Manual intervention may be required`,
                        },
                    ],
                },
            ],
        });
    }
}

// Export singleton instance
export const slackNotifier = new SlackNotifier();
