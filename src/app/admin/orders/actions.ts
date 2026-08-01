"use server";

import { revalidatePath } from "next/cache";

import { OrderStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type OrderStatusFormState = { error?: string } | undefined;

export async function updateOrderStatus(
  orderId: string,
  _prevState: OrderStatusFormState,
  formData: FormData,
): Promise<OrderStatusFormState> {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const status = formData.get("status");
  if (typeof status !== "string" || !(status in OrderStatus)) {
    return { error: "Invalid status" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
