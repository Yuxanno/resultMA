import { useEffect, useRef, memo } from 'react';
import QRCode from 'qrcode';

interface AnswerSheetProps {
  student: {
    fullName: string;
    variantCode: string;
  };
  test: {
    name: string;
    subjectName: string;
    classNumber: number;
    groupLetter: string;
    groupName?: string; // Добавляем название группы
  };
  questions: number;
  qrData: string;
  columns?: number; // 2 или 3 столбца
  compact?: boolean; // Компактный режим для печати нескольких листов на странице
  sheetsPerPage?: number; // Количество листов на странице (1, 2 или 4)
}

function AnswerSheet({ student, test, questions, qrData, columns, compact = false, sheetsPerPage = 1 }: AnswerSheetProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current && qrData) {
      QRCode.toCanvas(qrRef.current, qrData, {
        width: 120,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch((err) => {
        console.error('QR code generation error:', err);
      });
    }
  }, [qrData]);

  // Header and spacing
  const headerMarginBottom = 1; // mm - уменьшаем отступ
  
  // Grid parameters - всегда 45 вопросов, 2 колонки
  const totalRows = 23; // 23 строки
  const leftColumnQuestions = 23; // 1-23
  const rightColumnQuestions = 22; // 24-45
  
  const renderQuestionRow = (questionNumber: number) => {
    return (
      <div className="flex items-center" style={{ height: '100%' }}>
        <span className="w-6 font-bold text-gray-900 text-right text-[11px] mr-2">{questionNumber}.</span>
        <div className="flex gap-2">
          {['A', 'B', 'C', 'D'].map((letter) => (
            <div key={letter}>
              <div 
                className="rounded-full" 
                style={{ 
                  width: '5mm',
                  height: '5mm',
                  border: '2px solid #000000', 
                  backgroundColor: '#ffffff' 
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="bg-white mx-auto relative print:m-0 flex flex-col" 
      style={{ 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor: '#ffffff', 
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header - Fixed height */}
      {/* Header - Auto height */}
      <div 
        className="border-[3px] border-gray-900 flex-shrink-0 p-1"
        style={{ 
          marginBottom: `${headerMarginBottom}mm`
        }}
      >
        <div className="flex justify-between items-start gap-1 h-full">
          <div className="flex-shrink-0">
            <h1 className="font-bold mb-0.5 leading-tight text-gray-900 text-sm">JAVOB VARAQASI</h1>
            <div className="flex flex-col gap-0 leading-tight text-[9px]">
              <div className="flex items-center">
                <span className="font-semibold">O'quvchi:</span>
                <span className="ml-1">{student.fullName}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">Fan:</span>
                <span className="ml-1">{test.subjectName}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">Variant:</span>
                <span className="ml-1 font-bold text-blue-600">{student.variantCode}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">Sinf:</span>
                <span className="ml-1">{test.classNumber}-{test.groupLetter}</span>
              </div>
            </div>
          </div>
          {qrData && (
            <div className="flex flex-col items-center gap-0.5 p-0.5 bg-white flex-shrink-0">
              <canvas ref={qrRef} className="block"></canvas>
              <p className="text-gray-900 font-mono font-bold leading-none text-[7px]">{student.variantCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Answer Grid - Fills remaining space */}
      <div 
        className="border-[3px] border-gray-900 flex flex-col flex-grow"
        style={{ 
          padding: '0'
        }}
      >
        {/* Title */}
        <h2 className="font-bold text-center text-gray-900 border-b-2 border-gray-400 leading-tight flex-shrink-0 text-xs py-0.5">
          JAVOBLAR (45 ta savol)
        </h2>
        
        {/* Grid with 2 columns and 23 rows - COMPACT */}
        <div 
          className="flex-grow flex"
          style={{ gap: 0 }}
        >
          {/* Left Column: Questions 1-23 */}
          <div 
            className="flex-1 flex flex-col"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${totalRows}, 1fr)`,
              gap: '1mm'
            }}
          >
            {Array.from({ length: leftColumnQuestions }, (_, i) => {
              const questionNumber = i + 1;
              return (
                <div key={`left-${questionNumber}`}>
                  {renderQuestionRow(questionNumber)}
                </div>
              );
            })}
          </div>
          
          {/* Right Column: Questions 24-45 */}
          <div 
            className="flex-1 flex flex-col"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${totalRows}, 1fr)`,
              gap: '0.5mm'
            }}
          >
            {Array.from({ length: rightColumnQuestions }, (_, i) => {
              const questionNumber = i + 24;
              return (
                <div key={`right-${questionNumber}`}>
                  {renderQuestionRow(questionNumber)}
                </div>
              );
            })}
            {/* Empty space for row 23 */}
            <div key="placeholder" style={{ visibility: 'hidden' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AnswerSheet, (prevProps, nextProps) => {
  return (
    prevProps.student.fullName === nextProps.student.fullName &&
    prevProps.student.variantCode === nextProps.student.variantCode &&
    prevProps.questions === nextProps.questions &&
    prevProps.qrData === nextProps.qrData &&
    prevProps.columns === nextProps.columns &&
    prevProps.sheetsPerPage === nextProps.sheetsPerPage &&
    prevProps.compact === nextProps.compact
  );
});
