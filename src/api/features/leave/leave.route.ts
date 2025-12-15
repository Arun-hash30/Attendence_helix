import { Router } from 'express';
import { leaveService } from './leave.service.js';

export const leaveRouter = Router();

// =====================
// User Routes
// =====================

// Get leave balance
leaveRouter.get('/balance/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const data = await leaveService.getBalance(userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

// Apply leave
leaveRouter.post('/apply/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const leave = await leaveService.applyLeave(userId, req.body);
    res.status(201).json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to apply leave' });
  }
});

// Get user's leaves
leaveRouter.get('/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const leaves = await leaveService.getMyLeaves(userId);
    res.json(Array.isArray(leaves) ? leaves : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// =====================
// Admin Routes
// =====================

// Get all leaves
leaveRouter.get('/admin/all', async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    res.json(Array.isArray(leaves) ? leaves : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all leaves' });
  }
});

// Approve leave
leaveRouter.post('/:id/approve/:adminId', async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const adminId = Number(req.params.adminId);
    await leaveService.approveLeave(adminId, leaveId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve leave' });
  }
});

// Reject leave
leaveRouter.post('/:id/reject/:adminId', async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const adminId = Number(req.params.adminId);
    await leaveService.rejectLeave(adminId, leaveId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject leave' });
  }
});

export default leaveRouter;