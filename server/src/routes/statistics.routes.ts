import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import Branch from '../models/Branch';
import Subject from '../models/Subject';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Test from '../models/Test';
import TestResult from '../models/TestResult';
import Group from '../models/Group';
import StudentGroup from '../models/StudentGroup';
import mongoose from 'mongoose';

const router = Router();

// Get overall statistics
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    // Use Promise.all to run all queries in parallel
    const [
      totalBranches,
      totalSubjects,
      totalStudents,
      totalTeachers,
      totalTests,
      totalTestResults,
      avgScoreResult,
      branches
    ] = await Promise.all([
      Branch.countDocuments(),
      Subject.countDocuments(),
      Student.countDocuments(),
      Teacher.countDocuments(),
      Test.countDocuments(),
      TestResult.countDocuments(),
      TestResult.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]),
      Branch.find().lean()
    ]);

    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    // Use aggregation to get branch statistics efficiently
    const [studentsByBranch, teachersByBranch, groupsByBranch, groupCapacityByBranch, studentGroupsByBranch] = await Promise.all([
      Student.aggregate([
        { $group: { _id: '$branchId', count: { $sum: 1 } } }
      ]),
      Teacher.aggregate([
        { $group: { _id: '$branchId', count: { $sum: 1 } } }
      ]),
      Group.aggregate([
        { $group: { _id: '$branchId', count: { $sum: 1 } } }
      ]),
      // Get total capacity per branch
      Group.aggregate([
        { 
          $group: { 
            _id: '$branchId', 
            totalCapacity: { $sum: { $ifNull: ['$capacity', 20] } }
          } 
        }
      ]),
      // Get total students in groups per branch
      StudentGroup.aggregate([
        {
          $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'group'
          }
        },
        { $unwind: '$group' },
        {
          $group: {
            _id: '$group.branchId',
            totalStudents: { $sum: 1 }
          }
        }
      ])
    ]);

    // Create lookup maps for O(1) access
    const studentsMap = new Map(studentsByBranch.map(item => [item._id?.toString(), item.count]));
    const teachersMap = new Map(teachersByBranch.map(item => [item._id?.toString(), item.count]));
    const groupsMap = new Map(groupsByBranch.map(item => [item._id?.toString(), item.count]));
    const capacityMap = new Map(groupCapacityByBranch.map(item => [item._id?.toString(), item.totalCapacity]));
    const groupStudentsMap = new Map(studentGroupsByBranch.map(item => [item._id?.toString(), item.totalStudents]));

    // Build branch stats efficiently
    const branchStats = branches.map(branch => {
      const branchId = branch._id.toString();
      const totalCapacity = capacityMap.get(branchId) || 0;
      const totalStudentsInGroups = groupStudentsMap.get(branchId) || 0;
      const fillPercentage = totalCapacity > 0 
        ? Math.round((totalStudentsInGroups / totalCapacity) * 100) 
        : 0;

      return {
        _id: branch._id,
        name: branch.name,
        studentsCount: studentsMap.get(branchId) || 0,
        teachersCount: teachersMap.get(branchId) || 0,
        groupsCount: groupsMap.get(branchId) || 0,
        fillPercentage,
      };
    });

    res.json({
      totalBranches,
      totalSubjects,
      totalStudents,
      totalTeachers,
      totalTests,
      totalTestResults,
      averageScore: Math.round(averageScore * 100) / 100,
      branches: branchStats,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
