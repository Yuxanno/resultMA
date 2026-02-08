import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Printer, Settings } from 'lucide-react';
import AnswerSheet from '@/components/AnswerSheet';

interface StudentVariant {
  student: any;
  config: any;
  variantCode: string;
  qrPayload: string;
  questions: any[];
}

export default function BlockTestPrintAnswersPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const studentIds = searchParams.get('students')?.split(',') || [];
  
  const [loading, setLoading] = useState(true);
  const [blockTest, setBlockTest] = useState<any>(null);
  const [studentVariants, setStudentVariants] = useState<StudentVariant[]>([]);
  const [columnsCount, setColumnsCount] = useState(2);
  const [sheetsPerPage, setSheetsPerPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем блок-тест
      const { data: testData } = await api.get(`/block-tests/${id}`);
      
      // Загружаем все блок-тесты с таким же классом и датой (с полными данными!)
      const { data: allTests } = await api.get('/block-tests', {
        params: { fields: 'full' }
      });
      const testDate = new Date(testData.date).toISOString().split('T')[0];
      
      // Фильтруем тесты по классу и дате
      const sameGroupTests = allTests.filter((t: any) => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        return t.classNumber === testData.classNumber && tDate === testDate;
      });
      
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
      
      const selectedStudents = allStudents.filter((s: any) => 
        studentIds.includes(s._id)
      );
      
      // Убираем дубликаты
      const uniqueStudents = Array.from(
        new Map(selectedStudents.map((s: any) => [s._id, s])).values()
      );
      
      const variants: StudentVariant[] = [];
      
      // Get all variants for this block test
      let allVariants = [];
      try {
        const { data: variantsData } = await api.get(`/student-variants/block-test/${id}`);
        allVariants = variantsData;
      } catch (err) {
        console.error('Error loading variants:', err);
      }
      
      // ОПТИМИЗАЦИЯ: Загружаем все конфиги параллельно
      const configsPromises = uniqueStudents.map((student: any) => 
        api.get(`/student-test-configs/${student._id}`).catch(() => ({ data: null }))
      );
      
      const configsResponses = await Promise.all(configsPromises);
      
      for (let i = 0; i < uniqueStudents.length; i++) {
        const student = uniqueStudents[i];
        const configResponse = configsResponses[i];
        
        if (!configResponse.data) continue;
        
        try {
          const config = configResponse.data;
          
          // Find variant for this student
          const studentVariant = allVariants.find((v: any) => 
            v.studentId._id === (student as any)._id || v.studentId === (student as any)._id
          );
          
          let totalQuestions = 0;
          for (const subjectConfig of config.subjects) {
            totalQuestions += subjectConfig.questionCount;
          }
          
          variants.push({
            student,
            config,
            variantCode: studentVariant?.variantCode || 'N/A',
            qrPayload: studentVariant?.qrPayload || `${(student as any)._id}-${id}`,
            questions: Array.from({ length: totalQuestions }, (_, i) => ({ number: i + 1 }))
          });
        } catch (err) {
          console.error(`Error loading config for student ${(student as any)._id}:`, err);
        }
      }
      
      setStudentVariants(variants);
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print-view-mode" style={{ backgroundColor: '#ffffff' }}>
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-5 h-5 mr-2" />
          Sozlamalar
        </Button>
        <Button onClick={handlePrint} size="lg">
          <Printer className="w-5 h-5 mr-2" />
          Chop etish
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="print:hidden fixed top-20 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-72">
          <h3 className="font-bold text-lg mb-4">Chop etish sozlamalari</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">
              Sahifada varaqlar soni
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sheetsPerPage"
                  value="1"
                  checked={sheetsPerPage === 1}
                  onChange={() => setSheetsPerPage(1)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-medium">1 varaq</span>
                  <span className="block text-xs text-gray-500">Katta o'lcham, to'liq sahifa</span>
                </span>
              </label>
              
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sheetsPerPage"
                  value="2"
                  checked={sheetsPerPage === 2}
                  onChange={() => setSheetsPerPage(2)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-medium">2 varaq</span>
                  <span className="block text-xs text-gray-500">O'rtacha o'lcham, vertikal</span>
                </span>
              </label>
              
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sheetsPerPage"
                  value="4"
                  checked={sheetsPerPage === 4}
                  onChange={() => setSheetsPerPage(4)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-medium">4 varaq</span>
                  <span className="block text-xs text-gray-500">Kichik o'lcham, 2x2 grid</span>
                </span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">
              Ustunlar soni
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="columnsCount"
                  value="2"
                  checked={columnsCount === 2}
                  onChange={() => setColumnsCount(2)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-medium">2 ustun</span>
                  <span className="block text-xs text-gray-500">60 tagacha savol uchun qulay</span>
                </span>
              </label>
              
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="columnsCount"
                  value="3"
                  checked={columnsCount === 3}
                  onChange={() => setColumnsCount(3)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-medium">3 ustun</span>
                  <span className="block text-xs text-gray-500">60 dan ortiq savol uchun qulay</span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded font-medium"
          >
            Yopish
          </button>
        </div>
      )}

      <div>
        {(() => {
          // Группируем варианты по страницам
          const pages = [];
          for (let i = 0; i < studentVariants.length; i += sheetsPerPage) {
            pages.push(studentVariants.slice(i, i + sheetsPerPage));
          }
          
          return pages.map((variantsOnPage, pageIndex) => (
            <div key={pageIndex} className="page-break" style={{ 
              width: '210mm', 
              height: '297mm',
              margin: '0 auto',
              position: 'relative',
              padding: sheetsPerPage === 1 ? '5mm' : sheetsPerPage === 2 ? '2mm 5mm' : '2mm',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div className={`${
                sheetsPerPage === 2 ? 'flex flex-col' : 
                sheetsPerPage === 4 ? 'grid grid-cols-2 gap-1' : 
                ''
              }`} style={{ 
                width: '100%',
                height: '100%',
                gap: sheetsPerPage === 2 ? '0' : sheetsPerPage === 4 ? '2mm' : '0'
              }}>
                {variantsOnPage.map((variant, idx) => (
                  <div 
                    key={variant.student._id}
                    style={{
                      width: '100%',
                      height: sheetsPerPage === 2 ? '50%' : sheetsPerPage === 4 ? 'calc(50% - 1mm)' : '100%',
                      overflow: 'visible',
                      position: 'relative',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center'
                    }}
                  >
                    <AnswerSheet
                      student={{
                        fullName: variant.student.fullName || `${variant.student.firstName} ${variant.student.lastName}`,
                        variantCode: variant.variantCode
                      }}
                      test={{
                        name: blockTest.name || 'Blok Test',
                        subjectName: blockTest.subjectTests?.map((st: any) => st.subjectId?.nameUzb || st.subjectId).join(', ') || 'Fanlar',
                        classNumber: blockTest.classNumber,
                        groupLetter: variant.student.directionId?.nameUzb?.charAt(0) || 'A',
                        groupName: variant.student.groupId?.name || variant.student.groupId?.nameUzb || ''
                      }}
                      questions={variant.questions.length}
                      qrData={variant.qrPayload}
                      columns={columnsCount}
                      compact={sheetsPerPage > 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
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
            background: white !important;
          }
          
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
            background: white !important;
          }
          
          .page-break:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
            padding: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          
          /* Убираем сайдбар и навигацию */
          aside, nav, header, .sidebar { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
        }
        
        /* Скрываем сайдбар в режиме просмотра */
        body:has(.print-view-mode) aside,
        body:has(.print-view-mode) nav,
        body:has(.print-view-mode) header,
        body:has(.print-view-mode) .sidebar {
          display: none !important;
        }
        body:has(.print-view-mode) main {
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
        }
        
        /* Убираем цветной фон */
        .print-view-mode {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
