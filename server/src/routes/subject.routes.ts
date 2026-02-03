import express from 'express';
import Subject from '../models/Subject';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log('=== ПОЛУЧЕНИЕ ПРЕДМЕТОВ ===');
    console.log('Query params:', req.query);
    
    const filter: any = { isActive: true };
    
    // Фильтр по обязательности
    if (req.query.isMandatory !== undefined) {
      filter.isMandatory = req.query.isMandatory === 'true';
      console.log('Фильтр по isMandatory:', filter.isMandatory);
    }
    
    console.log('Финальный фильтр:', filter);
    
    const subjects = await Subject.find(filter).sort({ nameUzb: 1 });
    console.log(`✅ Найдено предметов: ${subjects.length}`);
    
    res.json(subjects);
  } catch (error: any) {
    console.error('❌ Error fetching subjects:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    console.log('Creating subject:', req.body);
    const subject = new Subject(req.body);
    await subject.save();
    console.log('Subject created:', subject);
    res.status(201).json(subject);
  } catch (error: any) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ message: 'Fan topilmadi' });
    }
    res.json(subject);
  } catch (error: any) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!subject) {
      return res.status(404).json({ message: 'Fan topilmadi' });
    }
    res.json({ message: 'Fan o\'chirildi', subject });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

export default router;
