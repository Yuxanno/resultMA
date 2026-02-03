import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText } from 'lucide-react';
import api from '@/lib/api';

export default function TestViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTest();
    }
  }, [id]);

  const fetchTest = async () => {
    try {
      const { data } = await api.get(`/tests/${id}`);
      setTest(data);
    } catch (error) {
      console.error('Error fetching test:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Test topilmadi</h3>
            <p className="text-gray-600">Bu test mavjud emas yoki o'chirilgan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
      </div>

      {/* Test Header */}
      <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{test.name}</h1>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <span className="text-sm font-semibold">{test.questions?.length || 0} ta savol</span>
              </div>
              {test.questions && test.questions.length > 0 && (
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <span className="text-sm font-semibold">
                    {test.questions.reduce((sum: number, q: any) => sum + (q.variants?.length || 0), 0)} ta variant
                  </span>
                </div>
              )}
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <span className="text-sm font-semibold">
                  {new Date(test.createdAt).toLocaleDateString('uz-UZ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {test.questions && test.questions.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Savollar:</h2>
          {test.questions.map((question: any, index: number) => (
            <Card key={index} className="overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
              {/* Question Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
                <p className="font-bold text-gray-900 text-xl">
                  {index + 1}. {question.text || 'Savol matni yo\'q'}
                </p>
              </div>
              
              {/* Answer Options */}
              {question.variants && question.variants.length > 0 && (
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {question.variants.map((variant: any, optIndex: number) => {
                      const isCorrect = question.correctAnswer === variant.letter;
                      return (
                        <div 
                          key={optIndex} 
                          className={`p-5 rounded-xl border-2 transition-all ${
                            isCorrect 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                              isCorrect 
                                ? 'bg-green-500 text-white shadow-lg' 
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {variant.letter}
                            </div>
                            <p className={`flex-1 text-lg ${
                              isCorrect 
                                ? 'text-green-900 font-semibold' 
                                : 'text-gray-700'
                            }`}>
                              {variant.text}
                            </p>
                            {isCorrect && (
                              <div className="flex items-center gap-2 text-green-600 font-bold">
                                <span className="text-2xl">✓</span>
                                <span className="text-base">To'g'ri javob</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Savollar topilmadi</h3>
            <p className="text-gray-600">Bu testda hali savollar yo'q</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
