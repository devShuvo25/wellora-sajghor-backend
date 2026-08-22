-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryCreate" BOOLEAN NOT NULL DEFAULT false,
    "categoryUpdate" BOOLEAN NOT NULL DEFAULT false,
    "categoryDelete" BOOLEAN NOT NULL DEFAULT false,
    "userCreate" BOOLEAN NOT NULL DEFAULT false,
    "userAssignCategory" BOOLEAN NOT NULL DEFAULT false,
    "documentUpload" BOOLEAN NOT NULL DEFAULT false,
    "documentUpdate" BOOLEAN NOT NULL DEFAULT false,
    "documentDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_userId_key" ON "admin_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToCategory_AB_unique" ON "_UserToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToCategory_B_index" ON "_UserToCategory"("B");

-- AddForeignKey
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToCategory" ADD CONSTRAINT "_UserToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToCategory" ADD CONSTRAINT "_UserToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
