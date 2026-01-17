-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "caption" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeedPost" ("caption", "createdAt", "id", "mediaType", "mediaUrl", "updatedAt", "userId") SELECT "caption", "createdAt", "id", "mediaType", "mediaUrl", "updatedAt", "userId" FROM "FeedPost";
DROP TABLE "FeedPost";
ALTER TABLE "new_FeedPost" RENAME TO "FeedPost";
CREATE INDEX "FeedPost_userId_idx" ON "FeedPost"("userId");
CREATE INDEX "FeedPost_createdAt_idx" ON "FeedPost"("createdAt");
CREATE INDEX "FeedPost_isPublic_idx" ON "FeedPost"("isPublic");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
