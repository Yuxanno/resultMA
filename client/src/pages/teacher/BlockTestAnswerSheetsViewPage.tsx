import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Printer } from 'lucide-react';
import AnswerSheet from '@/components/AnswerSheet';

export default function BlockTestAnswerSheetsViewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const studentIds = searchParams.get('students')?.split(',') || [];
  
  const [loading, setLoading] = useState(true);
  const [blockTest, setBlockTest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSheets, setStudentSheets] = useState<any[]>([]);

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
      
      const selectedStudents = studentIds.length > 0
        ? allStudents.filter((s: any) => studentIds.includes(s._id))
        : allStudents;
      
      // Убираем дубликаты по ID
      const uniqueStudents = Array.from(
        new Map(selectedStudents.map((s: any) => [s._id, s])).values()
      );

      // ОПТИМИЗАЦИЯ: Загружаем все конфиги и варианты одним запросом
      const studentIdsArray = uniqueStudents.map((s: any) => s._id);
      
      const [configsResponse, variantsResponse] = await Promise.all([
        Promise.all(studentIdsArray.map(sid => 
          api.get(`/student-test-configs/${sid}`).catch(() => ({ data: null }))
        )),
        api.get('/student-variants', {
          params: { testId: id }
        }).catch(() => ({ data: [] }))
      ]);

      const configs = configsResponse.map(r => r.data);
      const allVariants = variantsResponse.data;

      const sheets: any[] = [];

      for (let i = 0; i < uniqueStudents.length; i++) {
        const student = uniqueStudents[i];
        const config = configs[i];
        
        if (!config) continue;
        
        const variant = allVariants.find((v: any) => 
          v.studentId === (student as any)._id || v.studentId?._id === (student as any)._id
        );
        
        // Собираем вопросы для этого ученика
        const questions: any[] = [];
        let questionNumber = 1;

        for (const subjectConfig of config.subjects) {
          const subjectId = subjectConfig.subjectId._id || subjectConfig.subjectId;
          const subjectTest = mergedBlockTest.subjectTests.find(
            (st: any) => (st.subjectId._id || st.subjectId) === subjectId
          );

          if (subjectTest && subjectTest.questions) {
            const subjectQuestions = subjectTest.questions
              .slice(0, subjectConfig.questionCount)
              .map((q: any) => ({
                number: questionNumber++,
                subjectName: subjectConfig.subjectId.nameUzb,
                points: q.points || 1
              }));
            
            questions.push(...subjectQuestions);
          }
        }

        sheets.push({
          student,
          questions,
          variantCode: variant?.variantCode || `${(student as any)._id.slice(-8)}`.toUpperCase()
        });
      }

      setStudentSheets(sheets);
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

  const filteredSheets = useMemo(() => 
    studentSheets.filter(item =>
      item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [studentSheets, searchQuery]
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

      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-8">
          {filteredSheets.map((item) => {
            return (
              <div key={item.student._id} className="page-break">
                <AnswerSheet
                  student={{
                    fullName: item.student.fullName,
                    variantCode: item.variantCode
                  }}
                  test={{
                    name: blockTest.name || 'Blok Test',
                    subjectName: blockTest.subjectTests?.map((st: any) => st.subjectId?.nameUzb || st.subjectId).join(', ') || 'Fanlar',
                    classNumber: blockTest.classNumber,
                    groupLetter: item.student.directionId?.nameUzb?.charAt(0) || 'A'
                  }}
                  questions={item.questions.length}
                  qrData={item.variantCode}
                  columns={2}
                />
              </div>
            );
          })}
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
            margin: 0;
            padding: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        
        @media screen {
          .page-break {
            transform: translateZ(0);
            will-change: transform;
            contain: layout style paint;
          }
        }
      `}</style>
    </div>
  );
}
