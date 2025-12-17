import { PrismaClient } from '@prisma/client';
import { ApplyLeaveInput, UpdateLeaveStatusInput, LeaveCalendarEvent } from './leave.types.js';

const prisma = new PrismaClient();

// Define filter interfaces
interface LeaveFilters {
  status?: string;
  year?: number;
  type?: string;
  page?: number;
  limit?: number;
}

interface AllLeaveFilters extends LeaveFilters {
  userId?: number;
}

// Define Prisma where clause types
interface LeaveWhereClause {
  userId?: number;
  status?: string;
  type?: string;
  fromDate?: {
    gte: Date;
    lte: Date;
  };
}

export const leaveService = {
  // =========================
  // Leave Balance
  // =========================

  getLeaveBalance: async (userId: number, year?: number) => {
    const currentYear = year || new Date().getFullYear();
    
    // Get or create leave balance for the year
    let balance = await prisma.leaveBalance.findUnique({
      where: {
        userId_year: {
          userId,
          year: currentYear
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // If no balance exists, create default one
    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: {
          userId,
          year: currentYear,
          casualTotal: 12,
          casualUsed: 0,
          sickTotal: 6,
          sickUsed: 0,
          annualTotal: 15,
          annualUsed: 0
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    }

    return balance;
  },

  updateLeaveBalance: async (userId: number, year: number, type: string, days: number, operation: 'add' | 'subtract') => {
    const balance = await leaveService.getLeaveBalance(userId, year);
    
    const updateData: Partial<{
      casualUsed: number;
      sickUsed: number;
      annualUsed: number;
    }> = {};
    
    switch (type.toUpperCase()) {
      case 'CASUAL':
        if (operation === 'add') {
          updateData.casualUsed = balance.casualUsed + days;
        } else {
          updateData.casualUsed = Math.max(0, balance.casualUsed - days);
        }
        break;
      case 'SICK':
        if (operation === 'add') {
          updateData.sickUsed = balance.sickUsed + days;
        } else {
          updateData.sickUsed = Math.max(0, balance.sickUsed - days);
        }
        break;
      case 'ANNUAL':
        if (operation === 'add') {
          updateData.annualUsed = balance.annualUsed + days;
        } else {
          updateData.annualUsed = Math.max(0, balance.annualUsed - days);
        }
        break;
      default:
        // For other leave types like MATERNITY, PATERNITY, UNPAID - no balance tracking
        return null;
    }

    return prisma.leaveBalance.update({
      where: { 
        userId_year: {
          userId: balance.userId,
          year: balance.year
        }
      },
      data: updateData
    });
  },

  // =========================
  // Leave Requests
  // =========================

  applyLeave: async (userId: number, input: ApplyLeaveInput) => {
    const {
      type,
      fromDate,
      toDate,
      reason,
      halfDay = false,
      halfDayType,
      emergency = false
    } = input;

    // Validate dates
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    if (startDate > endDate) {
      throw new Error('From date cannot be after to date');
    }

    // Calculate number of days (excluding weekends)
    let days = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Count only weekdays (Monday to Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Adjust for half day
    if (halfDay) {
      days = 0.5;
    }

    // Check leave balance if applicable
    const year = startDate.getFullYear();
    const leaveTypesWithBalance = ['CASUAL', 'SICK', 'ANNUAL'];
    
    if (leaveTypesWithBalance.includes(type.toUpperCase())) {
      const balance = await leaveService.getLeaveBalance(userId, year);
      
      let availableDays = 0;
      switch (type.toUpperCase()) {
        case 'CASUAL':
          availableDays = balance.casualTotal - balance.casualUsed;
          break;
        case 'SICK':
          availableDays = balance.sickTotal - balance.sickUsed;
          break;
        case 'ANNUAL':
          availableDays = balance.annualTotal - balance.annualUsed;
          break;
      }

      if (availableDays < days) {
        throw new Error(`Insufficient ${type.toLowerCase()} leave balance. Available: ${availableDays} days, Requested: ${days} days`);
      }
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        type: type.toUpperCase(),
        fromDate: startDate,
        toDate: endDate,
        days,
        reason,
        status: 'PENDING',
        halfDay,
        halfDayType,
        emergency
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return leaveRequest;
  },

  getMyLeaveRequests: async (userId: number, filters?: LeaveFilters) => {
    const where: LeaveWhereClause = { userId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.year) {
      where.fromDate = {
        gte: new Date(`${filters.year}-01-01`),
        lte: new Date(`${filters.year}-12-31`)
      };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [total, leaveRequests] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          admin: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { fromDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      })
    ]);

    return {
      data: leaveRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getAllLeaveRequests: async (filters?: AllLeaveFilters) => {
    const where: LeaveWhereClause = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.type) where.type = filters.type;
    if (filters?.year) {
      where.fromDate = {
        gte: new Date(`${filters.year}-01-01`),
        lte: new Date(`${filters.year}-12-31`)
      };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [total, leaveRequests] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          admin: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // PENDING first
          { fromDate: 'desc' }
        ],
        skip,
        take: limit
      })
    ]);

    return {
      data: leaveRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  getLeaveRequestById: async (id: number) => {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return leaveRequest;
  },

  updateLeaveStatus: async (id: number, approverId: number, input: UpdateLeaveStatusInput) => {
    const { status, comments } = input;

    // Get current leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    // Update leave balance if status changes to APPROVED
    if (status.toUpperCase() === 'APPROVED' && leaveRequest.status !== 'APPROVED') {
      // Add to used balance
      await leaveService.updateLeaveBalance(
        leaveRequest.userId,
        leaveRequest.fromDate.getFullYear(),
        leaveRequest.type,
        leaveRequest.days,
        'add'
      );
    }
    
    // Remove from used balance if previously APPROVED and now REJECTED/CANCELLED
    if ((status.toUpperCase() === 'REJECTED' || status.toUpperCase() === 'CANCELLED') && leaveRequest.status === 'APPROVED') {
      await leaveService.updateLeaveBalance(
        leaveRequest.userId,
        leaveRequest.fromDate.getFullYear(),
        leaveRequest.type,
        leaveRequest.days,
        'subtract'
      );
    }

    // Update leave request
    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        approvedBy: approverId,
        approvedAt: status.toUpperCase() === 'APPROVED' ? new Date() : null,
        comments
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        admin: {
          select: {
            name: true
          }
        }
      }
    });

    return updatedLeaveRequest;
  },

  cancelLeaveRequest: async (id: number, userId: number) => {
    // Check if user owns this leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    if (leaveRequest.userId !== userId) {
      throw new Error('You can only cancel your own leave requests');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new Error(`Cannot cancel leave request with status: ${leaveRequest.status}`);
    }

    // Update status to CANCELLED
    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });
  },

  // =========================
  // Statistics & Dashboard
  // =========================

  getLeaveStats: async (userId?: number, year?: number) => {
    const currentYear = year || new Date().getFullYear();
    
    const where: LeaveWhereClause = {};
    if (userId) where.userId = userId;
    
    // For yearly stats, filter by year
    where.fromDate = {
      gte: new Date(`${currentYear}-01-01`),
      lte: new Date(`${currentYear}-12-31`)
    };

    const [
      totalLeaves,
      pending,
      approved,
      rejected,
      cancelled
    ] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'CANCELLED' } })
    ]);

    // Get leave balance
    let leaveBalance = { casual: 0, sick: 0, annual: 0 };
    if (userId) {
      const balance = await leaveService.getLeaveBalance(userId, currentYear);
      leaveBalance = {
        casual: balance.casualTotal - balance.casualUsed,
        sick: balance.sickTotal - balance.sickUsed,
        annual: balance.annualTotal - balance.annualUsed
      };
    }

    return {
      totalLeaves,
      pending,
      approved,
      rejected,
      cancelled,
      leaveBalance
    };
  },

  // =========================
  // Calendar
  // =========================

  getLeaveCalendar: async (year: number, month: number, userId?: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const where: any = {
      AND: [
        {
          fromDate: {
            lte: endDate
          }
        },
        {
          toDate: {
            gte: startDate
          }
        }
      ]
    };

    if (userId) {
      where.userId = userId;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { fromDate: 'asc' }
    });

    // Convert to calendar events
    const events: LeaveCalendarEvent[] = leaveRequests.map((request: any) => {
      const statusColors: Record<string, string> = {
        'PENDING': '#f59e0b', // yellow
        'APPROVED': '#10b981', // green
        'REJECTED': '#ef4444', // red
        'CANCELLED': '#6b7280' // gray
      };

      const typeColors: Record<string, string> = {
        'CASUAL': '#3b82f6', // blue
        'SICK': '#f97316', // orange
        'ANNUAL': '#8b5cf6', // purple
        'MATERNITY': '#ec4899', // pink
        'PATERNITY': '#06b6d4', // cyan
        'UNPAID': '#64748b' // slate
      };

      const color = statusColors[request.status] || typeColors[request.type] || '#6b7280';

      return {
        id: request.id,
        title: `${request.user?.name || 'User'} - ${request.type}`,
        start: request.fromDate.toISOString(),
        end: new Date(request.toDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Add one day for full calendar
        type: request.type,
        status: request.status,
        userId: request.userId,
        userName: request.user?.name || '',
        allDay: true,
        color: color
      };
    });

    return events;
  },

  // =========================
  // Users for Leave Management
  // =========================

  getUsersForLeaveManagement: async () => {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'user'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' }
    });

    return users;
  },

  // =========================
  // Helper Methods
  // =========================

  getAvailableLeaveTypes: () => {
    return [
      { value: 'CASUAL', label: 'Casual Leave' },
      { value: 'SICK', label: 'Sick Leave' },
      { value: 'ANNUAL', label: 'Annual Leave' },
      { value: 'MATERNITY', label: 'Maternity Leave' },
      { value: 'PATERNITY', label: 'Paternity Leave' },
      { value: 'UNPAID', label: 'Unpaid Leave' }
    ];
  },

  getAvailableLeaveStatuses: () => {
    return [
      { value: 'PENDING', label: 'Pending' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
      { value: 'CANCELLED', label: 'Cancelled' }
    ];
  },

  checkUserExists: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    return !!user;
  },

  // Calculate working days between two dates (excluding weekends)
  calculateWorkingDays: (startDate: Date, endDate: Date, halfDay: boolean = false): number => {
    if (halfDay) return 0.5;
    
    let days = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Count only weekdays (Monday to Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }
};