import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FileText, Eye, Shuffle, Printer } from 'lucide-react';
import StudentSelectionModal from './StudentSelectionModal';

interface TestOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: any;
}

type PrintType = 'questions' | 'answers' | 'sheets' | 'all' | null;

export default function TestOptionsModal({
  isOpen,
  onClose,
  test,
}: TestOptionsModalProps) {
  const navigate = useNavigate();
  const [variantCount, setVariantCount] = useState(0);
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const [pendingPrintType, setPendingPrintType] = useState<PrintType>(null);
  
  useEffect(() => {
    if (test?._id && isOpen) {
      fetchVariantCount();
    }
  }, [test?._id, isOpen]);

  const fetchVariantCount = async () => {
    try {
      const endpoint = test?.subjectTests 
        ? `/student-variants/block-test/${test._id}`
        : `/student-variants/test/${test._id}`;
      const { data } = await api.get(endpoint);
      setVariantCount(data.length);
    } catch (error) {
      console.error('Error fetching variant count:', error);
      setVariantCount(0);
    }
  };
  
  const questionCount = test?.questions?.length || test?.subjectTests?.reduce((sum: number, st: any) => {
    return sum + (st.questions?.length || 0);
  }, 0) || 0;

  const handleViewOriginal = () => {
    onClose();
    // Перенаправляем на страницу просмотра оригинальных вопросов
    if (test?.subjectTests) {
      // Блок-тест
      navigate(`/teacher/block-tests/${test._id}/view`);
    } else {
      // Обычный тест
      navigate(`/teacher/tests/${test._id}/view`);
    }
  };

  const handleViewVariants = () => {
    onClose();
    // Перенаправляем на страницу просмотра вариантов
    if (test?.subjectTests) {
      navigate(`/teacher/block-tests/${test._id}/variants`);
    } else {
      navigate(`/teacher/tests/${test._id}/variants`);
    }
  };

  const handleRegenerateVariants = () => {
    onClose();
    // Перенаправляем на страницу создания новых вариантов
    if (test?.subjectTests) {
      navigate(`/teacher/block-tests/${test._id}/variants`);
    } else {
      navigate(`/teacher/tests/${test._id}/variants`);
    }
  };

  const handlePrintQuestions = () => {
    setPendingPrintType('questions');
    setShowStudentSelection(true);
  };

  const handlePrintAnswers = () => {
    setPendingPrintType('answers');
    setShowStudentSelection(true);
  };

  const handlePrintSheets = () => {
    setPendingPrintType('sheets');
    setShowStudentSelection(true);
  };

  const handlePrintAll = () => {
    setPendingPrintType('all');
    setShowStudentSelection(true);
  };

  const handleStudentSelectionConfirm = (selectedStudents: any[]) => {
    if (!pendingPrintType) return;
    
    // Сохраняем выбранных учеников в localStorage для использования на странице печати
    localStorage.setItem('selectedStudents', JSON.stringify(selectedStudents));
    
    // Открываем страницу печати в том же окне
    if (test?.subjectTests) {
      navigate(`/teacher/block-tests/${test._id}/print/${pendingPrintType}`);
    } else {
      navigate(`/teacher/tests/${test._id}/print/${pendingPrintType}`);
    }
    
    setPendingPrintType(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <span className="text-base sm:text-lg break-words">
              {test?.classNumber}-sinf | {test?.name || (test?.periodMonth && test?.periodYear 
                ? `${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][test.periodMonth - 1]} ${test.periodYear}`
                : 'Test')}
            </span>
          </DialogTitle>
        </DialogHeader>

      <DialogContent>
        <div className="space-y-3">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {variantCount > 0 ? `${variantCount} ta variant mavjud` : 'Variantlar yaratilmagan'}
                </p>
                <p className="text-sm text-blue-700">
                  {variantCount > 0 
                    ? 'Testni ko\'rish yoki chop etish uchun variantni tanlang'
                    : 'Variantlar yaratish uchun "Aralashtirilgan variantlar" tugmasini bosing'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Original Questions */}
          <button
            onClick={handleViewOriginal}
            className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Original savollar</h3>
                <p className="text-sm text-gray-600">Aralashtirilmagan asl tartibda</p>
              </div>
            </div>
            <Eye className="w-5 h-5 text-orange-600" />
          </button>

          {/* Shuffled Variants */}
          <button
            onClick={handleViewVariants}
            className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Aralashtirilgan variantlar</h3>
                <p className="text-sm text-gray-600">Har bir o'quvchi uchun noyob tartib</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <Shuffle className="w-5 h-5 text-purple-600" />
            </div>
          </button>

          {/* Print Options */}
          <div className="border-t pt-3 mt-3">
            <h3 className="font-bold text-gray-900 mb-3 text-xs sm:text-sm uppercase text-gray-500">CHOP ETISH</h3>
            <div className="space-y-2">
              {/* Print Questions */}
              <button
                onClick={handlePrintQuestions}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">Savollar chop etish</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Har bir variant uchun savollar va javoblar</p>
                  </div>
                </div>
                <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              </button>
              {/* Print Variants */}
              <button
                onClick={handlePrintSheets}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">Varaqasini chop etish</p>
                    <p className="text-xs text-gray-600 hidden sm:block">O'quvchilar uchun javob varaqasi</p>
                  </div>
                </div>
                <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              </button>

              {/* Print All */}
              <button
                onClick={handlePrintAll}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">Hammasini chop etish</p>
                    <p className="text-xs opacity-90 hidden sm:block">Savollar, javoblar va varaqalar</p>
                  </div>
                </div>
                <Printer className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:flex-1"
            >
              Yopish
            </Button>
            <Button
              onClick={handleRegenerateVariants}
              className="w-full sm:flex-1"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Qayta yaratish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Student Selection Modal */}
    <StudentSelectionModal
      isOpen={showStudentSelection}
      onClose={() => {
        setShowStudentSelection(false);
        setPendingPrintType(null);
      }}
      groupId={test?.groupId?._id || test?.groupId}
      onConfirm={handleStudentSelectionConfirm}
      title="Savollar chop etish"
    />
  </>
  );
}
