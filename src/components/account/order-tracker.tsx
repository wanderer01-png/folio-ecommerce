import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order placed" },
  { status: "PAID", label: "Payment confirmed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return <Badge variant="destructive">Order cancelled</Badge>;
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => (
        <div key={step.status} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm",
                index <= currentIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {index < currentIndex ? <Check className="size-4" /> : index + 1}
            </div>
            <span className="text-muted-foreground w-20 text-center text-xs">
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 flex-1",
                index < currentIndex ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
