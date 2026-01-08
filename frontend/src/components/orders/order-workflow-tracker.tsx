"use client";

import { HttpTypes } from "@medusajs/types";
import { Check, Clock, AlertCircle, Package, ShieldCheck, Truck, Zap } from "lucide-react";
import { WORKFLOW_STATUS_LABELS, WORKFLOW_STATUS_ORDER } from "@/lib/constants";

interface OrderWorkflowTrackerProps {
  order: HttpTypes.StoreOrder;
}

const STEP_ICONS = {
  started: Package,
  payment_verified: ShieldCheck,
  inventory_reserved: Truck,
  completed: Zap,
};

export function OrderWorkflowTracker({ order }: OrderWorkflowTrackerProps) {
  const metadata = order.metadata as Record<string, string> | null;
  const workflowStatus = metadata?.workflow_status || "started";
  const workflowMessage = metadata?.workflow_message;
  const workflowError = metadata?.workflow_error;

  const currentStepIndex = WORKFLOW_STATUS_ORDER.indexOf(workflowStatus);

  return (
    <div className="p-6 rounded-2xl border border-border bg-secondary/30">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-semibold text-lg">Order Progress</h2>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            workflowError ? "bg-destructive" : 
            currentStepIndex === WORKFLOW_STATUS_ORDER.length - 1 ? "bg-success" : 
            "bg-accent pulse-glow"
          }`} />
          <span className="text-sm text-muted-foreground">
            {workflowError ? "Error" : 
             currentStepIndex === WORKFLOW_STATUS_ORDER.length - 1 ? "Completed" : 
             "Processing"}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-muted rounded-full" />
        
        {/* Progress line */}
        <div 
          className="absolute top-8 left-8 h-1 bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700 ease-out"
          style={{
            width: `calc(${(currentStepIndex / (WORKFLOW_STATUS_ORDER.length - 1)) * 100}% - 4rem)`,
          }}
        />

        <div className="relative flex justify-between">
          {WORKFLOW_STATUS_ORDER.map((status, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            const Icon = STEP_ICONS[status as keyof typeof STEP_ICONS] || Package;

            return (
              <div
                key={status}
                className="flex flex-col items-center"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isCompleted
                      ? "bg-success text-success-foreground shadow-lg shadow-success/20"
                      : isCurrent
                      ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-7 w-7" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <Icon className="h-7 w-7" />
                      <div className="absolute inset-0 rounded-2xl bg-accent/30 blur-lg animate-pulse" />
                    </div>
                  ) : (
                    <Icon className="h-7 w-7" />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-4 text-center">
                  <span className={`text-xs font-medium ${
                    isCompleted || isCurrent ? "text-primary" : "text-muted-foreground"
                  }`}>
                    Step {index + 1}
                  </span>
                  <p
                    className={`mt-1 text-sm font-medium max-w-[100px] ${
                      isCompleted || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {WORKFLOW_STATUS_LABELS[status]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar for mobile */}
      <div className="mt-8 md:hidden">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-primary">
            {Math.round(((currentStepIndex + 1) / WORKFLOW_STATUS_ORDER.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700"
            style={{
              width: `${((currentStepIndex + 1) / WORKFLOW_STATUS_ORDER.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Status Message */}
      {workflowMessage && (
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Status Update</p>
              <p className="text-sm text-muted-foreground mt-1">{workflowMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {workflowError && (
        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive">Workflow Error</p>
              <p className="text-sm text-destructive/80 mt-1">{workflowError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Instance ID */}
      {metadata?.workflow_instance && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            Workflow ID: {metadata.workflow_instance}
          </p>
        </div>
      )}
    </div>
  );
}
