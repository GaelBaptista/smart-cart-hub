/*
  Warnings:

  - You are about to drop the column `resolved` on the `Rupture` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rupture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER,
    "note" TEXT,
    "productName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rupture_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rupture_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Rupture" ("cartId", "createdAt", "id", "note", "productId") SELECT "cartId", "createdAt", "id", "note", "productId" FROM "Rupture";
DROP TABLE "Rupture";
ALTER TABLE "new_Rupture" RENAME TO "Rupture";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
