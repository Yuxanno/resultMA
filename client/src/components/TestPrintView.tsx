interface Question {
  text: string;
  formula?: string;
  imageUrl?: string;
  variants: {
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
    formula?: string;
    imageUrl?: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  points: number;
}

interface TestPrintViewProps {
  student: {
    fullName: string;
    variantCode: string;
  };
  test: {
    name: string;
    subjectName: string;
    classNumber: number;
    groupLetter: string;
  };
  questions: Question[];
  questionOrder?: number[];
}

export default function TestPrintView({ student, test, questions, questionOrder }: TestPrintViewProps) {
  const orderedQuestions = questionOrder 
    ? questionOrder.map(idx => questions[idx])
    : questions;

  return (
    <div className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="border-2 border-gray-800 p-4 mb-4">
        <h2 className="text-2xl font-bold text-center mb-3">{test.name}</h2>
        <div className="flex justify-between text-sm">
          <div>
            <p><span className="font-semibold">O'quvchi:</span> {student.fullName}</p>
            <p><span className="font-semibold">Variant:</span> {student.variantCode}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Fan:</span> {test.subjectName}</p>
            <p><span className="font-semibold">Sinf:</span> {test.classNumber}-{test.groupLetter}</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {orderedQuestions.map((question, idx) => (
          <div key={idx} className="border border-gray-300 p-4 rounded-lg break-inside-avoid">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-bold text-lg">{idx + 1}.</span>
              <div className="flex-1">
                <p className="text-base">{question.text}</p>
                {question.formula && (
                  <div className="bg-gray-50 p-2 my-2 rounded border border-gray-200 font-mono text-sm">
                    {question.formula}
                  </div>
                )}
                {question.imageUrl && (
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="max-w-md my-2 rounded border border-gray-200"
                  />
                )}
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                {question.points} ball
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 ml-6">
              {question.variants.map((variant) => (
                <div key={variant.letter} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="font-bold">{variant.letter})</span>
                  <div className="flex-1">
                    <p className="text-sm">{variant.text}</p>
                    {variant.formula && (
                      <div className="bg-white p-1 my-1 rounded border border-gray-200 font-mono text-xs">
                        {variant.formula}
                      </div>
                    )}
                    {variant.imageUrl && (
                      <img 
                        src={variant.imageUrl} 
                        alt={`Variant ${variant.letter}`} 
                        className="max-w-full mt-1 rounded border border-gray-200"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-600 border-t pt-4">
        <p>Jami savollar: {orderedQuestions.length} | Jami ball: {orderedQuestions.reduce((sum, q) => sum + q.points, 0)}</p>
      </div>
    </div>
  );
}
