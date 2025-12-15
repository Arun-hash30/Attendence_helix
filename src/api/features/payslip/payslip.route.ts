import { Router } from 'express';
import { payslipService } from './payslip.service.js';

export const payslipRouter = Router();

// =========================
// Admin Routes
// =========================

// Create salary structure
payslipRouter.post('/salary/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    // Check if user exists
    const userExists = await payslipService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const salary = await payslipService.createSalaryStructure(userId, req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Salary structure created successfully',
      data: salary 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to create salary structure' 
    });
  }
});

// Generate payslips for multiple months
payslipRouter.post('/generate', async (req, res) => {
  try {
    const { userId, months, year } = req.body;

    // Validation
    if (!userId || !months || !Array.isArray(months) || !year) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, months (array), year' 
      });
    }

    if (months.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please select at least one month' 
      });
    }

    // Check if user exists
    const userExists = await payslipService.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const result = await payslipService.generatePayslips({ userId, months, year });
    
    if (result.success === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No payslips were generated. They may already exist for the selected months.',
        data: result 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: result.message,
      data: result 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to generate payslips' 
    });
  }
});

// Get all payslips (admin view)
payslipRouter.get('/admin/all', async (req, res) => {
  try {
    const filters = {
      month: req.query.month ? Number(req.query.month) : undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      status: req.query.status as string | undefined,
    };
    
    const payslips = await payslipService.getAllPayslips(filters);
    res.json({ 
      success: true, 
      data: payslips 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payslips' 
    });
  }
});

// Get users for payslip generation
payslipRouter.get('/admin/users', async (req, res) => {
  try {
    const users = await payslipService.getUsersForPayslip();
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// Delete payslip
payslipRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Check if payslip exists
    const payslip = await payslipService.getPayslipById(id);
    if (!payslip) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payslip not found' 
      });
    }

    await payslipService.deletePayslip(id);
    res.json({ 
      success: true, 
      message: 'Payslip deleted successfully' 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to delete payslip' 
    });
  }
});

// Update payslip status
payslipRouter.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!['GENERATED', 'PROCESSED', 'PAID'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be GENERATED, PROCESSED, or PAID' 
      });
    }
    
    // Check if payslip exists
    const payslipExists = await payslipService.getPayslipById(id);
    if (!payslipExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payslip not found' 
      });
    }
    
    const payslip = await payslipService.updatePayslipStatus(id, status);
    res.json({ 
      success: true, 
      message: 'Payslip status updated successfully',
      data: payslip 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to update payslip status' 
    });
  }
});

// Get payslip statistics
payslipRouter.get('/admin/stats', async (req, res) => {
  try {
    const stats = await payslipService.getPayslipStats();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payslip statistics' 
    });
  }
});

// Get available years
payslipRouter.get('/years', async (req, res) => {
  try {
    const years = await payslipService.getAvailableYears();
    res.json({ 
      success: true, 
      data: years 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch available years' 
    });
  }
});

// =========================
// User Routes
// =========================

// Get my payslips
payslipRouter.get('/my/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const payslips = await payslipService.getPayslipsByUser(userId);
    res.json({ 
      success: true, 
      data: payslips 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payslips' 
    });
  }
});

// Get single payslip
payslipRouter.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payslip = await payslipService.getPayslipById(id);
    
    if (!payslip) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payslip not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: payslip 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payslip' 
    });
  }
});

export default payslipRouter;