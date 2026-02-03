import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/hooks/useToast';
import { Plus, Compass, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { PageNavbar } from '@/components/ui/PageNavbar';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function DirectionsPage() {
  const [directions, setDirections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDirection, setEditingDirection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    nameUzb: '', 
    subjects: [] as any[]
  });
  const [selectedSubjects, setSelectedSubjects] = useState<{[key: string]: { type: 'single' | 'choice', selected: string[] }}>({});
  const { success, error } = useToast();

  useEffect(() => {
    console.log('=== DIRECTIONS PAGE MOUNTED ===');
    fetchDirections();
    fetchSubjects();
  }, []);

  useEffect(() => {
    console.log('=== SUBJECTS UPDATED ===');
    console.log('Subjects count:', subjects.length);
    console.log('Subjects:', subjects);
  }, [subjects]);

  useEffect(() => {
    console.log('=== SELECTED SUBJECTS UPDATED ===');
    console.log('Selected subjects:', selectedSubjects);
  }, [selectedSubjects]);

  const fetchDirections = async () => {
    try {
      const { data } = await api.get('/directions');
      setDirections(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const { data } = await api.get('/subjects');
    setSubjects(data);
  };

  const toggleSubject = (subjectId: string, isChoice: boolean = false) => {
    const newSelected = { ...selectedSubjects };
    
    if (newSelected[subjectId]) {
      delete newSelected[subjectId];
    } else {
      newSelected[subjectId] = {
        type: isChoice ? 'choice' : 'single',
        selected: [subjectId]
      };
    }
    
    setSelectedSubjects(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameUzb) {
      error('Yo\'nalish nomini kiriting');
      return;
    }

    // Преобразуем выбранные предметы в нужный формат
    const subjectsArray = Object.entries(selectedSubjects).map(([subjectId, data]) => ({
      type: data.type,
      subjectIds: [subjectId]
    }));

    setLoading(true);
    try {
      const submitData = {
        nameUzb: formData.nameUzb,
        subjects: subjectsArray
      };

      console.log('=== SUBMITTING DIRECTION ===');
      console.log('Selected subjects:', selectedSubjects);
      console.log('Subjects array:', subjectsArray);
      console.log('Submit data:', submitData);

      if (editingDirection) {
        console.log('Updating direction:', editingDirection._id);
        await api.put(`/directions/${editingDirection._id}`, submitData);
        success('Yo\'nalish muvaffaqiyatli yangilandi!');
      } else {
        console.log('Creating new direction');
        await api.post('/directions', submitData);
        success('Yo\'nalish muvaffaqiyatli qo\'shildi!');
      }
      
      setFormData({ nameUzb: '', subjects: [] });
      setSelectedSubjects({});
      setEditingDirection(null);
      setShowForm(false);
      fetchDirections();
    } catch (err: any) {
      console.error('=== ERROR SAVING DIRECTION ===');
      console.error('Error:', err);
      console.error('Error response:', err.response?.data);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (direction: any) => {
    console.log('=== EDITING DIRECTION ===');
    console.log('Direction:', direction);
    
    setEditingDirection(direction);
    setFormData({ nameUzb: direction.nameUzb, subjects: direction.subjects || [] });
    
    // Восстанавливаем выбранные предметы
    const selected: any = {};
    
    if (direction.subjects && Array.isArray(direction.subjects)) {
      direction.subjects.forEach((subj: any) => {
        console.log('Processing subject:', subj);
        
        if (subj.subjectIds && Array.isArray(subj.subjectIds)) {
          subj.subjectIds.forEach((subject: any) => {
            // Если subject это объект (populate), берем _id, иначе используем как есть
            const subjectId = typeof subject === 'object' && subject._id ? subject._id : subject;
            console.log('Subject ID:', subjectId);
            
            selected[subjectId] = {
              type: subj.type,
              selected: subj.subjectIds.map((s: any) => 
                typeof s === 'object' && s._id ? s._id : s
              )
            };
          });
        }
      });
    }
    
    console.log('Selected subjects:', selected);
    setSelectedSubjects(selected);
    setShowForm(true);
  };

  const handleDelete = async (directionId: string) => {
    if (!confirm('Yo\'nalishni o\'chirmoqchimisiz?')) return;
    
    try {
      await api.delete(`/directions/${directionId}`);
      fetchDirections();
      success('Yo\'nalish o\'chirildi!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDirection(null);
    setFormData({ nameUzb: '', subjects: [] });
    setSelectedSubjects({});
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageNavbar
          title="Yo'nalishlar"
          description="O'quv yo'nalishlarini boshqarish"
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard variant="default" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navbar */}
      <PageNavbar
        title="Yo'nalishlar"
        description="O'quv yo'nalishlarini boshqarish"
        showAddButton={true}
        addButtonText="Yo'nalish qo'shish"
        onAddClick={() => setShowForm(true)}
      />

      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            {editingDirection ? 'Yo\'nalishni tahrirlash' : 'Yangi yo\'nalish'}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <p>Selected: {Object.keys(selectedSubjects).length}</p>
              <p>Total subjects: {subjects.length}</p>
              <p>Mandatory: {subjects.filter(s => s.isMandatory).length}</p>
              <p>Optional: {subjects.filter(s => !s.isMandatory).length}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Yo'nalish nomi"
              value={formData.nameUzb}
              onChange={(e) => setFormData({ ...formData, nameUzb: e.target.value })}
              required
              placeholder="Texnika, Iqtisod, Tibbiyot..."
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fanlar</label>
              <p className="text-sm text-gray-600 mb-3">
                Bu yo'nalish uchun kerakli fanlarni tanlang
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {subjects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Fanlar yo'q
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <label 
                      key={subject._id} 
                      className={`flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer ${
                        subject.isMandatory ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <Checkbox
                        checked={!!selectedSubjects[subject._id]}
                        onChange={() => toggleSubject(subject._id)}
                      />
                      <span className="text-sm flex-1">{subject.nameUzb}</span>
                      {subject.isMandatory && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          Majburiy
                        </span>
                      )}
                      {selectedSubjects[subject._id] && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </label>
                  ))
                )}
              </div>
              
              {Object.keys(selectedSubjects).length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Tanlangan fanlar ({Object.keys(selectedSubjects).length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(selectedSubjects).map(subjectId => {
                      const subject = subjects.find(s => s._id === subjectId);
                      return subject ? (
                        <span key={subjectId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {subject.nameUzb}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Eslatma:</strong> "Majburiy" belgisi bilan ko'rsatilgan fanlar barcha yo'nalishlarda bo'ladi, lekin siz ularni bu yo'nalish uchun ham qo'shishingiz mumkin.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" loading={loading}>
                {editingDirection ? 'Yangilash' : 'Saqlash'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Bekor qilish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {directions.map((direction) => (
          <Card key={direction._id} className="hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Compass className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(direction)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(direction._id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">{direction.nameUzb}</h3>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase">Fanlar:</p>
                <div className="flex flex-wrap gap-1">
                  {direction.subjects?.length > 0 ? (
                    <>
                      {direction.subjects.map((subj: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {subj.subjectIds?.length || 0} ta
                        </span>
                      ))}
                      <span className="text-xs text-gray-500">
                        + majburiy fanlar
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Faqat majburiy fanlar</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {directions.length === 0 && !showForm && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yo'nalishlar yo'q</h3>
            <p className="text-gray-600 mb-6">Birinchi yo'nalishni qo'shish uchun yuqoridagi tugmani bosing</p>
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Yo'nalish qo'shish
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
