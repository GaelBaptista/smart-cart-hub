/*
  Warnings:

  - You are about to drop the column `xCoordinate` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `yCoordinate` on the `Section` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "x" REAL,
    "y" REAL,
    "supermarketId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Section_supermarketId_fkey" FOREIGN KEY ("supermarketId") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("createdAt", "id", "name", "supermarketId") SELECT "createdAt", "id", "name", "supermarketId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
