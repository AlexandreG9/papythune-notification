/*
  Warnings:

  - Added the required column `expirationDateTime` to the `AccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccessToken" ADD COLUMN     "expirationDateTime" TIMESTAMP(3) NOT NULL;
