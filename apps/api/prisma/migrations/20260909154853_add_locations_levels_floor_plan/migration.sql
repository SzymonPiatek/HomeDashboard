-- CreateTable
CREATE TABLE "walls" (
    "id" UUID NOT NULL,
    "levelId" TEXT NOT NULL,
    "p1XMm" INTEGER NOT NULL,
    "p1YMm" INTEGER NOT NULL,
    "p2XMm" INTEGER NOT NULL,
    "p2YMm" INTEGER NOT NULL,
    "p3XMm" INTEGER NOT NULL,
    "p3YMm" INTEGER NOT NULL,
    "p4XMm" INTEGER NOT NULL,
    "p4YMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "walls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "levelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_vertices" (
    "id" TEXT NOT NULL,
    "roomId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "xMm" INTEGER NOT NULL,
    "yMm" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "room_vertices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "walls_levelId_idx" ON "walls"("levelId");

-- CreateIndex
CREATE INDEX "rooms_levelId_idx" ON "rooms"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "room_vertices_roomId_position_key" ON "room_vertices"("roomId", "position");

-- CreateIndex
CREATE INDEX "locations_accountId_idx" ON "locations"("accountId");

-- CreateIndex
CREATE INDEX "levels_locationId_order_idx" ON "levels"("locationId", "order");

-- AddForeignKey
ALTER TABLE "walls" ADD CONSTRAINT "walls_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_vertices" ADD CONSTRAINT "room_vertices_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
