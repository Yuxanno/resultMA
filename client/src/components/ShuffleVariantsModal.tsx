import { useState } from 'react';
import { X, Shuffle, Download, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import api from '@/lib/api';

interface ShuffleVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
}

export default function ShuffleVariantsModal({ isOpen, onClose, testId }: ShuffleVariantsModalProps) {
  const [variantsCount, setVariantsCount] = useState<number>(4);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    setIsCreating(true);
    setError('');

    try {
      const { data } = await api.post(`/tests/${testId}/shuffle`, {
        variantsCount,
        shuffleQuestions,
        shuffleAnswers,
      });

      setDownloadUrl(data.downloadUrl);
      setIsComplete(true);
    } catch (err: any) {
      console.error('❌ Error creating variants:', err);
      setError(err.response?.data?.message || 'Variantlar yaratishda xatolik');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleClose = () => {
    setVariantsCount(4);
    setShuffleQuestions(true);
    setShuffleAnswers(true);
    setIsComplete(false);
    setDownloadUrl('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shuffle className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Variantlarni aralashtirish</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isComplete ? (
            <>
              {/* Variants Count */}
              <Input
                label="Variantlar soni"
                type="number"
                min={1}
                max={26}
                value={variantsCount}
                onChange={(e) => setVariantsCount(parseInt(e.target.value) || 1)}
                helperText="1 dan 26 gacha variant yaratish mumkin"
              />

              {/* Shuffle Options */}
              <div className="space-y-3">
                <Checkbox
                  label="Savollarni aralashtirish"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />

                <Checkbox
                  label="Javoblarni aralashtirish"
                  checked={shuffleAnswers}
                  onChange={(e) => setShuffleAnswers(e.target.checked)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  loading={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Yaratilmoqda...' : 'Yaratish'}
                </Button>
                <Button variant="outline" onClick={handleClose} disabled={isCreating}>
                  Bekor qilish
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Variantlar muvaffaqiyatli yaratildi!
                </h3>
                <p className="text-gray-600 text-sm">
                  {variantsCount} ta variant tayyor
                </p>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                variant="success"
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                ZIP faylni yuklab olish
              </Button>

              <Button variant="outline" onClick={handleClose} className="w-full">
                Yopish
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
