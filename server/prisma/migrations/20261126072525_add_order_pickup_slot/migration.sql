-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pickup_slot" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_pickup_slot_idx" ON "orders"("pickup_slot");
