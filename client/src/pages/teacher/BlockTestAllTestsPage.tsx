import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import MathText from '@/components/MathText';

export default function BlockTestAllTestsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const studentIds = searchParams.get('students')?.split(',') || [];
  
  const [loading, setLoading] = useState(true);
  const [blockTest, setBlockTest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentTests, setStudentTests] = useState<any[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем блок-тест
      const { data: testData } = await api.get(`/block-tests/${id}`);
      console.log('Block test data:', testData);
      
      // Загружаем все блок-тесты с таким же классом и датой
      const { data: allTests } = await api.get('/block-tests');
      const testDate = new Date(testData.date).toISOString().split('T')[0];
      
      // Фильтруем тесты по классу и дате
      const sameGroupTests = allTests.filter((t: any) => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        return t.classNumber === testData.classNumber && tDate === testDate;
      });
      
      console.log('📊 Found tests in same group:', sameGroupTests.length);
      
      // Объединяем все предметы из всех тестов
      const allSubjects: any[] = [];
      sameGroupTests.forEach((test: any) => {
        test.subjectTests?.forEach((st: any) => {
          if (st.subjectId) {
            allSubjects.push({
              ...st,
              testId: test._id
            });
          }
        });
      });
      
      console.log('📝 Total subjects:', allSubjects.length);
      
      // Создаем объединенный блок-тест для отображения
      const mergedBlockTest = {
        ...testData,
        subjectTests: allSubjects,
        allTestIds: sameGroupTests.map((t: any) => t._id)
      };
      
      setBlockTest(mergedBlockTest);
      
      const { data: allStudents } = await api.get('/students', {
        params: { classNumber: mergedBlockTest.classNumber }
      });
      
      const selectedStudents = studentIds.length > 0
        ? allStudents.filter((s: any) => studentIds.includes(s._id))
        : allStudents;
      
      console.log('Selected students:', selectedStudents);

      const tests: any[] = [];

      for (const student of selectedStudents) {
        try {
          const { data: config } = await api.get(`/student-test-configs/${student._id}`);
          console.log(`Config for ${student.fullName}:`, config);
          
          const questions: any[] = [];
          let questionNumber = 1;

          for (const subjectConfig of config.subjects) {
            const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
            const subjectTest = mergedBlockTest.subjectTests.find(
              (st: any) => (st.subjectId._id || st.subjectId) === subjectId
            );

            console.log(`Subject ${subjectConfig.subjectId.nameUzb}:`, {
              subjectId,
              subjectTest,
              hasQuestions: !!subjectTest?.questions,
              questionsCount: subjectTest?.questions?.length
            });

            if (subjectTest && subjectTest.questions) {
              const subjectQuestions = subjectTest.questions
                .slice(0, subjectConfig.questionCount)
                .map((q: any) => {
                  console.log('Original question:', q);
                  
                  // Преобразуем формат вопроса
                  return {
                    number: questionNumber++,
                    subjectName: subjectConfig.subjectId.nameUzb,
                    question: q.text || q.question || '',
                    options: q.variants?.map((v: any) => v.text) || q.options || [],
                    correctAnswer: q.correctAnswer || '',
                    points: q.points || 1,
                    image: q.image
                  };
                });
              
              console.log(`Questions for ${subjectConfig.subjectId.nameUzb}:`, subjectQuestions);
              questions.push(...subjectQuestions);
            }
          }

          console.log(`Total questions for ${student.fullName}:`, questions);
          tests.push({
            student,
            questions
          });
        } catch (err) {
          console.error(`Error loading test for ${student._id}:`, err);
        }
      }

      console.log('All tests:', tests);
      setStudentTests(tests);
    } catch (err: any) {
      console.error('Error loading data:', err);
      alert('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTests = studentTests.filter(item =>
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
          <div className="flex-1">
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
          <Button onClick={handlePrint} size="lg">
            <Printer className="w-5 h-5 mr-2" />
            Chop etish
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Barcha testlar</h1>
        
        <div className="space-y-4">
          {filteredTests.map((item) => (
            <div key={item.student._id} className="border border-gray-200 rounded-lg page-break">
              <button
                onClick={() => setExpandedStudent(
                  expandedStudent === item.student._id ? null : item.student._id
                )}
                className="print:hidden w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
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

              <div className={`${expandedStudent === item.student._id ? 'block' : 'hidden'} print:block p-6 border-t`}>
                <div className="mb-6 print:block hidden">
                  <h3 className="text-xl font-bold text-center">{item.student.fullName}</h3>
                  <p className="text-center text-gray-600">
                    {item.student.directionId?.nameUzb} | {item.questions.length} ta savol
                  </p>
                </div>

                <div className="space-y-6">
                  {item.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Savollar topilmadi
                    </div>
                  )}
                  {item.questions.map((q: any) => {
                    console.log('Rendering question:', q);
                    return (
                    <div key={q.number} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-lg min-w-[40px]">{q.number}.</span>
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.subjectName}
                            </span>
                          </div>
                          {!q.question && (
                            <div className="text-red-500 text-sm mb-2">
                              [Savol matni yo'q - DEBUG: {JSON.stringify(Object.keys(q))}]
                            </div>
                          )}
                          <div className="text-base mb-3">
                            <MathText text={q.question || 'Savol topilmadi'} />
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
                            {(!q.options || q.options.length === 0) && (
                              <div className="text-red-500 text-sm">
                                [Javob variantlari yo'q]
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          * {
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
          }
          
          .page-break:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 1.5cm;
            padding: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
