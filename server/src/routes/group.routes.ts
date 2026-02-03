import express from 'express';
import Group from '../models/Group';
import StudentGroup from '../models/StudentGroup';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};
    
    // Фильтрация по роли
    if (req.user?.role === UserRole.TEACHER) {
      filter.teacherId = req.user?.teacherId;
    } else if (req.user?.role !== UserRole.SUPER_ADMIN) {
      filter.branchId = req.user?.branchId;
    }
    
    // Оптимизированный запрос БЕЗ lean() для правильного populate
    const groups = await Group.find(filter)
      .populate('subjectId', 'nameUzb nameRu')
      .populate('teacherId', 'username fullName') // teacherId теперь указывает на User
      .populate('branchId', 'name')
      .select('name classNumber letter teacherId branchId subjectId capacity createdAt')
      .exec();
    
    // Дополнительная фильтрация для учителя
    let filteredGroups = groups;
    if (req.user?.role === UserRole.TEACHER) {
      filteredGroups = groups.filter(group => 
        group.teacherId && 
        group.teacherId._id.toString() === req.user?.teacherId
      );
    }
    
    // Получаем количество учеников одним запросом
    const groupIds = filteredGroups.map(g => g._id);
    const studentCounts = await StudentGroup.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(studentCounts.map(sc => [sc._id.toString(), sc.count]));
    
    const groupsWithCount = filteredGroups.map(group => ({
      ...group.toObject(), // Преобразуем Mongoose документ в plain object
      studentCount: countMap.get(group._id.toString()) || 0
    }));
    
    console.log('Fetched groups:', groupsWithCount.length, 'for user role:', req.user?.role);
    console.log('Sample group:', groupsWithCount[0] ? {
      id: groupsWithCount[0]._id,
      name: groupsWithCount[0].name,
      teacherId: groupsWithCount[0].teacherId?._id || 'null',
      teacherName: (groupsWithCount[0].teacherId as any)?.fullName || 'null'
    } : 'no groups');
    
    res.json(groupsWithCount);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('subjectId')
      .populate('teacherId')
      .populate('branchId');
    
    if (!group) {
      return res.status(404).json({ message: 'Guruh topilmadi' });
    }
    
    // Проверка доступа для учителя
    if (req.user?.role === UserRole.TEACHER) {
      // Учитель может видеть только свои группы
      if (!group.teacherId || group.teacherId._id.toString() !== req.user.teacherId) {
        return res.status(403).json({ message: 'Sizda bu guruhga kirish huquqi yo\'q' });
      }
    } else if (req.user?.role === UserRole.FIL_ADMIN) {
      // Branch admin может видеть только группы своего филиала
      if (group.branchId?._id.toString() !== req.user.branchId) {
        return res.status(403).json({ message: 'Sizda bu guruhga kirish huquqi yo\'q' });
      }
    }
    
    console.log('Fetched group:', group._id, 'for user role:', req.user?.role);
    res.json(group);
  } catch (error: any) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    console.log('Creating group:', req.body);
    const { name, classNumber, subjectId, letter, teacherId } = req.body;
    
    if (!name || !classNumber || !subjectId || !letter) {
      return res.status(400).json({ message: 'Barcha majburiy maydonlarni to\'ldiring' });
    }
    
    const group = new Group({
      branchId: req.user?.branchId,
      name,
      classNumber,
      subjectId,
      letter,
      teacherId: teacherId || undefined // Convert empty string to undefined
    });
    
    await group.save();
    console.log('Group created:', group._id);
    
    const populatedGroup = await Group.findById(group._id)
      .populate('subjectId')
      .populate('teacherId');
    
    res.status(201).json(populatedGroup);
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    console.log('=== ОБНОВЛЕНИЕ ГРУППЫ ===');
    console.log('Group ID:', req.params.id);
    console.log('Данные:', req.body);
    console.log('TeacherId:', req.body.teacherId);
    
    const updateData = { ...req.body };
    if (updateData.teacherId === '') {
      console.log('TeacherId пустой, устанавливаем undefined');
      updateData.teacherId = undefined;
    }
    
    console.log('UpdateData после обработки:', updateData);
    
    // Сначала обновляем без populate
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedGroup) {
      console.log('❌ Группа не найдена');
      return res.status(404).json({ message: 'Guruh topilmadi' });
    }
    
    console.log('✅ Группа обновлена (raw):', {
      id: updatedGroup._id,
      name: updatedGroup.name,
      teacherId: updatedGroup.teacherId || 'null'
    });
    
    // Теперь загружаем с populate
    const group = await Group.findById(updatedGroup._id)
      .populate('subjectId')
      .populate('teacherId')
      .exec();
    
    console.log('✅ Группа с populate:', {
      id: group?._id,
      name: group?.name,
      teacherId: group?.teacherId?._id || 'null',
      teacherName: (group?.teacherId as any)?.fullName || 'null'
    });
    
    res.json(group);
  } catch (error: any) {
    console.error('❌ Error updating group:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Guruh topilmadi' });
    }
    res.json({ message: 'Guruh o\'chirildi' });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
});

export default router;
