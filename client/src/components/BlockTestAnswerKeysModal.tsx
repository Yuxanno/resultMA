import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, X } from 'lucide-react';
import api from '@/lib/api';

interface BlockTestAnswerKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTest: any;
  students: any[];
}

export default function BlockTestAnswerKeysModal({
  isOpen,
  onClose,
  blockTest,
  students
}: BlockTestAnswerKeysModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentAnswers, setStudentAnswers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAnswers();
    }
  }, [isOpen]);

  const loadAnswers = async () => {
    try {
      setLoading(true);
      
      // Загружаем все варианты для этого блок-теста
      let allVariants: any[] = [];
      try {
        const { data: variantsData } = await api.get(`/student-variants/block-test/${blockTest._id}`);
        allVariants = variantsData;
        console.log('📦 Loaded variants for modal:', allVariants.length);
      } catch (err) {
        console.warn('No variants found, using original questions');
      }
      
      const answers: any[] = [];

      for (const student of students) {
        try {
          const { data: config } = await api.get(`/student-test-configs/${student._id}`);
          
          // Находим вариант для этого студента
          const studentVariant = allVariants.find((v: any) => 
            v.studentId._id === student._id || v.studentId === student._id
          );
          
          const studentQuestions: any[] = [];
          let questionNumber = 1;
          let shuffledIndex = 0; // Индекс для прохода по shuffledQuestions

          for (const subjectConfig of config.subjects) {
            const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
            const subjectTest = blockTest.subjectTests.find(
              (st: any) => (st.subjectId._id || st.subjectId) === subjectId
            );

            if (subjectTest && subjectTest.questions) {
              const questionsToUse = subjectTest.questions.slice(0, subjectConfig.questionCount);
              
              const questions = questionsToUse.map((q: any) => {
                // Используем перемешанный вариант если есть
                let questionData = q;
                
                if (studentVariant?.shuffledQuestions && studentVariant.shuffledQuestions.length > shuffledIndex) {
                  // Берем вопрос по порядку из shuffledQuestions
                  questionData = studentVariant.shuffledQuestions[shuffledIndex];
                  shuffledIndex++;
                }
                
                return {
                  number: questionNumber++,
                  question: questionData.text || questionData.question || '',
                  correctAnswer: questionData.correctAnswer || '?',
                  subjectName: subjectConfig.subjectId.nameUzb
                };
              });
              
              studentQuestions.push(...questions);
            }
          }

          answers.push({
            student,
            questions: studentQuestions,
            variantCode: studentVariant?.variantCode
          });
        } catch (err) {
          console.error(`Error loading answers for ${student._id}:`, err);
        }
      }

      setStudentAnswers(answers);
    } catch (err) {
      console.error('Error loading answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnswers = studentAnswers.filter(item =>
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-6xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">To'g'ri javoblar</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="O'quvchi ismini qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {filteredAnswers.map((item) => (
              <div key={item.student._id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4 pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.student.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        {item.student.directionId?.nameUzb} | {item.questions.length} ta savol
                      </p>
                    </div>
                    {item.variantCode && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Variant</div>
                        <div className="text-sm font-bold text-blue-600">{item.variantCode}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {item.questions.map((q: any) => (
                    <div key={q.number} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-bold text-gray-700 min-w-[30px]">{q.number}.</span>
                      <span className="font-bold text-green-600 text-lg">{q.correctAnswer}</span>
                      <span className="text-xs text-gray-500 ml-auto">{q.subjectName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Yopish</Button>
        </div>
      </div>
    </Dialog>
  );
}
