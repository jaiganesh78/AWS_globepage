-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "awsRegionCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "infrastructureDescription" TEXT NOT NULL,
    "availabilityZones" INTEGER NOT NULL,
    "launchYear" INTEGER NOT NULL,
    "primaryLocation" TEXT NOT NULL,
    "compliance" TEXT NOT NULL,
    "totalServices" TEXT NOT NULL,
    "aimlServices" TEXT NOT NULL,
    "analyticsServices" TEXT NOT NULL,
    "networkingServices" TEXT NOT NULL,
    "edgeLocations" TEXT NOT NULL,
    "directConnect" TEXT NOT NULL,
    "reach" TEXT NOT NULL,
    "latency" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "RegionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionBenefit" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "RegionBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_displayOrder_idx" ON "Category"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Region_awsRegionCode_key" ON "Region"("awsRegionCode");

-- CreateIndex
CREATE INDEX "Region_awsRegionCode_idx" ON "Region"("awsRegionCode");

-- CreateIndex
CREATE INDEX "Region_categoryId_idx" ON "Region"("categoryId");

-- CreateIndex
CREATE INDEX "Region_isDeleted_idx" ON "Region"("isDeleted");

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionService" ADD CONSTRAINT "RegionService_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionBenefit" ADD CONSTRAINT "RegionBenefit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
