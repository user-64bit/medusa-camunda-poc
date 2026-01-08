import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/camunda",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/slack",
            id: "slack",
            options: {
              channels: ["slack"],
              webhook_url: process.env.SLACK_WEBHOOK_URL,
              admin_url: process.env.SLACK_ADMIN_URL,
            },
          },
        ],
      },
    },
    // Payment providers - Stripe (uncomment when STRIPE_API_KEY is configured)
    // {
    //   resolve: "@medusajs/medusa/payment",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/payment-stripe",
    //         id: "stripe",
    //         options: {
    //           apiKey: process.env.STRIPE_API_KEY,
    //         },
    //       },
    //     ],
    //   },
    // },
  ],
})
