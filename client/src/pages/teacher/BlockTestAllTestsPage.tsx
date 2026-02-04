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
  
  // Пагинация для больших списков
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const studentsPerPage = 50; // Показываем по 50 студентов на странице

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Загружаем блок-тест
      const { data: testData } = await api.get(`/block-tests/${id}`);
      
      // 2. Загружаем все блок-тесты с таким же классом и датой
      const { data: allTests } = await api.get('/block-tests');
      const testDate = new Date(testData.date).toISOString().split('T')[0];
      
      const sameGroupTests = allTests.filter((t: any) => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        return t.classNumber === testData.classNumber && tDate === testDate;
      });
      
      // Объединяем все предметы
      const allSubjects: any[] = [];
      sameGroupTests.forEach((test: any) => {
        test.subjectTests?.forEach((st: any) => {
          if (st.subjectId) {
            allSubjects.push({ ...st, testId: test._id });
          }
        });
      });
      
      const mergedBlockTest = {
        ...testData,
        subjectTests: allSubjects,
        allTestIds: sameGroupTests.map((t: any) => t._id)
      };
      
      setBlockTest(mergedBlockTest);
      
      // 3. Загружаем студентов
      const { data: allStudents } = await api.get('/students', {
        params: { classNumber: mergedBlockTest.classNumber }
      });
      
      const selectedStudents = studentIds.length > 0
        ? allStudents.filter((s: any) => studentIds.includes(s._id))
        : allStudents;
      
      console.log(`📊 Loading data for ${selectedStudents.length} students`);

      // 4. ОПТИМИЗАЦИЯ: Загружаем ВСЕ конфигурации одним запросом
      const studentIdsArray = selectedStudents.map((s: any) => s._id);
      const { data: allConfigs } = await api.get('/student-test-configs/batch', {
        params: { studentIds: studentIdsArray.join(',') }
      });
      
      // Создаем Map для быстрого доступа
      const configsMap = new Map(allConfigs.map((c: any) => [c.studentId, c]));
      
      // 5. ОПТИМИЗАЦИЯ: Загружаем ВСЕ варианты одним запросом для каждого testId
      const allVariantsMap = new Map<string, any[]>();
      
      for (const testId of mergedBlockTest.allTestIds) {
        try {
          const { data: variants } = await api.get(`/student-variants/block-test/${testId}`);
          variants.forEach((v: any) => {
            const key = v.studentId._id || v.studentId;
            if (!allVariantsMap.has(key)) {
              allVariantsMap.set(key, []);
            }
            allVariantsMap.get(key)!.push(v);
          });
        } catch (err) {
          console.log(`No variants for test ${testId}`);
        }
      }
      
      console.log(`✅ Loaded configs and variants in batch`);

      // 6. Обрабатываем данные для каждого студента (БЕЗ дополнительных запросов)
      const tests: any[] = [];

      for (const student of selectedStudents) {
        try {
          const config = configsMap.get(student._id) as any;
          if (!config) {
            console.warn(`No config for student ${student._id}`);
            continue;
          }
          
          const studentVariants = allVariantsMap.get(student._id) || [];
          
          // Объединяем все перемешанные вопросы
          const allShuffledQuestions: any[] = [];
          studentVariants.forEach(v => {
            if (v.shuffledQuestions && v.shuffledQuestions.length > 0) {
              allShuffledQuestions.push(...v.shuffledQuestions);
            }
          });
          
          const variant = studentVariants[0];
          const questions: any[] = [];
          let questionNumber = 1;

          // Если есть перемешанные вопросы
          if (allShuffledQuestions.length > 0) {
            const questionsBySubject = new Map<string, any>();
            
            if (config.subjects && Array.isArray(config.subjects)) {
              for (const subjectConfig of config.subjects) {
                const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
                const subjectName = subjectConfig.subjectId.nameUzb;
                const subjectTest = mergedBlockTest.subjectTests.find(
                  (st: any) => (st.subjectId._id || st.subjectId) === subjectId
                );
                
                if (subjectTest) {
                  questionsBySubject.set(subjectId, {
                    name: subjectName,
                    count: subjectConfig.questionCount,
                    questions: []
                  });
                }
              }
            }
            
            let currentSubjectIndex = 0;
            const subjectIds = Array.from(questionsBySubject.keys());
            let questionsAddedToCurrentSubject = 0;
            
            allShuffledQuestions.forEach((q: any) => {
              const currentSubjectId = subjectIds[currentSubjectIndex];
              const subjectData = questionsBySubject.get(currentSubjectId);
              
              if (subjectData && questionsAddedToCurrentSubject < subjectData.count) {
                questions.push({
                  number: questionNumber++,
                  subjectName: subjectData.name,
                  question: q.text || q.question || '',
                  options: q.variants?.map((v: any) => v.text) || q.options || [],
                  correctAnswer: q.correctAnswer || '',
                  points: q.points || 1,
                  image: q.image
                });
                
                questionsAddedToCurrentSubject++;
                
                if (questionsAddedToCurrentSubject >= subjectData.count) {
                  currentSubjectIndex++;
                  questionsAddedToCurrentSubject = 0;
                }
              }
            });
          } else {
            // Fallback: оригинальные вопросы
            if (config.subjects && Array.isArray(config.subjects)) {
              for (const subjectConfig of config.subjects) {
                const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
                const subjectName = subjectConfig.subjectId.nameUzb;
                const subjectTest = mergedBlockTest.subjectTests.find(
                  (st: any) => (st.subjectId._id || st.subjectId) === subjectId
                );

                if (subjectTest && subjectTest.questions) {
                  const subjectQuestions = subjectTest.questions
                    .slice(0, subjectConfig.questionCount)
                    .map((q: any) => ({
                      number: questionNumber++,
                      subjectName: subjectName,
                      question: q.text || q.question || '',
                      options: q.variants?.map((v: any) => v.text) || q.options || [],
                      correctAnswer: q.correctAnswer || '',
                      points: q.points || 1,
                      image: q.image
                    }));
                  
                  questions.push(...subjectQuestions);
                }
              }
            }
          }
          
          tests.push({
            student,
            questions,
            variantCode: variant?.variantCode || `${student._id.slice(-8)}`.toUpperCase(),
            isShuffled: allShuffledQuestions.length > 0
          });
        } catch (err) {
          console.error(`❌ Error processing student ${student._id}:`, err);
        }
      }

      console.log(`✅ Processed ${tests.length} students`);
      setStudentTests(tests);
    } catch (err: any) {
      console.error('Error loading data:', err);
      alert('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Предупреждение если слишком много студентов
    if (filteredTests.length > 100) {
      const confirm = window.confirm(
        `Siz ${filteredTests.length} ta o'quvchini chop etmoqchisiz. Bu ko'p vaqt olishi mumkin. Davom etasizmi?`
      );
      if (!confirm) return;
    }
    
    setIsPrinting(true);
    
    // Для больших списков даём больше времени на рендеринг
    const delay = filteredTests.length > 100 ? 500 : 100;
    
    setTimeout(() => {
      window.print();
      // Небольшая задержка перед сбросом состояния
      setTimeout(() => {
        setIsPrinting(false);
      }, 100);
    }, delay);
  };

  const filteredTests = studentTests.filter(item =>
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Пагинация - при печати показываем всех
  const totalPages = Math.ceil(filteredTests.length / studentsPerPage);
  const startIndex = isPrinting ? 0 : (currentPage - 1) * studentsPerPage;
  const endIndex = isPrinting ? filteredTests.length : startIndex + studentsPerPage;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

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
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Tozalash"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <Button onClick={handlePrint} size="lg" disabled={isPrinting}>
            <Printer className="w-5 h-5 mr-2" />
            {isPrinting ? 'Tayyorlanmoqda...' : 'Chop etish'}
          </Button>
        </div>
        
        {/* Информация о печати */}
        {searchQuery && filteredTests.length < studentTests.length && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              💡 Chop etishda faqat topilgan {filteredTests.length} ta o'quvchi chop etiladi.
              Barcha {studentTests.length} ta o'quvchini chop etish uchun qidiruvni tozalang.
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Savollar bilan testlar</h1>
        
        {/* Индикатор подготовки к печати */}
        {isPrinting && (
          <div className="print:hidden mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
            <div>
              <div className="font-medium text-blue-900">Chop etish uchun tayyorlanmoqda...</div>
              <div className="text-sm text-blue-700">
                {filteredTests.length} ta o'quvchi • {filteredTests.length * 20} ta savol
              </div>
            </div>
          </div>
        )}
        
        {/* Статистика и пагинация */}
        <div className="print:hidden mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Jami: {filteredTests.length} ta o'quvchi
            {filteredTests.length !== studentTests.length && ` (${studentTests.length} dan)`}
            {isPrinting && (
              <span className="ml-2 text-blue-600 font-medium">
                • Chop etish uchun tayyorlanmoqda...
              </span>
            )}
          </div>
          
          {totalPages > 1 && !isPrinting && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ←
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                →
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {paginatedTests.map((item) => (
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
                    {item.variantCode && ` | Variant: ${item.variantCode}`}
                    {item.isShuffled && ' 🔀'}
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
                  {item.variantCode && (
                    <p className="text-center text-sm text-gray-500 mt-1">
                      Variant: {item.variantCode} {item.isShuffled && '(Перемешанный)'}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {item.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Savollar topilmadi
                    </div>
                  )}
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
                            <MathText text={q.question || 'Savol topilmadi'} />
                          </div>
                          
                          {/* Horizontal options layout */}
                          <div className="flex flex-wrap gap-4 ml-4">
                            {q.options?.map((option: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 min-w-[200px]">
                                <span className={`font-medium ${
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
                  ))}
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
