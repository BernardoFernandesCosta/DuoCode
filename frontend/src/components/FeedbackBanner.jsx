import React from 'react';

export default function FeedbackBanner({ isCorrect, correctAnswer }) {
  if (isCorrect === null) return null;

  const isSuccess = isCorrect === true;
  const baseStyle = isSuccess
    ? "bg-green-900/30 border-green-500 text-green-400"
    : "bg-red-900/30 border-red-500 text-red-400";

  return (
    <div className={`w-full border-2 p-6 flex flex-col md:flex-row items-center justify-between gap-4 ${baseStyle} animate-in slide-in-from-bottom-5`}>
      <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-xl ${
          isSuccess ? 'bg-green-500 text-[#131f24]' : 'bg-red-500 text-[#131f24]'
        }`}>
          {isSuccess ? '✓' : '✗'}
        </div>
        
        <div className="flex flex-col text-left">
          <span className="font-bold text-xl">
            {isSuccess ? 'Excelente!' : 'Não foi desta vez.'}
          </span>
          {!isSuccess && (
            <span className="text-sm font-medium mt-1 opacity-90">
              Resposta correta: {correctAnswer}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}