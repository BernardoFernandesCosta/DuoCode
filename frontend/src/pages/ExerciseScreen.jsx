import React, { useState } from 'react';
import LessonHeader from '../components/LessonHeader';

export default function ExerciseScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 5;

  const handleCloseLesson = () => {
    const confirmExit = window.confirm(
      'Tem a certeza de que deseja sair? Perderá o progresso desta lição!'
    );
    if (confirmExit) {
      setCurrentQuestion(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#131f24] text-white flex flex-col justify-between">
      {/* SUB-ISSUE #11: Cabeçalho da Lição e Barra de Progresso */}
      <LessonHeader
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
        onClose={handleCloseLesson}
        lives={5}
      />

      {/* Área Central (Onde entrarão as Sub-issues #12 e #13) */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-4">
        <div className="w-full p-6 border-2 border-gray-700 rounded-2xl bg-[#1b2b32] text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
            Exercício {currentQuestion} de {totalQuestions}
          </span>
          <h1 className="text-xl md:text-2xl font-bold">
            Qual é a saída de <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">print(type(42))</code> em Python?
          </h1>
          <p className="text-sm text-gray-400">
            (Os componentes de enunciado #12 e alternativas #13 entrarão aqui)
          </p>
        </div>
      </main>

      {/* Rodapé de Simulação (Onde entrará a Sub-issue #14) */}
      <footer className="w-full border-t-2 border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
            disabled={currentQuestion === 1}
            className="px-6 py-3 rounded-xl font-bold border-2 border-gray-600 text-gray-300 disabled:opacity-40 hover:bg-gray-800 transition"
          >
            Voltar
          </button>

          <button
            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1))}
            className="px-8 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-gray-950 shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all"
          >
            {currentQuestion === totalQuestions ? 'Concluir' : 'Avançar Progresso'}
          </button>
        </div>
      </footer>
    </div>
  );
}