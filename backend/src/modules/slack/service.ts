import {
    AbstractNotificationProviderService,
    MedusaError,
} from "@medusajs/framework/utils";
import {
    OrderDTO,
    ProviderSendNotificationDTO,
    ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types";
import axios from "axios";

type Options = {
    webhook_url: string
    admin_url: string
}

type InjectedDependencies = {}

class SlackNotificationProviderService extends AbstractNotificationProviderService {
    static identifier = "slack"
    protected options: Options

    constructor(container: InjectedDependencies, options: Options) {
        super()
        this.options = options
    }

    static validateOptions(options: Record<any, any>): void | never {
        if (!options.webhook_url) {
            throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "webhook_url is required")
        }
        if (!options.admin_url) {
            throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, "admin_url is required")
        }
    }

    private async getDisplayAmount(amount: number, currencyCode: string) {
        return Intl.NumberFormat("en-us", {
            style: "currency",
            currency: currencyCode,
        }).format(amount)
    }

    async sendOrderNotification(notification: ProviderSendNotificationDTO) {
        const order = notification.data?.order as OrderDTO;
        if (!order) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");
        }

        const shippingAddress = order.shipping_address;
        const blocks: Record<string, unknown>[] = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Order *<${this.options.admin_url}/orders/${order.id}|#${order.display_id}>* has been created.`,
                },
            },
        ]

        if (shippingAddress) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Customer*\n${shippingAddress?.first_name as string} ${shippingAddress?.last_name as string
                        }\n${order.email}\n*Destination*\n${shippingAddress?.address_1 as string
                        }\n${shippingAddress?.city as string
                        }, ${(shippingAddress?.country_code as string).toUpperCase()}`,
                },
            })
        }

        blocks.push(
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Subtotal*\t${await this.getDisplayAmount(order.subtotal as number, order.currency_code)}\n*Shipping*\t${await this.getDisplayAmount(order.shipping_total as number, order.currency_code)
                        }\n*Discount Total*\t${await this.getDisplayAmount(
                            order.discount_total as number,
                            order.currency_code
                        )}\n*Tax*\t${await this.getDisplayAmount(order.tax_total as number, order.currency_code)}\n*Total*\t${await this.getDisplayAmount(order.total as number, order.currency_code)
                        }`,
                },
            },
            {
                type: "divider",
            }
        )

        await Promise.all(
            order.items?.map(async (item) => {
                const line: Record<string, unknown> = {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${item.title}*\n${item.quantity} x ${await this.getDisplayAmount(
                            item.unit_price as number,
                            order.currency_code as string
                        )}`,
                    },
                }

                if (item.thumbnail) {
                    const url = item.thumbnail

                    line.accessory = {
                        type: "image",
                        alt_text: "Item",
                        image_url: url,
                    }
                }

                blocks.push(line)
                blocks.push({
                    type: "divider",
                })
            }) || []
        )

        await axios.post(this.options.webhook_url, {
            text: `Order ${order.display_id} was created`,
            blocks,
        })

        return {
            id: order.id,
        }
    }
    async send(
        notification: ProviderSendNotificationDTO
      ): Promise<ProviderSendNotificationResultsDTO> {
        const { template } = notification
    
        switch (template) {
          case "order-created":
            return this.sendOrderNotification(notification)
          default:
            throw new MedusaError(
              MedusaError.Types.NOT_FOUND,
              `Template ${template} not supported`
            )
        }
      }
    
}

export default SlackNotificationProviderService;