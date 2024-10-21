/*
  Warnings:

  - You are about to drop the column `last_login` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_login",
ADD COLUMN     "lastLogin" TIMESTAMP(3);
