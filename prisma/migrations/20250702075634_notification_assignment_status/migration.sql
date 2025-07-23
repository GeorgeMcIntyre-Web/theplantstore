-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
