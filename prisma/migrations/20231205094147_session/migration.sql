/*
  Warnings:

  - You are about to drop the column `refreshExpires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Session_refreshToken_key` ON `Session`;

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `refreshExpires`,
    DROP COLUMN `refreshToken`;
