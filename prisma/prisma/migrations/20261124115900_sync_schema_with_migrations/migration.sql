-- The earlier migrations never caught up with schema.prisma: they created
-- User.id as an integer and left out AuthCode, Session, OutBoundEmail(Queue)
-- and road_closures. This brings a database built from migrations in line
-- with the schema the code already uses. Generated with prisma migrate diff.

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "datecreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateloggedin" TIMESTAMPTZ,
ADD COLUMN     "dateupdated" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "userlevel" INTEGER NOT NULL DEFAULT 30,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "AuthCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "dateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ NOT NULL DEFAULT now() + interval '48 hour',

    CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutBoundEmail" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "dateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMPTZ,

    CONSTRAINT "OutBoundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutBoundEmailQueue" (
    "id" SERIAL NOT NULL,
    "emailId" INTEGER NOT NULL,
    "dateQueued" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMPTZ,

    CONSTRAINT "OutBoundEmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateCreated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 day',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "road_closures" (
    "id" BIGSERIAL NOT NULL,
    "dataset_id" INTEGER,
    "year" INTEGER NOT NULL,
    "road_name" TEXT NOT NULL,
    "road_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "month" INTEGER,
    "day" INTEGER,

    CONSTRAINT "road_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthCode_code_key" ON "AuthCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "road_closures_year_idx" ON "road_closures"("year");

-- CreateIndex
CREATE INDEX "road_closures_road_name_idx" ON "road_closures"("road_name");

-- CreateIndex
CREATE INDEX "road_closures_road_type_idx" ON "road_closures"("road_type");

-- CreateIndex
CREATE INDEX "road_closures_dataset_id_idx" ON "road_closures"("dataset_id");

-- CreateIndex
CREATE UNIQUE INDEX "road_closures_dataset_id_year_road_name_status_key" ON "road_closures"("dataset_id", "year", "road_name", "status");

-- AddForeignKey
ALTER TABLE "AuthCode" ADD CONSTRAINT "AuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutBoundEmailQueue" ADD CONSTRAINT "OutBoundEmailQueue_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "OutBoundEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

