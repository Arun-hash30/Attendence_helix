import { PrismaClient } from '@prisma/client';
import { SalaryStructureInput, GeneratePayslipInput } from './payslip.types.js';

const prisma = new PrismaClient();

export const payslipService = {
  // =========================
  // Salary Structure
  // =========================

  createSalaryStructure: async (userId: number, input: SalaryStructureInput) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Store all salary components in JSON fields
    const earnings = {
      basic: input.basicSalary,
      hra: input.hra,
      specialAllowance: input.specialAllowance,
      travelAllowance: input.travelAllowance,
      medicalAllowance: input.medicalAllowance,
    };

    const deductions = {
      pf: input.pf,
      professionalTax: input.professionalTax,
      tds: input.tds,
      otherDeductions: input.otherDeductions,
    };

    return prisma.salaryStructure.create({
      data: {
        userId,
        earnings,
        deductions,
        effectiveFrom: new Date(input.effectiveFrom),
      },
    });
  },

  getLatestSalaryStructure: async (userId: number) => {
    return prisma.salaryStructure.findFirst({
      where: { userId },
      orderBy: { effectiveFrom: 'desc' },
    });
  },

  // =========================
  // Payslip Generation (Multiple Months)
  // =========================

  generatePayslips: async (input: GeneratePayslipInput) => {
    const { userId, months, year } = input;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate months
    const invalidMonths = months.filter(month => month < 1 || month > 12);
    if (invalidMonths.length > 0) {
      throw new Error(`Invalid months: ${invalidMonths.join(', ')}. Must be between 1 and 12.`);
    }

    // Get latest salary structure
    const salary = await payslipService.getLatestSalaryStructure(userId);
    if (!salary) {
      throw new Error('Salary structure not found. Please create salary structure first.');
    }

    const earnings = salary.earnings as Record<string, number>;
    const deductions = salary.deductions as Record<string, number>;

    // Calculate totals
    const grossPay = Object.values(earnings)
      .map(Number)
      .reduce((sum, v) => sum + v, 0);

    const totalDeduct = Object.values(deductions)
      .map(Number)
      .reduce((sum, v) => sum + v, 0);

    const netPay = grossPay - totalDeduct;

    if (netPay < 0) {
      throw new Error('Net pay cannot be negative');
    }

    // Generate payslips for each selected month
    const createdPayslips = [];
    const failedMonths = [];

    for (const month of months) {
      try {
        // Check if payslip already exists for this month/year
        const exists = await prisma.payslip.findUnique({
          where: { userId_month_year: { userId, month, year } },
        });

        if (exists) {
          failedMonths.push({ month, reason: 'Payslip already exists' });
          continue;
        }

        // Create the payslip
        const payslip = await prisma.payslip.create({
          data: {
            userId,
            month,
            year,
            earnings,
            deductions,
            grossPay,
            totalDeduct,
            netPay,
            status: 'GENERATED',
          },
        });

        createdPayslips.push(payslip);
      } catch (error: any) {
        failedMonths.push({ month, reason: error.message });
      }
    }

    return {
      success: createdPayslips.length,
      failed: failedMonths.length,
      payslips: createdPayslips,
      failedMonths,
      message: createdPayslips.length > 0 
        ? `Successfully generated ${createdPayslips.length} payslip(s)`
        : 'No payslips were generated'
    };
  },

  // =========================
  // Fetch Payslips
  // =========================

  getPayslipsByUser: async (userId: number) => {
    const payslips = await prisma.payslip.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    // Combine payslip data with user info
    return payslips.map(payslip => ({
      ...payslip,
      user: user ? {
        id: user.id,
        name: user.name || '',
        email: user.email,
      } : undefined
    }));
  },

  getAllPayslips: async (filters?: { month?: number; year?: number; status?: string }) => {
    const where: any = {};
    
    if (filters?.month) where.month = filters.month;
    if (filters?.year) where.year = filters.year;
    if (filters?.status) where.status = filters.status;

    const payslips = await prisma.payslip.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Get user information for all payslips
    const userIds = [...new Set(payslips.map(p => p.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    const userMap = new Map(users.map(user => [user.id, user]));

    // Combine data
    return payslips.map(payslip => ({
      ...payslip,
      user: userMap.get(payslip.userId) || undefined
    }));
  },

  getPayslipById: async (id: number) => {
    const payslip = await prisma.payslip.findUnique({
      where: { id },
    });

    if (!payslip) {
      return null;
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: payslip.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      }
    });

    return {
      ...payslip,
      user: user || undefined
    };
  },

  deletePayslip: async (id: number) => {
    return prisma.payslip.delete({
      where: { id },
    });
  },

  updatePayslipStatus: async (
    id: number, 
    status: 'GENERATED' | 'PROCESSED' | 'PAID'
  ) => {
    return prisma.payslip.update({
      where: { id },
      data: { 
        status,
        // Note: Your current schema doesn't have updatedAt field
        // Add it later if needed
      },
    });
  },

  getUsersForPayslip: async () => {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'user',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    return users;
  },

  // Helper methods
  checkUserExists: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    return !!user;
  },

  getPayslipStats: async () => {
    const totalPayslips = await prisma.payslip.count();
    const paidPayslips = await prisma.payslip.count({
      where: { status: 'PAID' }
    });
    const totalNetPay = await prisma.payslip.aggregate({
      _sum: { netPay: true }
    });

    return {
      totalPayslips,
      paidPayslips,
      totalNetPay: totalNetPay._sum.netPay || 0
    };
  },

  // Get available years for filtering
  getAvailableYears: async () => {
    const years = await prisma.payslip.findMany({
      distinct: ['year'],
      select: { year: true },
      orderBy: { year: 'desc' }
    });
    return years.map(y => y.year);
  }
};