-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN "lastReadMessageId" INTEGER;

-- AlterTable
ALTER TABLE "GroupChatMember" ADD COLUMN "lastReadMessageId" INTEGER;
