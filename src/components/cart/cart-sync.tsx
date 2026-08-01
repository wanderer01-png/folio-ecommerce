"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getServerCart, mergeGuestCart } from "@/app/actions/cart";
import { useCartStore } from "@/store/cart-store";

export function CartSync() {
  const { status } = useSession();
  // Guards against firing twice within the same mount (e.g. React Strict
  // Mode's double effect invocation in dev). The persisted
  // `hasHydratedFromServer` flag on the store is what makes this correct
  // across page reloads, where this ref itself resets to false.
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    const state = useCartStore.getState();

    if (status === "unauthenticated") {
      // Cart data tagged as server-hydrated but the session is gone means
      // this is leftover from a previous signed-in user on this device —
      // clear it so it doesn't leak into the next guest/user's view.
      if (state.hasHydratedFromServer) {
        state.clearCart();
      }
      hasSyncedRef.current = false;
      return;
    }

    // status === "authenticated"
    if (state.hasHydratedFromServer || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const guestItems = state.items.map((item) => ({
      bookId: item.bookId,
      format: item.format,
      quantity: item.quantity,
    }));

    const sync =
      guestItems.length > 0 ? mergeGuestCart(guestItems) : getServerCart();

    sync.then((items) => useCartStore.getState().hydrateFromServer(items));
  }, [status]);

  return null;
}
