-- CreateTable
CREATE TABLE "ScrapedSentiment" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'PENDING',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapedSentiment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScrapedSentiment" ADD CONSTRAINT "ScrapedSentiment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
