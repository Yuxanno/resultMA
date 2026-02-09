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
        width: 80,
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

  // Автоматически определяем количество колонок в зависимости от количества вопросов
  // Защита от некорректных значений
  const safeQuestions = Math.max(1, Math.min(questions || 0, 200)); // от 1 до 200
  const autoColumns = columns || (safeQuestions > 60 ? 3 : 2);
  const questionsPerColumn = Math.ceil(safeQuestions / autoColumns);

  // Определяем паддинги в зависимости от количества листов на странице
  const getPadding = () => {
    if (sheetsPerPage === 4) {
      // Для 4 листов - небольшие паддинги для нормальных отступов
      return {
        paddingTop: '3mm',
        paddingLeft: '3mm',
        paddingRight: '3mm',
        paddingBottom: '3mm'
      };
    } else if (sheetsPerPage === 2) {
      // Для 2 листов - средние паддинги
      return {
        paddingTop: '4mm',
        paddingLeft: '4mm',
        paddingRight: '4mm',
        paddingBottom: '3mm'
      };
    } else {
      // Для 1 листа - стандартные паддинги
      return {
        paddingTop: '15mm',
        paddingLeft: '15mm',
        paddingRight: '15mm',
        paddingBottom: '12mm'
      };
    }
  };

  const padding = getPadding();

  // Определяем размеры контейнера в зависимости от количества листов
  const getContainerSize = () => {
    if (sheetsPerPage === 4) {
      // Для 4 листов - занимаем 100% родителя (grid cell)
      return {
        width: '100%',
        height: '100%'
      };
    } else if (sheetsPerPage === 2) {
      // Для 2 листов - занимаем 100% родителя (grid cell)
      return {
        width: '100%',
        height: '100%'
      };
    } else {
      // Для 1 листа - полная страница
      return {
        width: '210mm',
        height: '297mm'
      };
    }
  };

  const containerSize = getContainerSize();

  // Определяем, нужен ли супер-компактный режим (для 4 листов)
  const superCompact = sheetsPerPage === 4;

  const renderAnswerBubbles = (questionNumber: number) => {
    return (
      <div className={`flex items-center ${superCompact ? 'gap-1 mb-0' : compact ? 'gap-1.5 mb-0.5' : 'gap-2 mb-1'}`} key={questionNumber}>
        <span className={`w-6 font-bold text-gray-900 text-right ${superCompact ? 'text-[7px]' : compact ? 'text-[9px]' : 'text-[11px]'}`}>{questionNumber}.</span>
        <div className={superCompact ? 'flex gap-1.5' : compact ? 'flex gap-2' : 'flex gap-2.5'}>
          {['A', 'B', 'C', 'D'].map((letter) => (
            <div key={letter} className="flex items-center">
              {/* Уменьшенные кружки для компактности */}
              <div className={superCompact ? 'w-3 h-3 rounded-full' : compact ? 'w-3.5 h-3.5 rounded-full' : 'w-4 h-4 rounded-full'} style={{ border: '2px solid #000000', backgroundColor: '#ffffff' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderColumn = (startNum: number, endNum: number) => {
    const columnQuestions = [];
    
    // Добавляем заголовок с буквами только один раз в начале колонки
    columnQuestions.push(
      <div key="header" className={`flex items-center ${superCompact ? 'gap-1 mb-0.5 pb-0' : compact ? 'gap-1.5 mb-1 pb-0.5' : 'gap-2 mb-1.5 pb-1'} border-b border-gray-300`}>
        <span className={`w-6 font-bold text-gray-900 text-right ${superCompact ? 'text-[7px]' : compact ? 'text-[9px]' : 'text-[11px]'}`}></span>
        <div className={superCompact ? 'flex gap-1.5' : compact ? 'flex gap-2' : 'flex gap-2.5'}>
          {['A', 'B', 'C', 'D'].map((letter) => (
            <div key={letter} className={`flex items-center justify-center ${superCompact ? 'w-3' : compact ? 'w-3.5' : 'w-4'}`}>
              <span className={`font-bold text-gray-700 ${superCompact ? 'text-[6px]' : compact ? 'text-[8px]' : 'text-[10px]'}`}>{letter}</span>
            </div>
          ))}
        </div>
      </div>
    );
    
    // Генерируем только реальные вопросы
    const actualEndNum = Math.min(endNum, safeQuestions);
    for (let i = startNum; i <= actualEndNum; i++) {
      columnQuestions.push(renderAnswerBubbles(i));
    }
    
    return columnQuestions;
  };

  return (
    <div 
      className="bg-white mx-auto relative print:m-0" 
      style={{ 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor: '#ffffff', 
        willChange: 'transform',
        width: containerSize.width,
        height: containerSize.height,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          ...padding
        }}
      >
        {/* Header - компактный */}
        <div className={`border-[3px] border-gray-900 ${superCompact ? 'mb-1 p-1' : compact ? 'mb-2 p-1.5' : 'mb-2 p-2'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className={`font-bold mb-1 text-gray-900 ${superCompact ? 'text-xs' : compact ? 'text-sm' : 'text-base'}`}>JAVOB VARAQASI</h1>
              <div className={`grid grid-cols-2 gap-x-2 gap-y-0 ${superCompact ? 'text-[7px]' : compact ? 'text-[9px]' : 'text-[10px]'}`}>
                <div className="flex">
                  <span className="font-semibold w-14">O'quvchi:</span>
                  <span className="flex-1 truncate">{student.fullName}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-12">Variant:</span>
                  <span className="flex-1 font-bold text-blue-600">{student.variantCode}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-14">Fan:</span>
                  <span className="flex-1 truncate">{test.subjectName}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-12">Sinf:</span>
                  <span className="flex-1">{test.classNumber}-{test.groupLetter}</span>
                </div>
                {test.groupName && (
                  <div className="flex col-span-2">
                    <span className="font-semibold w-14">Guruh:</span>
                    <span className="flex-1 truncate">{test.groupName}</span>
                  </div>
                )}
              </div>
            </div>
            {qrData && (
              <div className={`flex flex-col items-center gap-1 ml-3 p-2 bg-white ${superCompact ? 'scale-75' : ''}`}>
                <canvas ref={qrRef} className="block"></canvas>
                <p className={`text-gray-900 font-mono font-bold ${superCompact ? 'text-[6px]' : 'text-[8px]'}`}>{student.variantCode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions - компактные */}
        {/* Инструкции убраны для экономии места */}

        {/* Answer Grid - максимум места */}
        <div className={`border-[3px] border-gray-900 ${superCompact ? 'p-1' : compact ? 'p-1.5' : 'p-2'}`}>
          <h2 className={`font-bold text-center text-gray-900 border-b-2 border-gray-400 ${superCompact ? 'text-[8px] mb-0.5 pb-0' : compact ? 'text-[10px] mb-1 pb-0.5' : 'text-xs mb-1.5 pb-1'}`}>
            JAVOBLAR ({safeQuestions} ta savol)
          </h2>
          
          <div className={`grid ${superCompact ? 'gap-1' : compact ? 'gap-2' : 'gap-3'} ${autoColumns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {Array.from({ length: autoColumns }, (_, colIndex) => {
              const startNum = colIndex * questionsPerColumn + 1;
              const endNum = (colIndex + 1) * questionsPerColumn;
              return (
                <div key={colIndex} className={`border-r-2 last:border-r-0 border-gray-300 ${superCompact ? 'pr-1 last:pr-0' : 'pr-2 last:pr-0'}`}>
                  {renderColumn(startNum, endNum)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - минимальный */}
        {!superCompact && (
          <div className="mt-1 pt-1 border-t border-gray-300">
            <div className="flex justify-between items-center text-[8px] text-gray-500">
              <p>🤖 Avtomatik skanerlash</p>
              <p className="font-mono">{new Date().toLocaleDateString('uz-UZ')}</p>
            </div>
          </div>
        )}
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
