import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import TestOptionsModal from '@/components/TestOptionsModal';
import { 
  Plus, 
  BookOpen, 
  Search, 
  Calendar,
  Edit2,
  Trash2,
  Upload,
  ArrowRight,
  Layers
} from 'lucide-react';

export default function BlockTestsPage() {
  const navigate = useNavigate();
  const [blockTests, setBlockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showVariantsModal, setShowVariantsModal] = useState(false);

  useEffect(() => {
    fetchBlockTests();
  }, []);

  const fetchBlockTests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/block-tests');
      setBlockTests(data);
    } catch (error) {
      console.error('Error fetching block tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = blockTests.filter(test =>
    test.classNumber?.toString().includes(searchQuery) ||
    test.date?.includes(searchQuery)
  );

  const groupedTests = filteredTests.reduce((acc: any, test) => {
    const dateKey = new Date(test.date).toISOString().split('T')[0];
    const key = `${test.classNumber}-${dateKey}`;
    
    if (!acc[key]) {
      acc[key] = {
        classNumber: test.classNumber,
        date: test.date,
        dateKey: dateKey,
        tests: [],
        allSubjects: [],
        totalStudents: 0,
        totalQuestions: 0
      };
    }
    
    acc[key].tests.push(test);
    
    // Collect ALL subject tests (don't filter duplicates)
    if (test.subjectTests && Array.isArray(test.subjectTests)) {
      test.subjectTests.forEach((st: any) => {
        // Add all subject tests without checking for duplicates
        acc[key].allSubjects.push(st);
        
        // Count questions from each subject test
        if (st.questions && Array.isArray(st.questions)) {
          acc[key].totalQuestions += st.questions.length;
        }
      });
    }
    
    const studentIds = new Set(acc[key].tests.flatMap((t: any) => 
      t.studentConfigs?.map((sc: any) => sc.studentId?.toString() || sc.studentId) || []
    ));
    acc[key].totalStudents = studentIds.size;
    
    return acc;
  }, {});

  const groupedArray = Object.values(groupedTests).sort((a: any, b: any) => {
    if (a.classNumber !== b.classNumber) return b.classNumber - a.classNumber;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDeleteTest = async (group: any) => {
    if (!confirm('Bu guruhdagi barcha testlarni o\'chirmoqchimisiz?')) return;
    
    try {
      for (const test of group.tests) {
        await api.delete(`/block-tests/${test._id}`);
      }
      fetchBlockTests();
    } catch (error) {
      console.error('Error deleting tests:', error);
      alert('Testlarni o\'chirishda xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl mb-3"></div>
          <div className="h-6 w-96 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Blok testlar</h1>
              <p className="text-sm sm:text-base text-slate-600 truncate">Blok testlarni yaratish va boshqarish</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/teacher/block-tests/import')}
              className="flex-1 sm:flex-none border-2 hover:border-purple-500 hover:text-purple-600"
            >
              <Upload className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Yuklash</span>
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/teacher/block-tests/create')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Blok test qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Sinf yoki sana bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-colors text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Block Tests Grid */}
      {groupedArray.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupedArray.map((group: any, groupIndex: number) => {
            const firstTest = group.tests[0];
            const formattedDate = new Date(group.date).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            
            return (
              <div
                key={`${group.classNumber}-${group.dateKey}`}
                style={{ animationDelay: `${groupIndex * 100}ms` }}
                className="group animate-slide-in"
              >
                <Card 
                  className="h-full border-2 border-slate-200/50 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/teacher/block-tests/${firstTest._id}/configure`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Info */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {group.classNumber}-sinf
                      </h3>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Layers className="w-4 h-4" />
                        <span className="text-sm font-medium">{group.allSubjects.length} ta test</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">{group.totalQuestions} ta savol</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 border-2 hover:border-purple-500 hover:text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/block-tests/${firstTest._id}/edit`);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Tahrirlash
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTest(group);
                        }}
                        className="border-2 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-slate-200/50">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery ? 'Testlar topilmadi' : 'Blok testlar yo\'q'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Qidiruv bo\'yicha hech narsa topilmadi. Boshqa so\'z bilan qidiring.'
                : 'Birinchi blok testni yaratish uchun yuqoridagi tugmani bosing'
              }
            </p>
            {!searchQuery && (
              <Button 
                size="lg"
                onClick={() => navigate('/teacher/block-tests/import')}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <Upload className="w-5 h-5 mr-2" />
                Blok test yuklash
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <TestOptionsModal
        isOpen={showVariantsModal}
        onClose={() => setShowVariantsModal(false)}
        test={selectedTest}
      />
    </div>
  );
}
