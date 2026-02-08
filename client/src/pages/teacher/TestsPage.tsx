import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PageNavbar } from '@/components/ui/PageNavbar';
import { useToast } from '@/hooks/useToast';
import { useTests, useDeleteTest } from '@/hooks/useTests';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Plus, Upload, FileText, Edit2, Trash2, Calendar, ArrowRight } from 'lucide-react';

export default function TestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // React Query hooks
  const { data: tests = [], isLoading: loading, refetch } = useTests('minimal');
  const deleteTestMutation = useDeleteTest();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { success, error } = useToast();

  // Перезагружаем тесты при возврате на страницу с флагом refresh
  useEffect(() => {
    if (location.state?.refresh) {
      refetch();
      // Очищаем state чтобы не перезагружать при следующем рендере
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, refetch, navigate]);

  const handleCardClick = (test: any) => {
    // Navigate to test detail page with proper route
    navigate(`/teacher/tests/${test._id}`);
  };

  const handleEdit = (testId: string) => {
    navigate(`/teacher/tests/edit/${testId}`);
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Testni o\'chirmoqchimisiz?')) return;
    
    try {
      await deleteTestMutation.mutateAsync(testId);
      success('Test o\'chirildi!');
    } catch (err: any) {
      console.error('❌ Error deleting test:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const filteredTests = tests.filter(test =>
    test.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in pb-24">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl mb-3"></div>
          <div className="h-5 w-72 bg-slate-200 rounded-xl"></div>
        </div>
        
        {/* Tests Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <SkeletonCard variant="test" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in pb-24 sm:pb-24">
      {/* Header */}
      <PageNavbar
        title="Testlar"
        description="Testlarni yaratish va boshqarish"
        badge={`${filteredTests.length} ta`}
        showSearch={tests.length > 0}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Test nomi bo'yicha qidirish..."
        showAddButton={true}
        addButtonText="Test yaratish"
        onAddClick={() => navigate('/teacher/tests/create')}
        extraActions={
          <Button 
            variant="outline"
            onClick={() => navigate('/teacher/tests/import')}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Yuklash</span>
          </Button>
        }
        gradient={true}
      />

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card className="border-2 border-slate-200/50">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery ? 'Testlar topilmadi' : 'Testlar yo\'q'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Qidiruv bo\'yicha hech narsa topilmadi. Boshqa so\'z bilan qidiring.'
                : 'Birinchi testni yaratish uchun yuqoridagi tugmani bosing'
              }
            </p>
            {!searchQuery && (
              <Button size="lg" onClick={() => navigate('/teacher/tests/create')} className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Plus className="w-5 h-5 mr-2" />
                Test yaratish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredTests.map((test, index) => (
            <div
              key={test._id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="group animate-slide-in"
            >
              <Card 
                className="h-full border-2 border-slate-200/50 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(test)}
              >
                <CardContent className="p-4 sm:p-5 lg:p-6 relative">
                  {/* Icon & Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(test._id);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(test._id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Test Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {test.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(test.createdAt).toLocaleDateString('uz-UZ')}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end text-slate-600 pt-4 border-t border-slate-200">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
