/*
  Warnings:

  - You are about to drop the column `x` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Section` table. All the data in the column will be lost.
  - Added the required column `position` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "supermarketId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Section_supermarketId_fkey" FOREIGN KEY ("supermarketId") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("createdAt", "id", "name", "supermarketId") SELECT "createdAt", "id", "name", "supermarketId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
