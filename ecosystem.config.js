module.exports = {
    apps: [
        {
            name: "medusa-backend",
            script: "npm",
            args: "run dev",
            cwd: "./",
            watch: false,
            env: {
                NODE_ENV: "development",
            },
        },
        {
            name: "camunda-workers",
            script: "npm",
            args: "run workers",
            cwd: "./",
            watch: false,
            autorestart: true,
            max_restarts: 10,
            min_uptime: "10s",
            env: {
                NODE_ENV: "development",
            },
        },
    ],
};
