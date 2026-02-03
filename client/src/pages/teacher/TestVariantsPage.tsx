import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import MathText from '@/components/MathText';
import { ArrowLeft, Shuffle, Plus, Users, Eye, Printer } from 'lucide-react';

export default function TestVariantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchTest();
    fetchVariants();
  }, [id]);

  useEffect(() => {
    // Автоматически создаем варианты если их нет
    if (test && variants.length === 0 && !loading && !generating) {
      handleGenerateVariants();
    }
  }, [test, variants]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tests/${id}`);
      setTest(data);
    } catch (err) {
      console.error('Error fetching test:', err);
      error('Testni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async () => {
    try {
      const { data } = await api.get(`/student-variants/test/${id}`);
      setVariants(data);
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const handleGenerateVariants = async () => {
    try {
      setGenerating(true);
      const { data } = await api.post(`/tests/${id}/generate-variants`);
      success(`${data.count} ta variant yaratildi!`);
      fetchVariants(); // Refresh variants list
    } catch (err: any) {
      console.error('Error generating variants:', err);
      error(err.response?.data?.message || 'Variantlarni yaratishda xatolik');
    } finally {
      setGenerating(false);
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-gray-600 mt-1">Aralashtirilgan variantlar</p>
          </div>
        </div>
        {variants.length > 0 && (
          <Button onClick={handleGenerateVariants} disabled={generating}>
            <Shuffle className="w-4 h-4 mr-2" />
            Qayta yaratish
          </Button>
        )}
      </div>

      {/* Loading or Generating */}
      {(generating || (variants.length === 0 && !loading)) && (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Variantlar yaratilmoqda...</p>
          </CardContent>
        </Card>
      )}

      {/* Variants List */}
      {variants.length > 0 && !generating && (
        <div className="space-y-6">
          {variants.map((variant: any, variantIndex: number) => (
            <Card key={variant._id} className="border-0 shadow-soft">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {variantIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {variant.studentId?.fullName || 'O\'quvchi'}
                      </CardTitle>
                      <p className="text-sm text-gray-600">Variant: {variant.variantCode}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedVariant(expandedVariant === variant._id ? null : variant._id)}
                  >
                    {expandedVariant === variant._id ? 'Yopish' : 'Ko\'rish'}
                    <Eye className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              
              {expandedVariant === variant._id && (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {variant.questionOrder?.map((originalIndex: number, newIndex: number) => {
                      const question = test.questions[originalIndex];
                      if (!question) return null;
                      
                      return (
                        <div key={newIndex} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                              {newIndex + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-900 font-medium mb-3">
                                <MathText text={question.text} />
                              </div>
                              
                              {question.variants && question.variants.length > 0 && (
                                <div className="space-y-2 ml-2">
                                  {question.variants.map((qVariant: any, vIndex: number) => (
                                    <div
                                      key={vIndex}
                                      className={`p-3 rounded-lg border ${
                                        qVariant.letter === question.correctAnswer
                                          ? 'bg-green-50 border-green-300'
                                          : 'bg-white border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span className="font-bold text-gray-700 min-w-[28px]">
                                          {qVariant.letter})
                                        </span>
                                        <span className={`flex-1 ${qVariant.letter === question.correctAnswer ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                          <MathText text={qVariant.text} />
                                        </span>
                                        {qVariant.letter === question.correctAnswer && (
                                          <span className="text-green-600 font-bold">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
      )}
    </div>
  );
}
