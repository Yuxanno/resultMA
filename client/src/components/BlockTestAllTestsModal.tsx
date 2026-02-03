import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import MathText from '@/components/MathText';
import api from '@/lib/api';

interface BlockTestAllTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTest: any;
  students: any[];
}

export default function BlockTestAllTestsModal({
  isOpen,
  onClose,
  blockTest,
  students
}: BlockTestAllTestsModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentTests, setStudentTests] = useState<any[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTests();
    }
  }, [isOpen]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const tests: any[] = [];

      for (const student of students) {
        try {
          const { data: config } = await api.get(`/student-test-configs/${student._id}`);
          
          const questions: any[] = [];
          let questionNumber = 1;

          for (const subjectConfig of config.subjects) {
            const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
            const subjectTest = blockTest.subjectTests.find(
              (st: any) => (st.subjectId._id || st.subjectId) === subjectId
            );

            if (subjectTest && subjectTest.questions) {
              const subjectQuestions = subjectTest.questions
                .slice(0, subjectConfig.questionCount)
                .map((q: any) => ({
                  ...q,
                  number: questionNumber++,
                  subjectName: subjectConfig.subjectId.nameUzb
                }));
              
              questions.push(...subjectQuestions);
            }
          }

          tests.push({
            student,
            questions
          });
        } catch (err) {
          console.error(`Error loading test for ${student._id}:`, err);
        }
      }

      setStudentTests(tests);
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = studentTests.filter(item =>
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-6xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Barcha testlar</h2>
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
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {filteredTests.map((item) => (
              <div key={item.student._id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedStudent(
                    expandedStudent === item.student._id ? null : item.student._id
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{item.student.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      {item.student.directionId?.nameUzb} | {item.questions.length} ta savol
                    </p>
                  </div>
                  {expandedStudent === item.student._id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedStudent === item.student._id && (
                  <div className="p-4 border-t space-y-4">
                    {item.questions.map((q: any) => (
                      <div key={q.number} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-lg min-w-[40px]">{q.number}.</span>
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {q.subjectName}
                              </span>
                            </div>
                            <div className="text-base mb-3">
                              <MathText text={q.question} />
                            </div>
                            <div className="space-y-2 ml-4">
                              {q.options?.map((option: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className={`font-medium min-w-[30px] ${
                                    String.fromCharCode(65 + idx) === q.correctAnswer
                                      ? 'text-green-600'
                                      : ''
                                  }`}>
                                    {String.fromCharCode(65 + idx)})
                                  </span>
                                  <div className="flex-1">
                                    <MathText text={option} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
