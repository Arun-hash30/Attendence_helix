-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "level" TEXT NOT NULL DEFAULT 'basic',
    "tenantId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "verificationToken" TEXT,
    "verificationExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "casualTotal" INTEGER NOT NULL DEFAULT 12,
    "casualUsed" INTEGER NOT NULL DEFAULT 0,
    "sickTotal" INTEGER NOT NULL DEFAULT 6,
    "sickUsed" INTEGER NOT NULL DEFAULT 0,
    "annualTotal" INTEGER NOT NULL DEFAULT 15,
    "annualUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "halfDay" BOOLEAN NOT NULL DEFAULT false,
    "halfDayType" TEXT,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "earnings" JSONB NOT NULL,
    "deductions" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "earnings" JSONB NOT NULL,
    "deductions" JSONB NOT NULL,
    "grossPay" DOUBLE PRECISION NOT NULL,
    "totalDeduct" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_userId_year_key" ON "leave_balances"("userId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_userId_idx" ON "leave_requests"("userId");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_requests_fromDate_toDate_idx" ON "leave_requests"("fromDate", "toDate");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_userId_month_year_key" ON "payslips"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
