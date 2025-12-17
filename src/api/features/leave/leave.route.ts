import { Router, Request, Response } from 'express';
import { leaveService } from './leave.service.js';

export const leaveRouter = Router();

// =========================
// Public/Info Routes
// =========================

// Get available leave types
leaveRouter.get('/types', async (_: Request, res: Response) => {
  try {
    const types = leaveService.getAvailableLeaveTypes();
    res.json({ 
      success: true, 
      data: types 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave types' 
    });
  }
});

// Get available leave statuses
leaveRouter.get('/statuses', async (_: Request, res: Response) => {
  try {
    const statuses = leaveService.getAvailableLeaveStatuses();
    res.json({ 
      success: true, 
      data: statuses 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave statuses' 
    });
  }
});

// =========================
// User Routes
// =========================

// Get my leave balance
leaveRouter.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const year = req.query.year ? Number(req.query.year) : undefined;
    
    const userExists = await leaveService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const balance = await leaveService.getLeaveBalance(userId, year);
    res.json({ 
      success: true, 
      data: balance 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave balance' 
    });
  }
});

// Apply for leave
leaveRouter.post('/apply/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const input = req.body;

    // Validation
    if (!input.type || !input.fromDate || !input.toDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, fromDate, toDate' 
      });
    }

    const userExists = await leaveService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const leaveRequest = await leaveService.applyLeave(userId, input);
    res.status(201).json({ 
      success: true, 
      message: 'Leave application submitted successfully',
      data: leaveRequest 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to apply for leave' 
    });
  }
});

// Get my leave requests
leaveRouter.get('/my/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const filters = {
      status: req.query.status as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      type: req.query.type as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };

    const userExists = await leaveService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const result = await leaveService.getMyLeaveRequests(userId, filters);
    res.json({ 
      success: true, 
      data: result.data,
      pagination: result.pagination
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave requests' 
    });
  }
});

// Cancel my leave request
leaveRouter.put('/cancel/:id/:userId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.params.userId);

    await leaveService.cancelLeaveRequest(id, userId);
    res.json({ 
      success: true, 
      message: 'Leave request cancelled successfully' 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to cancel leave request' 
    });
  }
});

// Get my leave statistics
leaveRouter.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const year = req.query.year ? Number(req.query.year) : undefined;

    const userExists = await leaveService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const stats = await leaveService.getLeaveStats(userId, year);
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave statistics' 
    });
  }
});

// =========================
// Admin Routes
// =========================

// Get all leave requests (admin view)
leaveRouter.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      type: req.query.type as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };

    const result = await leaveService.getAllLeaveRequests(filters);
    res.json({ 
      success: true, 
      data: result.data,
      pagination: result.pagination
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave requests' 
    });
  }
});

// Get users for leave management
leaveRouter.get('/admin/users', async (_: Request, res: Response) => {
  try {
    const users = await leaveService.getUsersForLeaveManagement();
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch users' 
    });
  }
});

// Get single leave request
leaveRouter.get('/admin/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const leaveRequest = await leaveService.getLeaveRequestById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave request not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: leaveRequest 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave request' 
    });
  }
});

// Update leave status (approve/reject)
leaveRouter.put('/admin/status/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { approverId, status, comments } = req.body;

    if (!approverId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: approverId, status' 
      });
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: PENDING, APPROVED, REJECTED, CANCELLED' 
      });
    }

    const userExists = await leaveService.checkUserExists(approverId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Approver not found' 
      });
    }

    const leaveRequest = await leaveService.updateLeaveStatus(id, approverId, { status, comments });
    res.json({ 
      success: true, 
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leaveRequest 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to update leave status' 
    });
  }
});

// Get admin leave statistics
leaveRouter.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year as string) : undefined;
    const stats = await leaveService.getLeaveStats(undefined, year);
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch leave statistics' 
    });
  }
});

// =========================
// Calendar Routes
// =========================

// Get leave calendar
leaveRouter.get('/calendar/:year/:month', async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);
    const userId = req.query.userId ? Number(req.query.userId as string) : undefined;

    if (month < 1 || month > 12) {
      return res.status(400).json({ 
        success: false, 
        error: 'Month must be between 1 and 12' 
      });
    }

    const events = await leaveService.getLeaveCalendar(year, month, userId);
    res.json({ 
      success: true, 
      data: events 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch calendar events' 
    });
  }
});

export default leaveRouter;