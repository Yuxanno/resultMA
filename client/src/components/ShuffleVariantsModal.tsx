import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Shuffle, Search, AlertTriangle } from 'lucide-react';

interface ShuffleVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  onShuffle: (selectedStudentIds: string[]) => void;
}

export default function ShuffleVariantsModal({
  isOpen,
  onClose,
  students,
  onShuffle
}: ShuffleVariantsModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    students.map(s => s._id)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleShuffle = () => {
    if (!confirm(`${selectedStudents.length} ta o'quvchi uchun variantlarni aralashtirib berasizmi?\n\nBu amal:\n• Savollar tartibini o'zgartiradi\n• Javoblar tartibini o'zgartiradi\n• Yangi variant kodlari yaratiladi\n\nBu amalni qaytarib bo'lmaydi!`)) {
      return;
    }
    onShuffle(selectedStudents);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Variantlarni aralashtirib berish
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Tanlangan o'quvchilar uchun test savollari va javoblari aralashtiriladi
        </p>

        {/* Warning */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">Diqqat!</p>
            <p>
              Bu amal qaytarib bo'lmaydi. Variantlar aralashtirilgandan keyin eski
              variant kodlari ishlamay qoladi.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
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

        {/* Select All */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={selectedStudents.length === students.length}
              onChange={handleToggleAll}
            />
            <span className="font-medium text-gray-900">
              Barchasini tanlash ({selectedStudents.length}/{students.length})
            </span>
          </label>
        </div>

        {/* Students List */}
        <div className="max-h-96 overflow-y-auto space-y-2 mb-6">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => handleToggleStudent(student._id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {student.directionId?.nameUzb || 'Yo\'nalish ko\'rsatilmagan'}
                  </p>
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button
            onClick={handleShuffle}
            disabled={selectedStudents.length === 0}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Aralashtirib berish ({selectedStudents.length})
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
