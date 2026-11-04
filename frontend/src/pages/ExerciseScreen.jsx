
import React, { useEffect, useState } from 'react';
import LessonHeader from '../components/LessonHeader';
import QuestionStatement from '../components/QuestionStatement';
import AnswerOptions from '../components/AnswerOptions';
import FeedbackBanner from '../components/FeedbackBanner';

export default function ExerciseScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Dados recebidos do backend
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalQuestions = 5;
  const API_URL = 'http://127.0.0.1:8000';

  // Busca a questão quando a tela é carregada
  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`${API_URL}/lessons/1`);

        if (!response.ok) {
          throw new Error('Não foi possível carregar a questão.');
        }

        const data = await response.json();
        setLesson(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLesson();
  }, []);

  const resetState = () => {
    setSelectedAnswer(null);
    setIsChecking(false);
    setIsCorrect(null);
    setError('');
  };

  const handleCloseLesson = () => {
    if (window.confirm('Tem a certeza de que deseja sair? Perderá o progresso desta lição!')) {
      setCurrentQuestion(1);
      resetState();
    }
  };

  // Envia a resposta selecionada para o backend
  const handleAction = async () => {
    if (!isChecking) {
      setIsSubmitting(true);
      setError('');

      try {
        const response = await fetch(
          `${API_URL}/lessons/1/validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              answer: selectedAnswer
            })
          }
        );

        if (!response.ok) {
          throw new Error('Não foi possível validar sua resposta.');
        }

        const data = await response.json();

        setIsCorrect(data.is_correct);
        setIsChecking(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1));
      resetState();
    }
  };

  // Exibe uma mensagem enquanto a questão é carregada
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131f24] text-white flex items-center justify-center">
        Carregando questão...
      </div>
    );
  }

  // Exibe erro se não conseguir carregar a questão
  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#131f24] text-white flex flex-col items-center justify-center gap-4">
        <p>{error || 'Questão não encontrada.'}</p>
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

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

          <QuestionStatement question={lesson.question} />

          <div className={isChecking ? 'pointer-events-none opacity-80' : ''}>
            <AnswerOptions
              options={lesson.options}
              selectedOption={selectedAnswer}
              onSelect={setSelectedAnswer}
            />
          </div>
        </div>
      </main>

      <footer className="w-full border-t-2 border-gray-800 bg-[#131f24] relative z-10">
        {isChecking && (
          <FeedbackBanner isCorrect={isCorrect} />
        )}

        {error && (
          <p className="text-red-400 text-center p-2">{error}</p>
        )}

        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <button
            onClick={() => {
              setCurrentQuestion((prev) => Math.max(1, prev - 1));
              resetState();
            }}
            disabled={currentQuestion === 1 || isChecking || isSubmitting}
            className="px-6 py-3 rounded-xl font-bold border-2 border-gray-600 text-gray-300 disabled:opacity-40 hover:bg-gray-800 transition"
          >
            Voltar
          </button>

          <button
            onClick={handleAction}
            disabled={!selectedAnswer || isSubmitting}
            className={`px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed ${
              isChecking
                ? (isCorrect ? 'bg-green-500 text-green-950 shadow-[0_4px_0_#15803d]' : 'bg-red-500 text-red-950 shadow-[0_4px_0_#991b1b]')
                : 'bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d]'
            }`}
          >
            {isSubmitting
              ? 'Verificando...'
              : !isChecking
                ? 'Verificar'
                : (currentQuestion === totalQuestions ? 'Concluir' : 'Continuar')}
          </button>
        </div>
      </footer>
    </div>
  );
}
