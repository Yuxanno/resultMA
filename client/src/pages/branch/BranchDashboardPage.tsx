import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Users, GraduationCap, UserCog, Target, Activity } from 'lucide-react';
import { PageNavbar } from '@/components/ui/PageNavbar';
import { StatsCard } from '@/components/ui/StatsCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import api from '@/lib/api';

interface BranchStats {
  totalGroups: number;
  totalStudents: number;
  totalTeachers: number;
  totalTests: number;
  totalTestResults: number;
  averageScore: number;
  fillPercentage: number;
  topStudents?: Array<{
    _id: string;
    fullName: string;
    averageScore: number;
    testsCompleted: number;
    rank: number;
  }>;
}

export default function BranchDashboardPage() {
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [groupsRes, studentsRes, teachersRes, testResultsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/students'),
        api.get('/teachers'),
        api.get('/test-results').catch(() => ({ data: [] }))
      ]);

      // Calculate fill percentage
      const groups = groupsRes.data;
      let totalCapacity = 0;
      let totalStudents = 0;
      
      groups.forEach((group: any) => {
        totalCapacity += group.capacity || 20;
        totalStudents += group.studentsCount || 0;
      });

      const fillPercentage = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

      // Calculate top students
      const students = studentsRes.data;
      const testResults = testResultsRes.data;

      // Group test results by student
      const studentScores: Record<string, { total: number; count: number }> = {};
      
      testResults.forEach((result: any) => {
        const studentId = result.studentId?._id || result.studentId;
        if (!studentId) return;

        if (!studentScores[studentId]) {
          studentScores[studentId] = {
            total: 0,
            count: 0
          };
        }

        if (result.score !== undefined && result.score !== null) {
          studentScores[studentId].total += result.score;
          studentScores[studentId].count += 1;
        }
      });

      // Create array with ALL students (including those with no test results)
      const studentsWithScores = students.map((student: any) => {
        const scores = studentScores[student._id];
        return {
          _id: student._id,
          fullName: student.fullName,
          averageScore: scores && scores.count > 0 ? Math.round(scores.total / scores.count) : 0,
          testsCompleted: scores ? scores.count : 0
        };
      })
      .sort((a, b) => {
        // Sort by score descending, then by name ascending
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }
        return a.fullName.localeCompare(b.fullName);
      });

      // Assign ranks (same score = same rank)
      const topStudents = studentsWithScores.slice(0, 100).map((student, index, array) => {
        let rank = index + 1;
        
        // Check if previous student has same score
        if (index > 0 && array[index - 1].averageScore === student.averageScore) {
          rank = (array[index - 1] as any).rank;
        }
        
        return {
          ...student,
          rank
        };
      });

      setStats({
        totalGroups: groupsRes.data.length,
        totalStudents: studentsRes.data.length,
        totalTeachers: teachersRes.data.length,
        totalTests: 0,
        totalTestResults: testResults.length,
        averageScore: 0,
        fillPercentage,
        topStudents
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeacherStudentRatio = () => {
    if (!stats || stats.totalTeachers === 0) return 0;
    return Math.round(stats.totalStudents / stats.totalTeachers);
  };

  const calculateActivityRate = () => {
    if (!stats || stats.totalTests === 0) return 0;
    return Math.round((stats.totalTestResults / stats.totalTests) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageNavbar
          title="Bosh sahifa"
          description="Filial statistikasi"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard variant="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard variant="stats" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 gradient-mesh min-h-screen p-6">
      <div className="animate-fade-in">
        <PageNavbar
          title="Bosh sahifa"
          description="Filial statistikasi va umumiy ma'lumotlar"
          gradient={true}
        />
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        <StatsCard
          title="Guruhlar"
          value={stats?.totalGroups || 0}
          icon={Users}
          color="blue"
          gradient={true}
          subtitle="Faol guruhlar"
        />
        
        <StatsCard
          title="O'quvchilar"
          value={stats?.totalStudents || 0}
          icon={GraduationCap}
          color="purple"
          gradient={true}
          subtitle="Ro'yxatdan o'tgan"
        />
        
        <StatsCard
          title="O'qituvchilar"
          value={stats?.totalTeachers || 0}
          icon={UserCog}
          color="orange"
          gradient={true}
          subtitle="Faol o'qituvchilar"
        />
        
        <StatsCard
          title="Guruh/O'quvchi"
          value={stats?.totalGroups ? Math.round(stats.totalStudents / stats.totalGroups) : 0}
          icon={Activity}
          color="green"
          gradient={true}
          subtitle="O'rtacha o'quvchilar soni"
        />
      </div>

      {/* Top Students Ranking */}
      <Card className="hover-lift glass-card animate-scale-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">O'quvchilar Reytingi</h3>
                <p className="text-sm text-muted-foreground">
                  {stats?.topStudents && stats.topStudents.length > 0 
                    ? `Top ${stats.topStudents.length} o'quvchi` 
                    : 'Eng yaxshi natijalar'}
                </p>
              </div>
            </div>
          </div>

          {stats?.totalStudents === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">Hozircha o'quvchilar yo'q</p>
            </div>
          ) : !stats?.topStudents || stats.topStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">O'quvchilar yuklanmoqda...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {stats.topStudents.map((student, index) => {
                const rank = student.rank;
                const isTopThree = rank <= 3;
                
                return (
                  <div 
                    key={student._id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                      rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-xl font-bold text-white">{rank}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{student.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {student.testsCompleted > 0 
                          ? `${student.testsCompleted} ta test topshirgan` 
                          : 'Hali test topshirmagan'}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold ${
                        student.averageScore >= 80 ? 'text-green-600' :
                        student.averageScore >= 60 ? 'text-blue-600' :
                        student.averageScore >= 40 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {student.averageScore}%
                      </p>
                      <p className="text-xs text-gray-500">O'rtacha</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
