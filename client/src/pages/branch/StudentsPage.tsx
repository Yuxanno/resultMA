import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Plus, Copy, GraduationCap, Edit2, Trash2, ExternalLink, ChevronRight, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { PageNavbar } from '@/components/ui/PageNavbar';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import StudentProfileModal from '@/components/StudentProfileModal';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [directions, setDirections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDirectionForTemplate, setSelectedDirectionForTemplate] = useState('');
  const [selectedDirectionForImport, setSelectedDirectionForImport] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    classNumber: 7 as number,
    phone: '',
    directionId: '',
    subjectIds: [] as string[],
    selectedSubjects: {} as Record<string, string>, // для выбора "или"
    groups: [] as { groupId: string; subjectId: string }[]
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchDirections();
    fetchSubjects();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err: any) {
      console.error('Error fetching students:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchDirections = async () => {
    try {
      const { data } = await api.get('/directions');
      setDirections(data);
    } catch (err: any) {
      console.error('Error fetching directions:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
    }
  };

  const getDirectionSubjects = () => {
    if (!formData.directionId) {
      console.log('No direction selected');
      return [];
    }
    
    const direction = directions.find(d => d._id === formData.directionId);
    console.log('Selected direction:', direction);
    
    if (!direction) {
      console.log('Direction not found');
      return [];
    }
    
    if (!direction.subjects || direction.subjects.length === 0) {
      console.log('Direction has no subjects');
      return [];
    }
    
    const result: any[] = [];
    direction.subjects?.forEach((subjectChoice: any) => {
      console.log('Processing subject choice:', subjectChoice);
      
      if (subjectChoice.type === 'single') {
        const subjectId = typeof subjectChoice.subjectIds[0] === 'object' 
          ? subjectChoice.subjectIds[0]._id 
          : subjectChoice.subjectIds[0];
        const subject = subjects.find(s => s._id === subjectId);
        if (subject) {
          result.push({ ...subject, isChoice: false, choiceGroup: null });
        }
      } else if (subjectChoice.type === 'choice') {
        const choiceSubjects = subjects.filter(s => {
          const subjectIds = subjectChoice.subjectIds.map((id: any) => 
            typeof id === 'object' ? id._id : id
          );
          return subjectIds.includes(s._id);
        });
        choiceSubjects.forEach(s => result.push({ 
          ...s, 
          isChoice: true, 
          choiceGroup: subjectChoice.subjectIds.map((id: any) => 
            typeof id === 'object' ? id._id : id
          ).join(',') 
        }));
      }
    });
    
    console.log('Direction subjects result:', result);
    return result;
  };

  const getMandatorySubjects = () => {
    const directionSubjects = getDirectionSubjects();
    const directionSubjectIds = directionSubjects.map(s => s._id);
    return subjects.filter(s => s.isMandatory && !directionSubjectIds.includes(s._id));
  };

  const getAllStudentSubjects = () => {
    const directionSubjects = getDirectionSubjects();
    const mandatory = getMandatorySubjects();
    const additional = subjects.filter(s => 
      formData.subjectIds.includes(s._id) && 
      !directionSubjects.find(ds => ds._id === s._id) &&
      !mandatory.find(m => m._id === s._id)
    );
    
    // Собираем все предметы
    const allSubjects = [...directionSubjects, ...mandatory, ...additional];
    
    // Фильтруем выбранные из "или"
    const filtered: any[] = [];
    const processedGroups = new Set();
    
    allSubjects.forEach(subject => {
      if (subject.isChoice && subject.choiceGroup) {
        if (!processedGroups.has(subject.choiceGroup)) {
          processedGroups.add(subject.choiceGroup);
          const selectedId = formData.selectedSubjects[subject.choiceGroup];
          if (selectedId) {
            const selected = allSubjects.find(s => s._id === selectedId);
            if (selected) filtered.push(selected);
          }
        }
      } else {
        filtered.push(subject);
      }
    });
    
    return filtered;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.classNumber) {
        error('F.I.Sh va sinf majburiy');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.directionId) {
        error('Yo\'nalish tanlang');
        return;
      }
      
      // Проверяем что все "или" выборы сделаны
      const directionSubjects = getDirectionSubjects();
      const choiceGroups = new Set(directionSubjects.filter(s => s.isChoice).map(s => s.choiceGroup));
      for (const group of choiceGroups) {
        if (!formData.selectedSubjects[group]) {
          error('Barcha fanlarni tanlang');
          return;
        }
      }
      
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Собираем все предметы
    const allSubjects = getAllStudentSubjects();
    const subjectIds = allSubjects.map(s => s._id);
    
    // Проверяем что для каждого предмета выбрана группа
    if (!formData.groups || formData.groups.length !== subjectIds.length) {
      error('Barcha fanlar uchun guruh tanlang');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        fullName: formData.fullName,
        classNumber: formData.classNumber,
        phone: formData.phone || undefined,
        directionId: formData.directionId,
        subjectIds,
        groups: formData.groups
      };

      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, submitData);
        fetchStudents();
        success('O\'quvchi muvaffaqiyatli yangilandi!');
      } else {
        const { data } = await api.post('/students', submitData);
        fetchStudents();
        success('O\'quvchi muvaffaqiyatli qo\'shildi!');
        
        const profileUrl = `${window.location.origin}${data.profileUrl}`;
        setTimeout(() => {
          if (confirm(`Profil havolasi: ${profileUrl}\n\nNusxalashni xohlaysizmi?`)) {
            navigator.clipboard.writeText(profileUrl);
            success('Havola nusxalandi!');
          }
        }, 500);
      }
      handleCloseForm();
    } catch (err: any) {
      console.error('Error saving student:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      classNumber: student.classNumber,
      phone: student.phone || '',
      directionId: student.directionId?._id || '',
      subjectIds: student.subjectIds?.map((s: any) => s._id) || [],
      selectedSubjects: {},
      groups: student.groups || []
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('O\'quvchini o\'chirmoqchimisiz?')) return;
    
    try {
      await api.delete(`/students/${studentId}`);
      fetchStudents();
      success('O\'quvchi o\'chirildi!');
    } catch (err: any) {
      console.error('Error deleting student:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setStep(1);
    setFormData({ 
      fullName: '', 
      classNumber: 7 as number, 
      phone: '', 
      directionId: '', 
      subjectIds: [],
      selectedSubjects: {},
      groups: []
    });
  };

  const toggleSubject = (subjectId: string) => {
    if (formData.subjectIds.includes(subjectId)) {
      setFormData({
        ...formData,
        subjectIds: formData.subjectIds.filter(id => id !== subjectId)
      });
    } else {
      setFormData({
        ...formData,
        subjectIds: [...formData.subjectIds, subjectId]
      });
    }
  };

  const handleGroupSelect = (subjectId: string, groupId: string) => {
    const newGroups = (formData.groups || []).filter(g => g.subjectId !== subjectId);
    if (groupId) {
      newGroups.push({ groupId, subjectId });
    }
    setFormData({ ...formData, groups: newGroups });
  };

  const copyProfileLink = (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
    success('Profil havolasi nusxalandi!');
  };

  const openProfile = (token: string) => {
    window.open(`/p/${token}`, '_blank');
  };

  const handleDownloadTemplate = async () => {
    if (!selectedDirectionForTemplate) {
      error('Yo\'nalish tanlang');
      return;
    }

    try {
      const response = await api.get(`/students/download-template/${selectedDirectionForTemplate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      success('Template yuklab olindi!');
      setShowTemplateModal(false);
      setSelectedDirectionForTemplate('');
    } catch (err: any) {
      console.error('Error downloading template:', err);
      error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        error('Faqat Excel fayllar (.xlsx, .xls) qabul qilinadi');
        return;
      }
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      error('Fayl tanlang');
      return;
    }

    if (!selectedDirectionForImport) {
      error('Yo\'nalish tanlang');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1];
        
        try {
          const { data } = await api.post('/students/bulk-import', {
            directionId: selectedDirectionForImport,
            fileData: base64
          });
          
          setImportResults(data);
          fetchStudents();
          
          if (data.errorCount === 0) {
            success(`${data.successCount} ta o'quvchi muvaffaqiyatli qo'shildi!`);
          } else {
            error(`${data.errorCount} ta xatolik yuz berdi`);
          }
        } catch (err: any) {
          console.error('Error importing:', err);
          error(err.response?.data?.message || 'Import xatosi');
        } finally {
          setImporting(false);
        }
      };
      
      reader.readAsDataURL(importFile);
    } catch (err: any) {
      console.error('Error reading file:', err);
      error('Faylni o\'qishda xatolik');
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setSelectedDirectionForImport('');
    setImportResults(null);
  };

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <PageNavbar
          title="O'quvchilar"
          description="O'quvchilarni boshqarish va profil havolalari"
        />
        <div className="space-y-4">
          <SkeletonCard variant="list" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">O'quvchilar</h1>
          <p className="text-gray-600 mt-1">O'quvchilarni boshqarish va profil havolalari</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Template yuklab olish
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Excel orqali import
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            O'quvchi qo'shish
          </Button>
        </div>
      </div>

      {/* Template Download Modal */}
      <Dialog open={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            Template yuklab olish
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Yo'nalishni tanlang va Excel template yuklab oling. Template yo'nalish fanlariga mos ravishda tayyorlanadi.
              </p>
            </div>

            <Select
              label="Yo'nalish"
              value={selectedDirectionForTemplate}
              onChange={(e) => setSelectedDirectionForTemplate(e.target.value)}
              required
            >
              <option value="">Tanlang</option>
              {directions.map((d) => (
                <option key={d._id} value={d._id}>{d.nameUzb}</option>
              ))}
            </Select>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDownloadTemplate}
                disabled={!selectedDirectionForTemplate}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Yuklab olish
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedDirectionForTemplate('');
                }}
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onClose={closeImportModal}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Excel orqali import
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            {!importResults ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    ⚠️ Avval template yuklab olib, to'ldiring. Keyin shu yerdan import qiling.
                  </p>
                </div>

                <Select
                  label="Yo'nalish"
                  value={selectedDirectionForImport}
                  onChange={(e) => setSelectedDirectionForImport(e.target.value)}
                  required
                >
                  <option value="">Tanlang</option>
                  {directions.map((d) => (
                    <option key={d._id} value={d._id}>{d.nameUzb}</option>
                  ))}
                </Select>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excel fayl
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  {importFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {importFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || !selectedDirectionForImport}
                    loading={importing}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import qilish
                  </Button>
                  <Button variant="outline" onClick={closeImportModal}>
                    Bekor qilish
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Import yakunlandi!</h4>
                    <div className="space-y-1 text-sm">
                      <p>✅ Muvaffaqiyatli: {importResults.successCount}</p>
                      <p>⏭️ O'tkazib yuborildi: {importResults.skippedCount}</p>
                      <p>❌ Xatolar: {importResults.errorCount}</p>
                    </div>
                  </div>

                  {importResults.results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <h4 className="font-semibold text-red-900 mb-2">Xatolar:</h4>
                      <div className="space-y-2">
                        {importResults.results.errors.map((err: any, idx: number) => (
                          <div key={idx} className="text-sm text-red-800">
                            <strong>Qator {err.row}:</strong> {err.name} - {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResults.results.skipped.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <h4 className="font-semibold text-yellow-900 mb-2">O'tkazib yuborildi:</h4>
                      <div className="space-y-2">
                        {importResults.results.skipped.map((skip: any, idx: number) => (
                          <div key={idx} className="text-sm text-yellow-800">
                            <strong>Qator {skip.row}:</strong> {skip.name} - {skip.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResults.results.success.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <h4 className="font-semibold text-blue-900 mb-2">Muvaffaqiyatli qo'shildi:</h4>
                      <div className="space-y-2">
                        {importResults.results.success.slice(0, 10).map((succ: any, idx: number) => (
                          <div key={idx} className="text-sm text-blue-800">
                            <strong>Qator {succ.row}:</strong> {succ.name}
                          </div>
                        ))}
                        {importResults.results.success.length > 10 && (
                          <p className="text-sm text-blue-600">
                            ... va yana {importResults.results.success.length - 10} ta
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={closeImportModal} className="flex-1">
                    Yopish
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            {editingStudent ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi'}
            <span className="ml-auto text-sm text-gray-500">Qadam {step}/4</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Шаг 1: Основная информация */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="F.I.Sh"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Aliyev Ali Alijon o'g'li"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sinf"
                    type="number"
                    min="1"
                    max="11"
                    value={formData.classNumber.toString()}
                    onChange={(e) => setFormData({ ...formData, classNumber: parseInt(e.target.value) || 7 })}
                    required
                  />
                  <PhoneInput
                    label="Telefon"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" onClick={handleNextStep}>
                    Keyingi <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Bekor qilish
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 2: Выбор направления и предметов */}
            {step === 2 && (
              <div className="space-y-4">
                <Select
                  label="Yo'nalish"
                  value={formData.directionId}
                  onChange={(e) => {
                    const directionId = e.target.value;
                    setFormData({ 
                      ...formData, 
                      directionId,
                      selectedSubjects: {},
                      subjectIds: []
                    });
                  }}
                  required
                >
                  <option value="">Tanlang</option>
                  {directions.map((d) => (
                    <option key={d._id} value={d._id}>{d.nameUzb}</option>
                  ))}
                </Select>

                {formData.directionId && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-blue-900 mb-2">Yo'nalish fanlari:</h4>
                      <div className="space-y-2">
                        {getDirectionSubjects().reduce((acc: any[], subject: any) => {
                          if (subject.isChoice) {
                            const group = subject.choiceGroup;
                            if (!acc.find((item: any) => item.type === 'choice' && item.group === group)) {
                              const choiceSubjects = getDirectionSubjects().filter((s: any) => s.choiceGroup === group);
                              acc.push({ type: 'choice', group, subjects: choiceSubjects });
                            }
                          } else {
                            acc.push({ type: 'single', subject });
                          }
                          return acc;
                        }, []).map((item: any, idx: number) => (
                          <div key={idx}>
                            {item.type === 'single' ? (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span>{item.subject.nameUzb}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Tanlang:</p>
                                <div className="flex flex-wrap gap-2 ml-4">
                                  {item.subjects.map((s: any) => (
                                    <label key={s._id} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={item.group}
                                        checked={formData.selectedSubjects[item.group] === s._id}
                                        onChange={() => setFormData({
                                          ...formData,
                                          selectedSubjects: { ...formData.selectedSubjects, [item.group]: s._id }
                                        })}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm">{s.nameUzb}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {getMandatorySubjects().length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-sm text-green-900 mb-2">Majburiy fanlar:</h4>
                        <div className="space-y-1">
                          {getMandatorySubjects().map((subject: any) => (
                            <div key={subject._id} className="flex items-center gap-2 text-sm">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>{subject.nameUzb}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        💡 Qo'shimcha fanlar keyingi qadamda qo'shishingiz mumkin
                      </p>
                    </div>
                  </div>
                )}

                {/* Показываем выбранные предметы при редактировании */}
                {editingStudent && formData.selectedSubjects && Object.keys(formData.selectedSubjects).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-blue-900 mb-2">Tanlangan fanlar:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(formData.selectedSubjects).map(subjectId => {
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

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Orqaga
                  </Button>
                  <Button type="button" onClick={handleNextStep}>
                    Keyingi <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 3: Дополнительные предметы */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Qo'shimcha fanlar (ixtiyoriy)
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Agar kerak bo'lsa, qo'shimcha fanlar qo'shing. Yo'q bo'lsa, "O'tkazib yuborish" tugmasini bosing.
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {subjects.filter(s => {
                      const directionSubjects = getDirectionSubjects();
                      const mandatory = getMandatorySubjects();
                      return !directionSubjects.find(ds => ds._id === s._id) && 
                             !mandatory.find(m => m._id === s._id);
                    }).map((subject: any) => (
                      <label key={subject._id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                        <Checkbox
                          checked={formData.subjectIds.includes(subject._id)}
                          onChange={() => toggleSubject(subject._id)}
                        />
                        <span className="text-sm">{subject.nameUzb}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Orqaga
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep(4)}>
                    O'tkazib yuborish
                  </Button>
                  <Button type="button" onClick={handleNextStep}>
                    Keyingi <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 4: Выбор групп */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-900">
                    <strong>Oxirgi qadam:</strong> Har bir fan uchun guruh tanlang
                  </p>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {getAllStudentSubjects().map((subject: any) => {
                    // Фильтруем группы для данного предмета и класса
                    const subjectGroups = groups.filter(g => {
                      const groupSubjectId = typeof g.subjectId === 'object' ? g.subjectId._id : g.subjectId;
                      const groupClassNumber = parseInt(g.classNumber?.toString() || '0');
                      const formClassNumber = parseInt(formData.classNumber?.toString() || '0');
                      
                      return groupSubjectId === subject._id && groupClassNumber === formClassNumber;
                    });
                    
                    const selectedGroup = formData.groups?.find(g => g.subjectId === subject._id);
                    
                    return (
                      <div key={subject._id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <label className="block">
                          <span className="font-medium text-sm text-gray-900 mb-2 block">
                            {subject.nameUzb}
                          </span>
                          {subjectGroups.length === 0 ? (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              ⚠️ Bu fan uchun {formData.classNumber}-sinf guruhi yo'q
                            </div>
                          ) : (
                            <Select
                              value={selectedGroup?.groupId || ''}
                              onChange={(e) => handleGroupSelect(subject._id, e.target.value)}
                              required
                            >
                              <option value="">Guruh tanlang</option>
                              {subjectGroups.map((g: any) => (
                                <option key={g._id} value={g._id}>
                                  {g.letter}-guruh {g.teacherId ? `(${g.teacherId.fullName})` : ''}
                                </option>
                              ))}
                            </Select>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>
                    Orqaga
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    Saqlash va tugatish
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {students.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-16">
            <EmptyState
              icon={GraduationCap}
              title="O'quvchilar yo'q"
              description="Yangi o'quvchi qo'shish uchun yuqoridagi tugmani bosing"
              action={{
                label: "O'quvchi qo'shish",
                onClick: () => setShowForm(true)
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {students.map((student) => (
            <Card 
              key={student._id} 
              className="group hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer relative"
              onClick={() => setSelectedStudentId(student._id)}
            >
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {student.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">{student.classNumber}-sinf</Badge>
                      {student.directionId && (
                        <Badge variant="purple">{student.directionId.nameUzb}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {student.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Telefon</p>
                      <p className="font-bold text-gray-900">{student.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Profil faol</span>
                  </div>
                  
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openProfile(student.profileToken)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                      title="Profilni ochish"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => copyProfileLink(student.profileToken)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors group/btn"
                      title="Havola nusxalash"
                    >
                      <Copy className="w-5 h-5 text-green-600 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleEdit(student)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDelete(student._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)} 
      />
    </div>
  );
}
