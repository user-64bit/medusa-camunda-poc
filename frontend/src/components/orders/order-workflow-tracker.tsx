"use client";

import { HttpTypes } from "@medusajs/types";
import { Check, Clock, AlertCircle } from "lucide-react";
import { WORKFLOW_STATUS_LABELS, WORKFLOW_STATUS_ORDER } from "@/lib/constants";

interface OrderWorkflowTrackerProps {
  order: HttpTypes.StoreOrder;
}

export function OrderWorkflowTracker({ order }: OrderWorkflowTrackerProps) {
  const metadata = order.metadata as Record<string, string> | null;
  const workflowStatus = metadata?.workflow_status || "started";
  const workflowMessage = metadata?.workflow_message;
  const workflowError = metadata?.workflow_error;

  const currentStepIndex = WORKFLOW_STATUS_ORDER.indexOf(workflowStatus);

  return (
    <div className="p-6 rounded-lg border border-border bg-background">
      <h2 className="font-semibold mb-6">Order Progress</h2>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex justify-between">
          {WORKFLOW_STATUS_ORDER.map((status, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={status}
                className="flex flex-col items-center flex-1"
              >
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isCurrent
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5 animate-pulse" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`mt-2 text-xs text-center ${
                    isCompleted || isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {WORKFLOW_STATUS_LABELS[status]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (WORKFLOW_STATUS_ORDER.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Status Message */}
      {workflowMessage && (
        <div className="mt-6 p-3 rounded-md bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span> {workflowMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {workflowError && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Workflow Error
            </p>
            <p className="text-sm text-destructive/80">{workflowError}</p>
          </div>
        </div>
      )}

      {/* Workflow Instance ID */}
      {metadata?.workflow_instance && (
        <p className="mt-4 text-xs text-muted-foreground">
          Workflow ID: {metadata.workflow_instance}
        </p>
      )}
    </div>
  );
}
