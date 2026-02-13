import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import MathText from '@/components/MathText';
import { Printer, Settings } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AnswerSheet from '@/components/AnswerSheet';
import { convertTiptapJsonToText } from '@/lib/latexUtils';

export default function TestPrintPage() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [columnsCount, setColumnsCount] = useState(2);
  const [testsPerPage, setTestsPerPage] = useState(1);
  const [sheetsPerPage, setSheetsPerPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [spacing, setSpacing] = useState('normal');
  const [showSubject, setShowSubject] = useState(false);

  useEffect(() => {
    fetchTest();
    fetchVariants();
    loadSelectedStudents();
  }, [id]);

  const loadSelectedStudents = () => {
    const stored = localStorage.getItem('selectedStudents');
    if (stored) {
      setSelectedStudents(JSON.parse(stored));
    }
  };

  const fetchVariants = async () => {
    try {
      const { data } = await api.get(`/student-variants/test/${id}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      setVariants(data);
      console.log('📦 CLIENT: Loaded', data.length, 'variants');
      if (data.length > 0) {
        console.log('📦 CLIENT: Sample variant:', {
          variantCode: data[0].variantCode,
          hasShuffledQuestions: !!data[0].shuffledQuestions,
          shuffledQuestionsCount: data[0].shuffledQuestions?.length,
          firstQuestionVariants: data[0].shuffledQuestions?.[0]?.variants?.map((v: any) => 
            `${v.letter}: ${v.text?.substring(0, 20)}`
          ),
          firstQuestionCorrect: data[0].shuffledQuestions?.[0]?.correctAnswer
        });
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

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

  const handlePrint = () => {
    window.print();
  };

  const spacingClasses = {
    compact: { container: 'space-y-1', question: 'mb-1 pb-1', header: 'mb-2 pb-2', questions: 'space-y-1' },
    normal: { container: 'space-y-2', question: 'mb-2 pb-2', header: 'mb-3 pb-3', questions: 'space-y-2' },
    relaxed: { container: 'space-y-4', question: 'mb-3 pb-3', header: 'mb-4 pb-4', questions: 'space-y-3' }
  }[spacing];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Test topilmadi</p>
      </div>
    );
  }

  const renderQuestions = () => {
    if (selectedStudents.length === 0) {
      return <div className="text-center text-gray-500 py-12">O'quvchilar tanlanmagan</div>;
    }

    const pages = [];
    for (let i = 0; i < selectedStudents.length; i += testsPerPage) {
      pages.push(selectedStudents.slice(i, i + testsPerPage));
    }

    return (
      <div className="max-w-5xl mx-auto px-4 print:px-0 print:max-w-full" style={{ fontSize: `${fontSize}px` }}>
        {pages.map((studentsOnPage, pageIndex) => (
          <div key={pageIndex} className="page-break mb-8">
            <div className={`grid gap-6 ${testsPerPage === 2 ? 'grid-cols-2' : testsPerPage === 4 ? 'grid-cols-2' : ''}`}>
              {studentsOnPage.map((student) => {
                const variant = variants.find(v => v.studentId?._id === student._id);
                const variantCode = variant?.variantCode || '';
                const questionsToRender = variant?.shuffledQuestions && variant.shuffledQuestions.length > 0
                  ? variant.shuffledQuestions
                  : test.questions;

                console.log(`🎨 RENDER: Student ${student.fullName}:`, {
                  hasVariant: !!variant,
                  variantCode,
                  hasShuffledQuestions: !!variant?.shuffledQuestions,
                  questionsCount: questionsToRender?.length,
                  firstQuestionVariants: questionsToRender?.[0]?.variants?.map((v: any) => 
                    `${v.letter}: ${v.text?.substring(0, 20)}`
                  )
                });

                return (
                  <div key={student._id} className={testsPerPage > 1 ? 'border-2 border-gray-300 p-3' : ''}>
                    <div className={`flex justify-between items-start ${spacingClasses.header}`}>
                      <div className={testsPerPage > 1 ? 'text-sm' : ''}>
                        <h2 className={`font-bold ${testsPerPage > 1 ? 'text-base' : ''}`} style={{ fontSize: testsPerPage > 1 ? `${fontSize}px` : `${fontSize + 4}px` }}>
                          {student.fullName}
                        </h2>
                        <p style={{ fontSize: `${fontSize - 2}px` }}>Variant: {variantCode}</p>
                        {showSubject && (
                          <p style={{ fontSize: `${fontSize - 2}px` }}>
                            {test.subjectId?.nameUzb || test.subjectId || 'Test'} {test.classNumber || 10}{test.groupId?.nameUzb?.charAt(0) || 'A'}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <QRCodeSVG value={variantCode} size={testsPerPage > 1 ? 60 : 100} level="H" />
                      </div>
                    </div>

                    <hr className="border-t-2 border-gray-800 mb-3" />

                    <div className={columnsCount === 2 ? 'columns-2 gap-4' : ''}>
                      <div className={spacingClasses.questions}>
                        {questionsToRender?.map((question: any, index: number) => {
                          const questionText = convertTiptapJsonToText(question.text);

                          return (
                            <div key={index} className={`page-break-inside-avoid ${spacingClasses.question}`}>
                              <div className="mb-1">
                                <span className="font-bold">{index + 1}. </span>
                                <span><MathText text={questionText} /></span>
                              </div>
                              {question.imageUrl && (
                                <div className="my-2 ml-6">
                                  <img src={question.imageUrl} alt="Question" className="max-w-full h-auto" style={{ maxHeight: testsPerPage === 1 ? '200px' : '150px', objectFit: 'contain' }} />
                                </div>
                              )}
                              <div className={testsPerPage > 1 ? 'ml-3' : 'ml-6'}>
                                {question.variants?.map((qVariant: any) => {
                                  const variantText = convertTiptapJsonToText(qVariant.text);
                                  return (
                                    <span key={qVariant.letter} className="mr-3">
                                      <span className="font-semibold">{qVariant.letter}) </span>
                                      <MathText text={variantText} />
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAnswers = () => {
    if (selectedStudents.length === 0) {
      return <div className="text-center text-gray-500 py-12">O'quvchilar tanlanmagan</div>;
    }

    return (
      <div>
        {selectedStudents.map((student) => {
          const variant = variants.find(v => v.studentId?._id === student._id);
          const variantCode = variant?.variantCode || '';
          const questionsToRender = variant?.shuffledQuestions && variant.shuffledQuestions.length > 0
            ? variant.shuffledQuestions
            : test.questions;

          return (
            <div key={student._id} className="page-break mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="text-center flex-1">
                  <h1 className="text-2xl font-bold mb-2">Javoblar kaliti</h1>
                  <p className="text-lg">{student.fullName}</p>
                  <p className="text-sm">Variant: {variantCode}</p>
                </div>
                <QRCodeSVG value={variantCode} size={100} level="H" />
              </div>
              <hr className="border-t-2 border-gray-800 mb-4" />
              <div>
                {questionsToRender?.map((question: any, index: number) => (
                  <div key={index} className="mb-1">
                    <span className="font-bold">{index + 1}. </span>
                    <span className="font-bold text-blue-600">{question.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSheets = () => {
    if (selectedStudents.length === 0) {
      return <div className="text-center text-gray-500 py-12">O'quvchilar tanlanmagan</div>;
    }

    const pages = [];
    for (let i = 0; i < selectedStudents.length; i += sheetsPerPage) {
      pages.push(selectedStudents.slice(i, i + sheetsPerPage));
    }

    return (
      <div>
        {pages.map((studentsOnPage, pageIndex) => (
          <div key={pageIndex} className="page-break" style={{
            width: sheetsPerPage === 1 ? '50%' : '100%',
            margin: '0 auto',
            display: sheetsPerPage === 1 ? 'block' : 'grid',
            gridTemplateColumns: sheetsPerPage === 2 ? '1fr 1fr' : sheetsPerPage === 4 ? '1fr 1fr' : '1fr',
            gridTemplateRows: sheetsPerPage === 4 ? '1fr 1fr' : '1fr',
            gap: sheetsPerPage > 1 ? '10mm' : '0'
          }}>
            {studentsOnPage.map((student) => {
              const variant = variants.find(v => v.studentId?._id === student._id);
              const variantCode = variant?.variantCode || '';
              const questionsToRender = variant?.shuffledQuestions && variant.shuffledQuestions.length > 0
                ? variant.shuffledQuestions
                : test.questions;

              return (
                <div key={student._id}>
                  <AnswerSheet
                    student={{
                      fullName: student.fullName,
                      variantCode: variantCode
                    }}
                    test={{
                      name: test.name || 'Test',
                      subjectName: test.subjectId?.nameUzb || 'Test',
                      classNumber: test.classNumber || 10,
                      groupLetter: test.groupId?.nameUzb?.charAt(0) || 'A',
                      groupName: test.groupId?.nameUzb
                    }}
                    questions={questionsToRender?.length || 0}
                    qrData={variantCode}
                    sheetsPerPage={sheetsPerPage}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print-view-mode">
      <div className="no-print mb-6 p-4 flex gap-3 bg-white max-w-5xl mx-auto">
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4 h-4 mr-2" />
          Sozlamalar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Chop etish
        </Button>
      </div>

      {showSettings && (type === 'sheets' || type === 'questions') && (
        <div className="no-print fixed top-20 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-72">
          <h3 className="font-bold text-lg mb-4">Chop etish sozlamalari</h3>

          {type === 'questions' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Shrift o'lchami: {fontSize}px</label>
                <input type="range" min="8" max="18" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Oraliq</label>
                <select value={spacing} onChange={(e) => setSpacing(e.target.value)} className="w-full p-2 border rounded">
                  <option value="compact">Zich</option>
                  <option value="normal">O'rtacha</option>
                  <option value="relaxed">Keng</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ustunlar soni</label>
                <div className="flex gap-2">
                  <button onClick={() => setColumnsCount(1)} className={`flex-1 py-2 px-4 rounded border-2 ${columnsCount === 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}>1</button>
                  <button onClick={() => setColumnsCount(2)} className={`flex-1 py-2 px-4 rounded border-2 ${columnsCount === 2 ? 'bg-blue-500 text-white' : 'bg-white'}`}>2</button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bir sahifada testlar</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map((count) => (
                    <button key={count} onClick={() => setTestsPerPage(count)} className={`py-2 px-4 rounded border-2 ${testsPerPage === count ? 'bg-blue-500 text-white' : 'bg-white'}`}>{count}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showSubject}
                    onChange={(e) => setShowSubject(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm">Fan nomini ko'rsatish</span>
                </label>
              </div>
            </>
          )}

          {type === 'sheets' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Bir sahifada varaqlar</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 4].map((count) => (
                  <button key={count} onClick={() => setSheetsPerPage(count)} className={`py-2 px-4 rounded border-2 ${sheetsPerPage === count ? 'bg-blue-500 text-white' : 'bg-white'}`}>{count}</button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setShowSettings(false)} className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded">Yopish</button>
        </div>
      )}

      {type === 'questions' && renderQuestions()}
      {type === 'answers' && renderAnswers()}
      {type === 'sheets' && renderSheets()}

      <style>{`
        @media print {
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
          }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; page-break-inside: avoid; }
          .page-break:last-child { page-break-after: auto !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          @page { size: A4 portrait; margin: 1cm; }
          aside, nav, header, .sidebar { display: none !important; }
          
          /* Центрирование контента при печати */
          .max-w-5xl {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
        body:has(.print-view-mode) aside,
        body:has(.print-view-mode) nav,
        body:has(.print-view-mode) header,
        body:has(.print-view-mode) .sidebar { display: none !important; }
        body:has(.print-view-mode) main { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
      `}</style>
    </div>
  );
}
