-- Rename Stripe reconciliation fields to Razorpay equivalents
DROP INDEX "Order_stripeCheckoutSessionId_key";
DROP INDEX "Order_stripePaymentIntentId_key";

ALTER TABLE "Order" RENAME COLUMN "stripeCheckoutSessionId" TO "razorpayOrderId";
ALTER TABLE "Order" RENAME COLUMN "stripePaymentIntentId" TO "razorpayPaymentId";

CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
