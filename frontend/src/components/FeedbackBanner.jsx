export default function FeedbackBanner({
  isCorrect,
  correctAnswer,
  message,
  passedTests,
  totalTests,
}) {
  if (isCorrect === null || isCorrect === undefined) return null;

  const isSuccess = isCorrect === true;
  const baseStyle = isSuccess
    ? 'bg-green-900/30 border-green-500 text-green-400'
    : 'bg-red-900/30 border-red-500 text-red-400';

  const hasTestSummary =
    typeof passedTests === 'number' &&
    typeof totalTests === 'number' &&
    totalTests > 0;

  return (
    <div
      className={`w-full border-2 p-6 flex flex-col md:flex-row items-center justify-between gap-4 ${baseStyle} animate-in slide-in-from-bottom-5`}
    >
      <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
        <div
          className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full font-black text-xl ${
            isSuccess
              ? 'bg-green-500 text-[#131f24]'
              : 'bg-red-500 text-[#131f24]'
          }`}
        >
          {isSuccess ? '✓' : '✗'}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-xl">
              {isSuccess ? 'Excelente!' : 'Não foi desta vez.'}
            </span>
            {hasTestSummary && (
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isSuccess
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {passedTests}/{totalTests} testes aprovados
              </span>
            )}
          </div>

          {message && (
            <span className="text-sm font-medium mt-1">{message}</span>
          )}

          {!isSuccess && correctAnswer && (
            <span className="text-sm font-medium mt-1">
              Resposta correta: <strong>{correctAnswer}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
