import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import MathText from '@/components/MathText';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';

export default function BlockTestViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
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
      console.log('Subject tests:', allSubjects);
      console.log('Number of subjects:', allSubjects.length);
      
      // Создаем объединенный блок-тест для отображения
      const mergedBlockTest = {
        ...testData,
        subjectTests: allSubjects,
        allTestIds: sameGroupTests.map((t: any) => t._id)
      };
      
      setTest(mergedBlockTest);
    } catch (error) {
      console.error('Error fetching block test:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (month: number, year: number) => {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    return `${months[month - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        </div>
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Yuklanmoqda...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        </div>
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Test topilmadi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {test.classNumber}-sinf | {formatPeriod(test.periodMonth, test.periodYear)}
            </h1>
            <p className="text-gray-600 mt-1">Original savollar</p>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Sinf</p>
                <p className="text-lg font-bold text-gray-900">{test.classNumber}-sinf</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sana</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(test.date).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fanlar</p>
                <p className="text-lg font-bold text-gray-900">{test.subjectTests?.length || 0} ta</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">O'quvchilar</p>
                <p className="text-lg font-bold text-gray-900">{test.studentConfigs?.length || 0} ta</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Tests */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-mono">
          DEBUG: {test.subjectTests?.length || 0} ta fan topildi
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {test.subjectTests?.map((st: any) => st.subjectId?.nameUzb).join(', ')}
        </p>
      </div>
      
      {test.subjectTests?.map((subjectTest: any, subjectIndex: number) => (
        <Card key={subjectIndex} className="border-0 shadow-soft">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-lg flex items-center gap-3">
              <Badge variant="purple" size="lg">
                {subjectTest.subjectId?.nameUzb || 'Fan'}
              </Badge>
              <span className="text-gray-600 text-sm font-normal">
                {subjectTest.questions?.length || 0} ta savol
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {subjectTest.questions?.map((question: any, qIndex: number) => (
                <div key={qIndex} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {qIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 mb-3">
                        <MathText text={question.text} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {question.options?.map((option: any, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              option.isCorrect
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              <span className={option.isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                                <MathText text={option.text} />
                              </span>
                              {option.isCorrect && (
                                <Badge variant="success" size="sm" className="ml-auto">
                                  To'g'ri
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
