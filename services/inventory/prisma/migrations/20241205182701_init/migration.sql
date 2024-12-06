-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "lastQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "inventoryid" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_sku_key" ON "inventory"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_key" ON "inventory"("productId");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_inventoryid_fkey" FOREIGN KEY ("inventoryid") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
