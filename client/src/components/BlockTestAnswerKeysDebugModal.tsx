import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BlockTestAnswerKeysDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTestId: string;
}

export default function BlockTestAnswerKeysDebugModal({
  isOpen,
  onClose,
  blockTestId
}: BlockTestAnswerKeysDebugModalProps) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadVariants();
    }
  }, [isOpen, blockTestId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/student-variants/block-test/${blockTestId}`);
      console.log('🔍 DEBUG: Loaded variants:', data);
      setVariants(data);
      if (data.length > 0) {
        setSelectedVariant(data[0]);
      }
    } catch (err) {
      console.error('Error loading variants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-6xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>🔍 Debug: Variantlar va javoblar</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </DialogHeader>

      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Variant Selector */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Variantni tanlang:
              </label>
              <select
                value={selectedVariant?.variantCode || ''}
                onChange={(e) => {
                  const variant = variants.find(v => v.variantCode === e.target.value);
                  setSelectedVariant(variant);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {variants.map((variant) => (
                  <option key={variant._id} value={variant.variantCode}>
                    {variant.variantCode} - {variant.studentId?.fullName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Info */}
            {selectedVariant && (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">O'quvchi</p>
                      <p className="text-sm font-bold text-blue-900">
                        {selectedVariant.studentId?.fullName || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Variant kodi</p>
                      <p className="text-sm font-bold text-blue-900">
                        {selectedVariant.variantCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shuffled Questions Status */}
                <div className={`border rounded-lg p-4 ${
                  selectedVariant.shuffledQuestions && selectedVariant.shuffledQuestions.length > 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedVariant.shuffledQuestions && selectedVariant.shuffledQuestions.length > 0 ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-green-900">
                            Shuffled Questions: {selectedVariant.shuffledQuestions.length} ta
                          </p>
                          <p className="text-sm text-green-700">
                            Peremeshan voproslar mavjud
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-bold text-red-900">
                            Shuffled Questions: Yo'q
                          </p>
                          <p className="text-sm text-red-700">
                            Peremeshan voproslar topilmadi!
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Answers Grid */}
                {selectedVariant.shuffledQuestions && selectedVariant.shuffledQuestions.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-4">
                      To'g'ri javoblar ({selectedVariant.shuffledQuestions.length} ta):
                    </h3>
                    <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
                      {selectedVariant.shuffledQuestions.map((question: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <span className="font-bold text-gray-700 min-w-[30px]">
                            {index + 1}.
                          </span>
                          <span className={`font-bold text-xl ${
                            question.correctAnswer 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {question.correctAnswer || '?'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Data (for debugging) */}
                <details className="border border-gray-200 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-700 hover:bg-gray-50">
                    📋 Raw JSON Data (for debugging)
                  </summary>
                  <div className="p-4 bg-gray-900 text-green-400 rounded-b-lg overflow-auto max-h-[300px]">
                    <pre className="text-xs">
                      {JSON.stringify(selectedVariant, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {variants.length === 0 && !loading && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Variantlar topilmadi</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
