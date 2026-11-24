-- CreateTable
CREATE TABLE "citizen_reports" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition" TEXT,
    "caption" TEXT,
    "image" BYTEA NOT NULL,
    "imageMime" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "imageSha256" TEXT NOT NULL,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "displayImage" BYTEA,
    "displayMime" TEXT,
    "thumbnail" BYTEA,
    "thumbnailMime" TEXT,
    "originalFilename" TEXT,
    "fileLastModified" TIMESTAMPTZ,
    "captureMethod" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracyM" DOUBLE PRECISION,
    "altitudeM" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "speedMps" DOUBLE PRECISION,
    "locationAt" TIMESTAMPTZ,
    "locationSource" TEXT,
    "exifLatitude" DOUBLE PRECISION,
    "exifLongitude" DOUBLE PRECISION,
    "exifTakenAt" TIMESTAMPTZ,
    "cameraMake" TEXT,
    "cameraModel" TEXT,
    "exifSoftware" TEXT,
    "exif" JSONB,
    "userId" TEXT,
    "deviceId" TEXT,
    "sessionId" TEXT,
    "ip" TEXT,
    "forwardedFor" TEXT,
    "ipCountry" TEXT,
    "userAgent" TEXT,
    "acceptLanguage" TEXT,
    "headers" JSONB,
    "client" JSONB,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewedAt" TIMESTAMPTZ,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,

    CONSTRAINT "citizen_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "citizen_reports_createdAt_idx" ON "citizen_reports"("createdAt");

-- CreateIndex
CREATE INDEX "citizen_reports_status_idx" ON "citizen_reports"("status");

-- CreateIndex
CREATE INDEX "citizen_reports_imageSha256_idx" ON "citizen_reports"("imageSha256");

-- CreateIndex
CREATE INDEX "citizen_reports_deviceId_idx" ON "citizen_reports"("deviceId");

-- CreateIndex
CREATE INDEX "citizen_reports_ip_idx" ON "citizen_reports"("ip");

-- CreateIndex
CREATE INDEX "citizen_reports_userId_idx" ON "citizen_reports"("userId");

-- AddForeignKey
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

