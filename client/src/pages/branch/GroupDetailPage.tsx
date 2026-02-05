import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import StudentProfileModal from '@/components/StudentProfileModal';
import StudentQRCode from '@/components/StudentQRCode';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Award, 
  FileText,
  User,
  Phone,
  GraduationCap,
  Search,
  QrCode
} from 'lucide-react';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrStudent, setQrStudent] = useState<any>(null);
  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch group info
      const { data: groupData } = await api.get(`/groups/${id}`);
      setGroup(groupData);

      // Fetch students in this group using the new endpoint
      const { data: groupStudents } = await api.get(`/groups/${id}/students`);
      setStudents(groupStudents);

      // Fetch tests for this group
      const { data: testsData } = await api.get('/tests');
      setTests(testsData.filter((t: any) => t.groupId?._id === id));
      
    } catch (error) {
      console.error('Error fetching group details:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate('/custom/groups')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-16">
            <EmptyState
              icon={Users}
              title="Guruh topilmadi"
              description="Bu guruh mavjud emas yoki o'chirilgan"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter students by search query
  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone?.includes(searchQuery)
  );

  // Calculate statistics
  const averageScore = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.averagePercentage || 0), 0) / students.length)
    : 0;
  
  const bestScore = students.length > 0
    ? Math.max(...students.map(s => s.averagePercentage || 0))
    : 0;
  
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => navigate('/custom/groups')} 
          variant="outline"
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
      </div>

      {/* Group Info Card */}
      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                  {group.classNumber}-sinf
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                  {group.letter}
                </span>
                {group.subjectId && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                    {group.subjectId.nameUzb}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        {group.teacherId && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">O'qituvchi</p>
                <p className="text-lg font-bold text-gray-900">{group.teacherId.fullName}</p>
                {group.teacherId.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{group.teacherId.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-semibold uppercase">O'quvchilar</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{students.length}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-semibold uppercase">Testlar</p>
            <p className="text-4xl font-bold text-green-900 mt-2">{totalTests}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-semibold uppercase">O'rtacha</p>
            <p className="text-4xl font-bold text-purple-900 mt-2">{averageScore}%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 font-semibold uppercase">Eng yaxshi</p>
            <p className="text-4xl font-bold text-orange-900 mt-2">{bestScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">O'quvchilar</CardTitle>
                <p className="text-sm text-gray-600">{students.length} ta o'quvchi</p>
              </div>
            </div>
          </div>
          
          {/* Search Input */}
          {students.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="O'quvchi ismini yoki telefon raqamini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">Bu guruhda hali o'quvchilar yo'q</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">Qidiruv bo'yicha o'quvchi topilmadi</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Tozalash
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student, index) => (
                <div 
                  key={student._id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg font-bold text-white">{index + 1}</span>
                  </div>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedStudentId(student._id)}
                  >
                    <p className="font-bold text-gray-900 truncate">{student.fullName}</p>
                    {student.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrStudent(student);
                    }}
                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0"
                    title="QR kod"
                  >
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </button>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${
                      (student.averagePercentage || 0) >= 80 ? 'text-green-600' :
                      (student.averagePercentage || 0) >= 60 ? 'text-blue-600' :
                      (student.averagePercentage || 0) >= 40 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {student.averagePercentage || 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.testsCompleted || 0} test
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Testlar</CardTitle>
                <p className="text-sm text-gray-600">{totalTests} ta test</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">Bu guruh uchun hali testlar yaratilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div 
                  key={test._id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate hover:text-green-600 transition-colors">{test.name}</p>
                    <p className="text-sm text-gray-600">
                      {test.questions?.length || 0} ta savol
                    </p>
                  </div>
                  <Badge variant="info">
                    {new Date(test.createdAt).toLocaleDateString('uz-UZ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Profile Modal */}
      <StudentProfileModal 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)} 
      />

      {/* QR Code Modal */}
      {qrStudent && (
        <StudentQRCode
          student={qrStudent}
          onClose={() => setQrStudent(null)}
        />
      )}
    </div>
  );
}
