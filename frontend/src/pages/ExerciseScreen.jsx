import React, { useState } from 'react';
import LessonHeader from '../components/LessonHeader';
import QuestionStatement from '../components/QuestionStatement';
import AnswerOptions from '../components/AnswerOptions';
import FeedbackBanner from '../components/FeedbackBanner';

export default function ExerciseScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const totalQuestions = 5;
  const options = ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'bool'>"];
  const correctAnswer = "<class 'int'>"; // Simulação do gabarito vindo do backend

  const handleCloseLesson = () => {
    if (window.confirm('Tem a certeza de que deseja sair? Perderá o progresso desta lição!')) {
      setCurrentQuestion(1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedAnswer(null);
    setIsChecking(false);
    setIsCorrect(null);
  };

  const handleAction = () => {
    if (!isChecking) {
      // Fase 1: Clicou em "Verificar"
      setIsChecking(true);
      setIsCorrect(selectedAnswer === correctAnswer);
    } else {
      // Fase 2: Clicou em "Avançar" após ver o feedback
      setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1));
      resetState();
    }
  };

  return (
    <div className="min-h-screen bg-[#131f24] text-white flex flex-col justify-between">
      <LessonHeader
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
        onClose={handleCloseLesson}
        lives={5}
      />

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-4 pb-12">
        <div className="w-full p-6 border-2 border-gray-700 rounded-2xl bg-[#1b2b32] text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
            Exercício {currentQuestion} de {totalQuestions}
          </span>
          
          <QuestionStatement 
            prefix="Qual é a saída de"
            code="print(type(42))"
            suffix="em Python?"
          />

          {/* Opções são bloqueadas enquanto o feedback está visível */}
          <div className={isChecking ? 'pointer-events-none opacity-80' : ''}>
            <AnswerOptions 
              options={options}
              selectedOption={selectedAnswer}
              onSelect={setSelectedAnswer}
            />
          </div>
        </div>
      </main>

      <footer className="w-full border-t-2 border-gray-800 bg-[#131f24] relative z-10">
        {isChecking && (
          <FeedbackBanner isCorrect={isCorrect} correctAnswer={correctAnswer} />
        )}
        
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <button
            onClick={() => {
              setCurrentQuestion((prev) => Math.max(1, prev - 1));
              resetState();
            }}
            disabled={currentQuestion === 1 || isChecking}
            className="px-6 py-3 rounded-xl font-bold border-2 border-gray-600 text-gray-300 disabled:opacity-40 hover:bg-gray-800 transition"
          >
            Voltar
          </button>

          <button
            onClick={handleAction}
            disabled={!selectedAnswer}
            className={`px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed ${
              isChecking
                ? (isCorrect ? 'bg-green-500 text-green-950 shadow-[0_4px_0_#15803d]' : 'bg-red-500 text-red-950 shadow-[0_4px_0_#991b1b]')
                : 'bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d]'
            }`}
          >
            {!isChecking ? 'Verificar' : (currentQuestion === totalQuestions ? 'Concluir' : 'Continuar')}
          </button>
        </div>
      </footer>
    </div>
  );
}