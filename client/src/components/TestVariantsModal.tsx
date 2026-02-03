import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FileText, Eye, Shuffle, Printer, X } from 'lucide-react';

interface TestVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: any;
  onViewOriginal: () => void;
  onViewVariants: () => void;
  onPrintQuestions: () => void;
  onPrintAnswers: () => void;
  onPrintVariants: () => void;
  onPrintAll: () => void;
}

export default function TestVariantsModal({
  isOpen,
  onClose,
  test,
  onViewOriginal,
  onViewVariants,
  onPrintQuestions,
  onPrintAnswers,
  onPrintVariants,
  onPrintAll,
}: TestVariantsModalProps) {
  const variantCount = test?.subjectTests?.reduce((sum: number, st: any) => {
    return sum + (st.questions?.length || 0);
  }, 0) || 0;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          {test?.classNumber}-sinf | {test?.periodMonth && test?.periodYear 
            ? `${['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'][test.periodMonth - 1]} ${test.periodYear}`
            : 'Test'}
        </DialogTitle>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {variantCount} ta variant yaratildi
                </p>
                <p className="text-sm text-blue-700">
                  Testni ko'rish yoki chop etish uchun variantni tanlang
                </p>
              </div>
            </div>
          </div>

          {/* Original Questions */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Original savollar</h3>
                  <p className="text-sm text-gray-600">Aralashtirilmagan asl tartibda</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewOriginal}
                className="hover:bg-orange-200"
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Shuffled Variants */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Shuffle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Aralashtirilgan variantlar</h3>
                  <p className="text-sm text-gray-600">Har bir o'quvchi uchun noyob tartib</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewVariants}
                  className="hover:bg-purple-200"
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewVariants}
                  className="hover:bg-purple-200"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Print Options */}
          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3">CHOP ETISH</h3>
            <div className="space-y-2">
              {/* Print Questions */}
              <button
                onClick={onPrintQuestions}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Savollar chop etish</p>
                    <p className="text-xs text-gray-600">Har bir variant uchun savollar va javoblar</p>
                  </div>
                </div>
                <Printer className="w-5 h-5 text-blue-600" />
              </button>

              {/* Print Variants */}
              <button
                onClick={onPrintVariants}
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Shuffle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Varaqasini chop etish</p>
                    <p className="text-xs text-gray-600">O'quvchilar uchun javob varaqasi</p>
                  </div>
                </div>
                <Printer className="w-5 h-5 text-purple-600" />
              </button>

              {/* Print All */}
              <button
                onClick={onPrintAll}
                className="w-full flex items-center justify-between p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Hammasini chop etish</p>
                    <p className="text-xs opacity-90">Savollar, javoblar va varaqalar</p>
                  </div>
                </div>
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Yopish
            </Button>
            <Button
              onClick={onViewVariants}
              className="flex-1"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Qayta yaratish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
