"use client";

import { useActionState } from "react";

import { updateOrderStatus } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUSES = Object.values(OrderStatus);

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const updateWithId = updateOrderStatus.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Select key={currentStatus} name="status" defaultValue={currentStatus}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Updating..." : "Update status"}
      </Button>
      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
    </form>
  );
}
