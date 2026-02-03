import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '@/lib/api';

interface GroupConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  studentConfigs: any[];
  blockTest: any;
  onSave: () => void;
}

export default function GroupConfigModal({
  isOpen,
  onClose,
  students,
  studentConfigs,
  blockTest,
  onSave
}: GroupConfigModalProps) {
  const [totalQuestions, setTotalQuestions] = useState(90);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [pointsConfig, setPointsConfig] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [previousTotalQuestions, setPreviousTotalQuestions] = useState(90);

  const getMaxQuestionsForSubject = (subjectId: string): number => {
    if (!blockTest?.subjectTests) return 999;
    
    // Находим ВСЕ тесты по этому предмету и суммируем вопросы
    const subjectTests = blockTest.subjectTests.filter(
      (st: any) => (st.subjectId?._id || st.subjectId) === subjectId
    );
    
    // Суммируем количество вопросов из всех тестов
    const totalQuestions = subjectTests.reduce((sum: number, st: any) => {
      return sum + (st.questions?.length || 0);
    }, 0);
    
    return totalQuestions;
  };

  useEffect(() => {
    if (isOpen && allSubjects.length > 0) {
      console.log('🔍 GroupConfigModal: all subjects from system:', allSubjects.length);
      
      // Берём ВСЕ предметы из системы
      const subjectsWithAvg = allSubjects.map((subject: any) => {
        const subjectId = subject._id;
        
        // Проверяем, есть ли тесты по этому предмету
        const maxForSubject = getMaxQuestionsForSubject(subjectId);
        
        // Находим всех учеников, у которых есть этот предмет
        const studentsWithSubject = studentConfigs.filter((config: any) => {
          if (!config) return false;
          return config.subjects?.some((s: any) => 
            (s.subjectId?._id || s.subjectId) === subjectId
          );
        });

        if (studentsWithSubject.length > 0) {
          // Вычисляем среднее количество вопросов
          const totalQuestions = studentsWithSubject.reduce((sum: number, config: any) => {
            const subj = config.subjects.find((s: any) => 
              (s.subjectId?._id || s.subjectId) === subjectId
            );
            return sum + (subj?.questionCount || 0);
          }, 0);
          const avgCount = Math.round(totalQuestions / studentsWithSubject.length);
          
          return {
            subjectId: subject,
            questionCount: maxForSubject > 0 ? Math.min(avgCount, maxForSubject) : 0,
            isAdditional: false
          };
        } else {
          // Если ни у кого нет этого предмета
          // Если есть тесты - ставим минимум, если нет - 0
          return {
            subjectId: subject,
            questionCount: maxForSubject > 0 ? Math.min(10, maxForSubject) : 0,
            isAdditional: false
          };
        }
      });

      console.log('🔍 Subjects with avg:', subjectsWithAvg);
      setSubjects(subjectsWithAvg);

      // Вычисляем общее количество вопросов
      const total = subjectsWithAvg.reduce((sum: number, s: any) => sum + s.questionCount, 0);
      setTotalQuestions(total);
      setPreviousTotalQuestions(total);

      // Берем конфигурацию баллов из первого ученика
      const firstConfig = studentConfigs.find((c: any) => c !== null);
      if (firstConfig) {
        const defaultPointsConfig = firstConfig.pointsConfig && firstConfig.pointsConfig.length > 0
          ? firstConfig.pointsConfig
          : [{ from: 1, to: total, points: 3.1 }];
        setPointsConfig(defaultPointsConfig);
      } else {
        setPointsConfig([{ from: 1, to: total, points: 3.1 }]);
      }
    }
  }, [isOpen, studentConfigs, blockTest]);

  useEffect(() => {
    if (isOpen) {
      loadAllSubjects();
    }
  }, [isOpen]);

  const loadAllSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setAllSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleQuestionCountChange = (index: number, value: string) => {
    const count = parseInt(value) || 0;
    const newSubjects = [...subjects];
    newSubjects[index].questionCount = count;
    setSubjects(newSubjects);
  };

  const handleAddPointsRange = () => {
    if (pointsConfig.length === 0) {
      setPointsConfig([{ from: 1, to: 90, points: 3.1 }]);
      return;
    }
    
    const lastRange = pointsConfig[pointsConfig.length - 1];
    const rangeSize = lastRange.to - lastRange.from + 1;
    const halfPoint = lastRange.from + Math.floor(rangeSize / 2);
    
    if (rangeSize < 2) {
      alert('Oxirgi diapazon juda kichik, bo\'lib bo\'lmaydi');
      return;
    }
    
    const updatedConfig = [...pointsConfig];
    updatedConfig[updatedConfig.length - 1] = {
      ...lastRange,
      to: halfPoint
    };
    
    const newRange = {
      from: halfPoint + 1,
      to: lastRange.to,
      points: 3.1
    };
    
    updatedConfig.push(newRange);
    setPointsConfig(updatedConfig);
  };

  const handleRemovePointsRange = (index: number) => {
    const newConfig = pointsConfig.filter((_, i) => i !== index);
    setPointsConfig(newConfig);
  };

  const handlePointsRangeChange = (index: number, field: string, value: any) => {
    const newConfig = [...pointsConfig];
    
    if (value === '' || value === null || value === undefined) {
      newConfig[index][field] = '';
      setPointsConfig(newConfig);
      return;
    }
    
    const numValue = field === 'points' ? parseFloat(value) : parseInt(value);
    
    if (!isNaN(numValue)) {
      newConfig[index][field] = numValue;
      setPointsConfig(newConfig);
    }
  };

  const handleTotalQuestionsChange = (value: string) => {
    if (value === '' || value === null || value === undefined) {
      setTotalQuestions('' as any);
    } else {
      const num = parseInt(value);
      if (!isNaN(num) && num > 0) {
        setTotalQuestions(num);
      }
    }
  };

  const handleTotalQuestionsBlur = () => {
    if (typeof totalQuestions !== 'number' || totalQuestions < 1) {
      setTotalQuestions(previousTotalQuestions);
    } else {
      setPreviousTotalQuestions(totalQuestions);
    }
  };

  const handlePointsRangeBlur = (index: number, field: string) => {
    const newConfig = [...pointsConfig];
    const currentValue = newConfig[index][field];
    
    if (currentValue === '' || currentValue === null || currentValue === undefined) {
      if (field === 'from') {
        newConfig[index][field] = index === 0 ? 1 : (pointsConfig[index - 1]?.to || 0) + 1;
      } else if (field === 'to') {
        newConfig[index][field] = totalQuestions;
      } else if (field === 'points') {
        newConfig[index][field] = 3.1;
      }
      setPointsConfig(newConfig);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Создаём карту групповых настроек (предмет -> количество вопросов)
      const groupSettings = new Map();
      subjects.forEach(s => {
        const subjectId = s.subjectId?._id || s.subjectId;
        groupSettings.set(subjectId, {
          questionCount: s.questionCount
        });
      });

      // Применяем ко всем ученикам
      for (const student of students) {
        const studentConfig = studentConfigs.find(c => c?.studentId === student._id);
        
        if (!studentConfig || !studentConfig.subjects) continue;

        // Обновляем только существующие предметы ученика
        const updatedSubjects = studentConfig.subjects.map((s: any) => {
          const subjectId = s.subjectId?._id || s.subjectId;
          
          // Если для этого предмета есть групповые настройки, обновляем количество вопросов
          if (groupSettings.has(subjectId)) {
            return {
              ...s,
              questionCount: groupSettings.get(subjectId).questionCount
            };
          }
          
          // Иначе оставляем как есть
          return s;
        });

        // Пересчитываем общее количество вопросов
        const newTotalQuestions = updatedSubjects.reduce((sum: number, s: any) => sum + s.questionCount, 0);

        const payload = {
          totalQuestions: newTotalQuestions,
          subjects: updatedSubjects.map((s: any) => ({
            subjectId: s.subjectId?._id || s.subjectId,
            questionCount: s.questionCount,
            isAdditional: s.isAdditional || false
          })),
          pointsConfig: pointsConfig.sort((a, b) => a.from - b.from)
        };

        await api.put(`/student-test-configs/${student._id}`, payload);
      }

      alert(`${students.length} ta o'quvchi uchun sozlamalar yangilandi`);
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving group config:', error);
      alert('Sozlamalarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const currentTotal = subjects.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  const isValid = currentTotal === totalQuestions;

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Guruh sozlamalari
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Barcha {students.length} ta o'quvchi uchun
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ⓘ Faqat mavjud fanlar uchun savollar soni yangilanadi. Fanlar qo'shilmaydi yoki o'chirilmaydi.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fanlar
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Faqat o'quvchilarda mavjud fanlar uchun savollar soni yangilanadi
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subjects.map((subject, index) => {
              const subjectId = subject.subjectId?._id || subject.subjectId;
              const subjectName = subject.subjectId?.nameUzb || 'Fan';
              
              const subjectInfo = allSubjects.find(s => s._id === subjectId);
              
              // Проверяем, является ли предмет обязательным для студентов
              // Предмет считается обязательным, если он есть у ВСЕХ студентов
              const studentsWithSubject = studentConfigs.filter((config: any) => {
                if (!config) return false;
                return config.subjects?.some((s: any) => 
                  (s.subjectId?._id || s.subjectId) === subjectId
                );
              });
              const isMandatory = studentsWithSubject.length === students.length;

              const realMaxQuestions = getMaxQuestionsForSubject(subjectId);
              
              // Если нет вопросов, показываем 0 и блокируем выбор
              const hasQuestions = realMaxQuestions > 0;
              const maxQuestions = hasQuestions ? realMaxQuestions : 0;
              
              const questionOptions = hasQuestions 
                ? Array.from({ length: maxQuestions }, (_, i) => i + 1)
                : [];

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {subjectName}
                      </span>
                      <Badge variant={isMandatory ? "warning" : "info"} size="sm">
                        {isMandatory ? "Majburiy" : "Ixtiyoriy"}
                      </Badge>
                      {hasQuestions ? (
                        <span className="text-xs text-gray-500">
                          (max: {realMaxQuestions})
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">
                          (test yo'q)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-32">
                    {hasQuestions ? (
                      <Select
                        value={subject.questionCount}
                        onChange={(e) => handleQuestionCountChange(index, e.target.value)}
                        className="w-full"
                      >
                        {questionOptions.map(num => (
                          <option key={num} value={num}>
                            {num} ta
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
                        0 ta
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Ballar sozlamasi
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPointsRange}
            >
              <Plus className="w-4 h-4 mr-1" />
              Diapazon qo'shish
            </Button>
          </div>

          <div className="space-y-3">
            {pointsConfig.map((range, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    value={range.from}
                    onChange={(e) => handlePointsRangeChange(index, 'from', e.target.value)}
                    onBlur={() => handlePointsRangeBlur(index, 'from')}
                    min={1}
                    className="w-20"
                    placeholder="Dan"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    value={range.to}
                    onChange={(e) => handlePointsRangeChange(index, 'to', e.target.value)}
                    onBlur={() => handlePointsRangeBlur(index, 'to')}
                    min={range.from}
                    className="w-20"
                    placeholder="Gacha"
                  />
                  <span className="text-gray-500 mx-2">=</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={range.points}
                    onChange={(e) => handlePointsRangeChange(index, 'points', e.target.value)}
                    onBlur={() => handlePointsRangeBlur(index, 'points')}
                    min={0}
                    className="w-24"
                    placeholder="Ball"
                  />
                  <span className="text-sm text-gray-600">ball</span>
                </div>

                {pointsConfig.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePointsRange(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Ballar sozlamasi har bir o'quvchining jami savollar soniga moslashtiriladi
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={saving}
            loading={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Saqlash (faqat savollar soni yangilanadi)
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
