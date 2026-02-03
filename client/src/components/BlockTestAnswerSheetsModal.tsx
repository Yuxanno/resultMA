import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, X } from 'lucide-react';
import api from '@/lib/api';

interface BlockTestAnswerSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTest: any;
  students: any[];
}

export default function BlockTestAnswerSheetsModal({
  isOpen,
  onClose,
  blockTest,
  students
}: BlockTestAnswerSheetsModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSheets, setStudentSheets] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSheets();
    }
  }, [isOpen]);

  const loadSheets = async () => {
    try {
      setLoading(true);
      const sheets: any[] = [];

      for (const student of students) {
        try {
          const { data: config } = await api.get(`/student-test-configs/${student._id}`);
          
          let totalQuestions = 0;
          for (const subjectConfig of config.subjects) {
            totalQuestions += subjectConfig.questionCount;
          }

          sheets.push({
            student,
            totalQuestions
          });
        } catch (err) {
          console.error(`Error loading sheet for ${student._id}:`, err);
        }
      }

      setStudentSheets(sheets);
    } catch (err) {
      console.error('Error loading sheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSheets = studentSheets.filter(item =>
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-6xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Javob varaqlari</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-6">
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {filteredSheets.map((item) => (
              <div key={item.student._id} className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="mb-6 pb-4 border-b-2 border-gray-300">
                  <h3 className="text-xl font-bold text-center mb-2">JAVOB VARAG'I</h3>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{item.student.fullName}</p>
                    <p className="text-gray-600">
                      {blockTest.classNumber}-sinf | {item.student.directionId?.nameUzb}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Jami: {item.totalQuestions} ta savol
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: item.totalQuestions }, (_, i) => i + 1).map((num) => (
                    <div key={num} className="border border-gray-300 p-2 rounded">
                      <div className="text-center font-bold text-sm mb-2">{num}</div>
                      <div className="flex justify-center gap-1">
                        {['A', 'B', 'C', 'D'].map((letter) => (
                          <div key={letter} className="flex flex-col items-center">
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                            <span className="text-xs mt-0.5">{letter}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-end text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">O'qituvchi:</p>
                      <div className="border-b border-gray-400 w-40"></div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Sana:</p>
                      <div className="border-b border-gray-400 w-28"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Yopish</Button>
        </div>
      </div>
    </Dialog>
  );
}
