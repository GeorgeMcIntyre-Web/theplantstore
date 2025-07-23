-- CreateTable
CREATE TABLE "ReconciliationSuggestion" (
    "id" TEXT NOT NULL,
    "bankTransactionId" TEXT NOT NULL,
    "suggestedExpenseIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationSuggestion_pkey" PRIMARY KEY ("id")
);
