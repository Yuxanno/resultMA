import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Upload, X, CheckCircle, AlertCircle, Loader2, ArrowLeft, Trash2, ImagePlus } from 'lucide-react';
import api from '@/lib/api';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { convertLatexToTiptapJson } from '@/lib/latexUtils';

interface ParsedQuestion {
  text: string;
  variants: { letter: string; text: string }[];
  correctAnswer: string;
  points: number;
  image?: string;
}

export default function ImportBlockTestPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  
  // Данные для сохранения
  const [classNumber, setClassNumber] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Период (месяц и год)
  const [periodMonth, setPeriodMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [periodYear, setPeriodYear] = useState(new Date().getFullYear());

  // Загрузка предметов
  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      console.log('🔍 Loading subjects from /api/subjects...');
      const { data } = await api.get('/subjects');
      console.log('✅ Loaded subjects:', data);
      console.log('📊 Number of subjects:', data.length);
      setSubjects(data);
    } catch (err: any) {
      console.error('❌ Error loading subjects:', err);
      console.error('Response:', err.response?.data);
      setError('Fanlarni yuklashda xatolik');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      const format = ['jpg', 'jpeg', 'png'].includes(ext || '') ? 'image' : 'word';
      formData.append('format', format);

      console.log('🤖 AI Parsing Started');

      const { data } = await api.post('/tests/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Конвертируем LaTeX формулы в TipTap JSON
      const questionsWithFormulas = (data.questions || []).map((q: ParsedQuestion) => {
        const hasFormulas = q.text.includes('\\(') || q.text.includes('\\[');
        const questionJson = hasFormulas ? convertLatexToTiptapJson(q.text) : null;
        
        return {
          ...q,
          text: questionJson ? JSON.stringify(questionJson) : q.text,
          // Варианты НЕ конвертируем - оставляем как обычный текст
        };
      });

      setParsedQuestions(questionsWithFormulas);
      setStep('preview');
      
      // Загружаем предметы
      await loadSubjects();
    } catch (err: any) {
      console.error('Import error:', err);
      const errorMessage = err.response?.data?.message || 'Faylni yuklashda xatolik yuz berdi';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    // Проверка обязательных полей
    if (!classNumber) {
      setError('Iltimos, sinfni tanlang');
      return;
    }
    
    if (!selectedSubjectId) {
      setError('Iltimos, fanni tanlang');
      return;
    }
    
    if (!periodMonth || !periodYear) {
      setError('Iltimos, davrni tanlang');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // 1. Сохраняем блок-тест
      const { data: savedBlockTest } = await api.post('/block-tests/import/confirm', {
        questions: parsedQuestions,
        classNumber: parseInt(classNumber),
        subjectId: selectedSubjectId,
        periodMonth,
        periodYear,
      });
      
      console.log('✅ Block test saved:', savedBlockTest.blockTest._id);
      
      // 2. Получаем всех студентов этого класса
      const { data: students } = await api.get('/students', {
        params: { classNumber: parseInt(classNumber) }
      });
      
      console.log(`👥 Found ${students.length} students in class ${classNumber}`);
      
      if (students.length > 0) {
        // 3. Автоматически генерируем варианты для всех студентов
        const studentIds = students.map((s: any) => s._id);
        
        console.log('🔀 Generating variants for students...');
        await api.post(`/block-tests/${savedBlockTest.blockTest._id}/generate-variants`, {
          studentIds
        });
        
        console.log('✅ Variants generated successfully');
      }
      
      setStep('complete');
      setTimeout(() => {
        navigate('/teacher/block-tests');
      }, 2000);
    } catch (err: any) {
      console.error('Error in handleConfirm:', err);
      setError(err.response?.data?.message || 'Saqlashda xatolik');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...parsedQuestions];
    if (field === 'text') {
      updated[index].text = value;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value;
    } else if (field === 'points') {
      updated[index].points = parseInt(value) || 1;
    }
    setParsedQuestions(updated);
  };

  const handleVariantChange = (questionIndex: number, variantIndex: number, value: string) => {
    const updated = [...parsedQuestions];
    updated[questionIndex].variants[variantIndex].text = value;
    setParsedQuestions(updated);
  };

  const handleAddVariant = (questionIndex: number) => {
    const updated = [...parsedQuestions];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const usedLetters = updated[questionIndex].variants.map(v => v.letter);
    const nextLetter = letters.find(l => !usedLetters.includes(l));
    
    if (nextLetter) {
      updated[questionIndex].variants.push({
        letter: nextLetter,
        text: '',
      });
      setParsedQuestions(updated);
    }
  };

  const handleRemoveVariant = (questionIndex: number, variantIndex: number) => {
    const updated = [...parsedQuestions];
    if (updated[questionIndex].variants.length > 0) {
      updated[questionIndex].variants.splice(variantIndex, 1);
      setParsedQuestions(updated);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = parsedQuestions.filter((_, i) => i !== index);
    setParsedQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newQuestion: ParsedQuestion = {
      text: '',
      variants: [],
      correctAnswer: '',
      points: 1,
    };
    setParsedQuestions([...parsedQuestions, newQuestion]);
  };

  const handleImageUpload = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...parsedQuestions];
        updated[questionIndex].image = reader.result as string;
        setParsedQuestions(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (questionIndex: number) => {
    const updated = [...parsedQuestions];
    delete updated[questionIndex].image;
    setParsedQuestions(updated);
  };

  const handleBack = () => {
    if (step === 'preview') {
      setStep('upload');
      setParsedQuestions([]);
    } else {
      navigate('/teacher/block-tests');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Orqaga
              </Button>
              <div className="flex items-center gap-2">
                <Upload className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Blok test yuklash</h1>
              </div>
            </div>
            {step === 'preview' && (
              <div className="text-sm text-gray-600">
                Topilgan savollar: <span className="font-bold text-gray-900">{parsedQuestions.length} ta</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: File Upload */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Blok test yuklash</h3>
              <p className="text-gray-600">Word yoki rasm formatida test yuklang</p>
            </div>

            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium text-lg mb-2">
                  {file ? file.name : 'Faylni tanlang yoki bu yerga tashlang'}
                </p>
                <p className="text-sm text-gray-500">
                  Word (.doc, .docx) yoki Rasm (.jpg, .png)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Xatolik</p>
                  <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}

            {file && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Qayta ishlanmoqda...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Yuklash va tahlil qilish
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                  size="lg"
                >
                  Bekor qilish
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview Questions */}
        {step === 'preview' && (
          <div className="space-y-6 pb-32">
            {/* Block Test Settings Form */}
            <div className="bg-white border-2 border-blue-200 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Blok test ma'lumotlari</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sinf <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sinfni tanlang</option>
                    {[5, 6, 7, 8, 9, 10, 11].map((num) => (
                      <option key={num} value={num}>
                        {num}-sinf
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fan <span className="text-red-500">*</span>
                  </label>
                  {loadingSubjects ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Yuklanmoqda...</span>
                    </div>
                  ) : subjects.length === 0 ? (
                    <div className="px-4 py-3 border border-amber-300 rounded-lg bg-amber-50">
                      <p className="text-sm text-amber-800">
                        Fanlar topilmadi
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Fanni tanlang</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.nameUzb}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Period Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Davr (период) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={`${periodYear}-${String(periodMonth).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setPeriodYear(parseInt(year));
                      setPeriodMonth(parseInt(month));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Testlar shu davr bo'yicha guruhlashadi
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <Button onClick={handleAddQuestion} variant="outline">
                + Savol qo'shish
              </Button>
            </div>

            <div className="space-y-4">
              {parsedQuestions.map((q, idx) => (
                <div key={idx} className="bg-white border-2 border-gray-200 p-6 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-gray-700 text-lg mt-2">{idx + 1}.</span>
                    <div className="flex-1 space-y-3">
                      <div className="border rounded-lg">
                        <RichTextEditor
                          value={q.text}
                          onChange={(value) => handleQuestionChange(idx, 'text', value)}
                          placeholder="Savol matni..."
                        />
                      </div>
                      
                      {q.image ? (
                        <div className="relative inline-block">
                          <img 
                            src={q.image} 
                            alt="Question" 
                            className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            title="Rasmni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <ImagePlus className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-600">Rasm qo'shish</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Savolni o'chirish"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {q.variants.length > 0 ? (
                    <div className="space-y-3 ml-8">
                      {q.variants.map((v, vIdx) => (
                        <div key={vIdx} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(idx, 'correctAnswer', v.letter)}
                            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                              q.correctAnswer === v.letter
                                ? 'bg-green-500 border-green-600 text-white shadow-lg'
                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                            }`}
                            title={`Вариант ${v.letter} - to'g'ri javob sifatida belgilash`}
                          >
                            <span className="font-bold text-xl">{v.letter}</span>
                          </button>
                          <div className="flex-1 border rounded-lg">
                            <RichTextEditor
                              value={v.text}
                              onChange={(value) => handleVariantChange(idx, vIdx, value)}
                              placeholder="Variant matni..."
                            />
                          </div>
                          
                          <button
                            onClick={() => handleRemoveVariant(idx, vIdx)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Variantni o'chirish"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddVariant(idx)}
                        className="ml-16 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Variant qo'shish
                      </button>
                    </div>
                  ) : (
                    <div className="ml-8">
                      <p className="text-sm text-gray-500 italic">Variantsiz savol (to'ldirish uchun)</p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 ml-8 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">Ball:</label>
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => handleQuestionChange(idx, 'points', e.target.value)}
                        className="w-20 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
              <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing || parsedQuestions.length === 0}
                  className="flex-1"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Tasdiqlash va saqlash ({parsedQuestions.length} ta savol)
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleBack} disabled={isProcessing} size="lg">
                  Bekor qilish
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Muvaffaqiyatli yuklandi!</h3>
            <p className="text-gray-600 text-lg">
              {parsedQuestions.length} ta savol muvaffaqiyatli yuklandi va saqlandi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
