import express from 'express';
import Student from '../models/Student';
import StudentGroup from '../models/StudentGroup';
import TestResult from '../models/TestResult';

const router = express.Router();

router.get('/profile/:token', async (req, res) => {
  try {
    const student = await Student.findOne({ profileToken: req.params.token })
      .populate('directionId')
      .populate('subjectIds');
    
    if (!student) {
      return res.status(404).json({ message: 'Profil topilmadi' });
    }
    
    // Получаем группы студента
    const studentGroups = await StudentGroup.find({ studentId: student._id })
      .populate({
        path: 'groupId',
        select: 'name letter classNumber',
        populate: {
          path: 'subjectId',
          select: 'nameUzb'
        }
      })
      .lean();
    
    const groups = studentGroups.map((sg: any) => ({
      _id: sg.groupId?._id,
      groupName: sg.groupId?.name,
      letter: sg.groupId?.letter,
      subjectName: sg.groupId?.subjectId?.nameUzb
    })).filter(g => g._id);
    
    const results = await TestResult.find({ studentId: student._id })
      .populate('testId')
      .sort({ createdAt: -1 });
    
    const avgPercentage = results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0;
    
    res.json({
      student: {
        _id: student._id,
        fullName: student.fullName,
        classNumber: student.classNumber,
        direction: student.directionId
      },
      groups,
      groupsCount: groups.length,
      avgPercentage: Math.round(avgPercentage),
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
});

// Получение деталей результата теста
router.get('/test-result/:resultId/:token', async (req, res) => {
  try {
    const { resultId, token } = req.params;
    
    // Проверяем токен студента
    const student = await Student.findOne({ profileToken: token });
    if (!student) {
      return res.status(404).json({ message: 'Profil topilmadi' });
    }
    
    // Получаем результат теста с полной информацией
    const result = await TestResult.findById(resultId)
      .populate({
        path: 'testId',
        populate: {
          path: 'questions'
        }
      })
      .populate('variantId');
    
    if (!result) {
      return res.status(404).json({ message: 'Natija topilmadi' });
    }
    
    // Проверяем, что результат принадлежит этому студенту
    if (result.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
});

export default router;
