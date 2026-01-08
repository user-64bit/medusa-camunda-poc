import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Badge, clx } from "@medusajs/ui";
import { useEffect, useState } from "react";

// Define workflow steps
const WORKFLOW_STEPS = [
  { key: "started", name: "Order Received", icon: "📥" },
  { key: "payment_verified", name: "Payment Verified", icon: "💳" },
  { key: "inventory_reserved", name: "Inventory Reserved", icon: "📦" },
  { key: "completed", name: "Completed", icon: "✅" },
];

interface OrderMetadata {
  workflow_status?: string;
  workflow_instance?: string;
  workflow_started_at?: string;
  workflow_message?: string;
  workflow_error?: string;
  last_updated?: string;
}

interface OrderDetailWidgetProps {
  data: {
    id: string;
    display_id: number;
    status: string;
    metadata?: OrderMetadata;
  };
}

const WorkflowStatusWidget = ({ data }: OrderDetailWidgetProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const metadata = data.metadata || {};
  const workflowStatus = metadata.workflow_status || "pending";
  const workflowInstance = metadata.workflow_instance;
  const workflowMessage = metadata.workflow_message;
  const workflowError = metadata.workflow_error;
  const lastUpdated = metadata.last_updated;

  // Auto-refresh if workflow is in progress
  useEffect(() => {
    if (workflowStatus && workflowStatus !== "completed" && workflowStatus !== "pending") {
      const interval = setInterval(() => {
        setRefreshKey((k) => k + 1);
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [workflowStatus]);

  const currentStepIndex = WORKFLOW_STEPS.findIndex(
    (step) => step.key === workflowStatus
  );

  const getStepStatus = (index: number) => {
    if (currentStepIndex === -1) return "pending";
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "payment_verified":
      case "inventory_reserved":
        return "blue";
      case "started":
        return "orange";
      case "pending":
        return "grey";
      default:
        return "grey";
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h2">Camunda Workflow</Heading>
          <Badge color={getBadgeColor(workflowStatus)}>
            {workflowStatus.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={clx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all",
                      {
                        "border-green-500 bg-green-50": status === "completed",
                        "border-blue-500 bg-blue-50 animate-pulse": status === "current",
                        "border-gray-200 bg-gray-50": status === "pending",
                      }
                    )}
                  >
                    {step.icon}
                  </div>
                  <Text size="xsmall" className="mt-1 text-center max-w-[80px]">
                    {step.name}
                  </Text>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={clx("h-0.5 w-8 mx-1", {
                      "bg-green-500": getStepStatus(index + 1) !== "pending",
                      "bg-gray-200": getStepStatus(index + 1) === "pending",
                    })}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Workflow Details */}
        <div className="space-y-2 text-sm">
          {workflowInstance && (
            <div className="flex justify-between">
              <Text className="text-ui-fg-subtle">Instance ID</Text>
              <Text className="font-mono text-xs">{workflowInstance}</Text>
            </div>
          )}
          
          {workflowMessage && (
            <div className="flex justify-between">
              <Text className="text-ui-fg-subtle">Status</Text>
              <Text>{workflowMessage}</Text>
            </div>
          )}

          {lastUpdated && (
            <div className="flex justify-between">
              <Text className="text-ui-fg-subtle">Last Updated</Text>
              <Text>{new Date(lastUpdated).toLocaleString()}</Text>
            </div>
          )}
        </div>

        {/* Error Display */}
        {workflowError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-800 font-medium">Workflow Error</Text>
            <Text size="small" className="text-red-600">{workflowError}</Text>
          </div>
        )}

        {/* Camunda Operate Link */}
        {workflowInstance && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={`https://console.cloud.camunda.io`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View in Camunda Operate →
            </a>
          </div>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
});

export default WorkflowStatusWidget;
