import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import AssignmentQuestionEditor from '@/components/AssignmentQuestionEditor';
import { ArrowLeft, Save, ClipboardList, Upload } from 'lucide-react';
import api from '@/lib/api';

const assignmentTypes = [
  { value: 'yozma_ish', label: 'Yozma ish' },
  { value: 'diktant', label: 'Diktant' },
  { value: 'ogzaki', label: 'Og\'zaki' },
  { value: 'savol_javob', label: 'Savol-javob' },
  { value: 'yopiq_test', label: 'Yopiq test' }
];

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    description: '',
    type: 'yozma_ish',
    fileUrl: '',
    dueDate: '',
    questions: [] as any[]
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, fileUrl: data.url }));
      success('Fayl yuklandi!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      error('Faylni yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.groupId || !formData.title || !formData.type) {
        error('Majburiy maydonlarni to\'ldiring');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupId || !formData.title || !formData.type) {
      error('Majburiy maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    try {
      await api.post('/assignments', formData);
      success('Topshiriq muvaffaqiyatli yaratildi!');
      navigate('/teacher/assignments');
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/teacher/assignments')}
            className="shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Orqaga
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              Yangi topshiriq yaratish
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Qadam {step}/2
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Topshiriq ma'lumotlari
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Topshiriq haqida asosiy ma'lumotlarni kiriting
                    </p>
                  </div>

                  <Input
                    label="Topshiriq nomi"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Masalan: 1-nazorat ishi"
                    className="text-lg"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Guruh"
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      required
                      className="text-lg"
                    >
                      <option value="">Tanlang</option>
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.classNumber}-sinf)
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Topshiriq turi"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="text-lg"
                    >
                      {assignmentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Textarea
                    label="Tavsif (ixtiyoriy)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Topshiriq haqida qo'shimcha ma'lumot..."
                    rows={4}
                  />

                  <Input
                    label="Topshirish muddati (ixtiyoriy)"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="text-lg"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fayl yuklash (ixtiyoriy)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploading ? 'Yuklanmoqda...' : 'Fayl tanlash uchun bosing'}
                          </p>
                          {formData.fileUrl && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Fayl yuklandi
                            </p>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                      size="lg"
                      className="shadow-medium"
                    >
                      Keyingi: Savollar qo'shish
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate('/teacher/assignments')}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Savollar
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Topshiriq uchun savollar qo'shing yoki faylni yuklang
                    </p>
                  </div>

                  <AssignmentQuestionEditor
                    type={formData.type}
                    questions={formData.questions}
                    onChange={(questions) => setFormData({ ...formData, questions })}
                  />

                  <div className="flex gap-3 pt-6 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      Orqaga
                    </Button>
                    <Button 
                      type="submit" 
                      loading={loading}
                      size="lg"
                      className="shadow-medium"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Yaratish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
