-- Revert Razorpay reconciliation fields back to Stripe equivalents
DROP INDEX "Order_razorpayOrderId_key";
DROP INDEX "Order_razorpayPaymentId_key";

ALTER TABLE "Order" RENAME COLUMN "razorpayOrderId" TO "stripeCheckoutSessionId";
ALTER TABLE "Order" RENAME COLUMN "razorpayPaymentId" TO "stripePaymentIntentId";

CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
