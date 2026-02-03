import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import TestResult from '../models/TestResult';

const router = express.Router();

// Get all test results
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};
    
    // Если не Super Admin, показываем только результаты своего филиала
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.branchId = req.user?.branchId;
    }
    
    const testResults = await TestResult.find(filter)
      .populate('studentId')
      .populate('testId')
      .populate('blockTestId')
      .sort({ createdAt: -1 });
    
    res.json(testResults);
  } catch (error: any) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Get test result by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const testResult = await TestResult.findById(req.params.id)
      .populate('studentId')
      .populate('testId')
      .populate('blockTestId');
    
    if (!testResult) {
      return res.status(404).json({ message: 'Test natijasi topilmadi' });
    }
    
    // Проверка доступа
    if (req.user?.role !== 'SUPER_ADMIN' && testResult.branchId?.toString() !== req.user?.branchId?.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    
    res.json(testResult);
  } catch (error: any) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Get test results by student
router.get('/student/:studentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const filter: any = { studentId: req.params.studentId };
    
    // Если не Super Admin, показываем только результаты своего филиала
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.branchId = req.user?.branchId;
    }
    
    const testResults = await TestResult.find(filter)
      .populate('testId')
      .populate('blockTestId')
      .sort({ createdAt: -1 });
    
    res.json(testResults);
  } catch (error: any) {
    console.error('Error fetching student test results:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Get test results by test
router.get('/test/:testId', authenticate, async (req: AuthRequest, res) => {
  try {
    const filter: any = { testId: req.params.testId };
    
    // Если не Super Admin, показываем только результаты своего филиала
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.branchId = req.user?.branchId;
    }
    
    const testResults = await TestResult.find(filter)
      .populate('studentId')
      .sort({ createdAt: -1 });
    
    res.json(testResults);
  } catch (error: any) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Create test result
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const testResultData = {
      ...req.body,
      branchId: req.user?.branchId
    };
    
    const testResult = new TestResult(testResultData);
    await testResult.save();
    
    const populatedResult = await TestResult.findById(testResult._id)
      .populate('studentId')
      .populate('testId')
      .populate('blockTestId');
    
    res.status(201).json(populatedResult);
  } catch (error: any) {
    console.error('Error creating test result:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Update test result
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const testResult = await TestResult.findById(req.params.id);
    
    if (!testResult) {
      return res.status(404).json({ message: 'Test natijasi topilmadi' });
    }
    
    // Проверка доступа
    if (req.user?.role !== 'SUPER_ADMIN' && testResult.branchId?.toString() !== req.user?.branchId?.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    
    Object.assign(testResult, req.body);
    await testResult.save();
    
    const populatedResult = await TestResult.findById(testResult._id)
      .populate('studentId')
      .populate('testId')
      .populate('blockTestId');
    
    res.json(populatedResult);
  } catch (error: any) {
    console.error('Error updating test result:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

// Delete test result
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const testResult = await TestResult.findById(req.params.id);
    
    if (!testResult) {
      return res.status(404).json({ message: 'Test natijasi topilmadi' });
    }
    
    // Проверка доступа
    if (req.user?.role !== 'SUPER_ADMIN' && testResult.branchId?.toString() !== req.user?.branchId?.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    
    await TestResult.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test natijasi o\'chirildi' });
  } catch (error: any) {
    console.error('Error deleting test result:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

export default router;
