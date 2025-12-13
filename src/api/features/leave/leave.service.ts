import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const leaveService = {
  // Get leave balance for a user
  getBalance: async (userId: number) => {
    const year = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: { userId_year: { userId, year } },
    });

    return {
      casualRemaining: balance ? balance.casualTotal - balance.casualUsed : 0,
      sickRemaining: balance ? balance.sickTotal - balance.sickUsed : 0,
    };
  },

  // Apply leave for a user
  applyLeave: async (
    userId: number,
    input: { type: 'CASUAL' | 'SICK'; fromDate: string; toDate: string; reason?: string }
  ) => {
    const from = new Date(input.fromDate);
    const to = new Date(input.toDate);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return prisma.leaveRequest.create({
      data: {
        userId,
        type: input.type,
        fromDate: from,
        toDate: to,
        days,
        reason: input.reason || '',
        status: 'PENDING',
      },
    });
  },

  // Get leaves for a user
  getMyLeaves: async (userId: number) => {
    return prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get all leaves (admin)
  getAllLeaves: async () => {
    return prisma.leaveRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Approve leave
  approveLeave: async (adminId: number, leaveId: number) => {
    return prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', approvedBy: adminId, approvedAt: new Date() },
    });
  },

  // Reject leave
  rejectLeave: async (adminId: number, leaveId: number) => {
    return prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'REJECTED', approvedBy: adminId, approvedAt: new Date() },
    });
  },
};
