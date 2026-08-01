"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getServerCart, mergeGuestCart } from "@/app/actions/cart";
import { useCartStore } from "@/store/cart-store";

export function CartSync() {
  const { status } = useSession();
  const setItems = useCartStore((state) => state.setItems);
  const hasSyncedRef = useRef(false);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (status === "authenticated" && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      const guestItems = useCartStore.getState().items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const sync =
        guestItems.length > 0 ? mergeGuestCart(guestItems) : getServerCart();

      sync.then(setItems);
    }

    if (prevStatusRef.current === "authenticated" && status === "unauthenticated") {
      useCartStore.getState().clearCart();
      hasSyncedRef.current = false;
    }

    prevStatusRef.current = status;
  }, [status, setItems]);

  return null;
}
