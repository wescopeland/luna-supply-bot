-- CreateTable
CREATE TABLE "DailySupply" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "circulatingSupply" DOUBLE PRECISION NOT NULL,
    "totalSupply" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailySupply_pkey" PRIMARY KEY ("id")
);
