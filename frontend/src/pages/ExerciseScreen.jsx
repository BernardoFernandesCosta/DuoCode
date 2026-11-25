import React, { useState, useEffect } from 'react';
import LessonHeader from '../components/LessonHeader';
import QuestionStatement from '../components/QuestionStatement';
import AnswerOptions from '../components/AnswerOptions';
import FeedbackBanner from '../components/FeedbackBanner';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function ExerciseScreen({ onStartReview }) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [lesson, setLesson] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lives, setLives] = useState(5);
  const [isOutOfLives, setIsOutOfLives] = useState(false);

const totalQuestions = 5;

useEffect(() => {
  const fetchHearts = async () => {
    try {
      const response = await fetch(`${API_URL}/hearts`);

      if (!response.ok) {
        throw new Error('Não foi possível carregar as vidas.');
      }

      const data = await response.json();
      setLives(data.lives);

      if (data.lives <= 0) {
        setIsOutOfLives(true);
      } else {
        setIsOutOfLives(false);
      }
    } catch (err) {
      console.error('Erro ao buscar vidas:', err);
    }
  };

  fetchHearts();
}, []);

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option.text ?? option.label ?? option.value ?? option.id;
  };

  const resetState = () => {
    setSelectedAnswer(null);
    setIsChecking(false);
    setIsCorrect(null);
    setCorrectAnswer(null);
    setIsSubmitting(false);
    setError(null);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchLesson = async () => {
      setIsLoadingLesson(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/lessons/${currentQuestion}`);

        if (!response.ok) {
          if(response.status === 403) {
            setIsOutOfLives(true);
            setLives(0);
            throw new Error('Você não tem vidas suficientes para continuar. Por favor, Faça uma revisão para recuperar vidas ou aguarde.');
          }
          const detail =
          response.status === 404
              ? `Lição ${currentQuestion} não encontrada no servidor.`
              : 'Não foi possível carregar a lição.';
          throw new Error(detail);
        }

        const data = await response.json();
        if (isMounted) {
          setLesson(data);
        }
      } catch (err) {
        if (isMounted) {
          setLesson(null);
          setError(
            err instanceof TypeError
              ? 'Sem conexão com o servidor. Verifique se o backend está rodando.'
              : err.message
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingLesson(false);
        }
      }
    };

    fetchLesson();

    return () => {
      isMounted = false;
    };
  }, [currentQuestion]);

  const handleCloseLesson = () => {
    if (
      window.confirm(
        'Tem a certeza de que deseja sair? Perderá o progresso desta lição!'
      )
    ) {
      setCurrentQuestion(1);
      resetState();
    }
  };

  const validateAnswer = async () => {
    if (!lesson || !selectedAnswer) return;

    setIsSubmitting(true);
    setError(null);

    const matchedOption = lesson.options.find(
      (opt) => getOptionLabel(opt) === selectedAnswer
    );
    const answerPayload =
      matchedOption && typeof matchedOption === 'object'
        ? matchedOption.id
        : selectedAnswer;

    try {
      const response = await fetch(
        `${API_URL}/lessons/${currentQuestion}/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({lesson_id: currentQuestion, answer: answerPayload }),
        }
      );

      if (!response.ok) {
        if(response.status === 403) {
          setIsOutOfLives(true);
          setLives(0);
          throw new Error('Você não tem vidas suficientes para continuar. Por favor, Faça uma revisão para recuperar vidas ou aguarde.');
        }
        const detail =
          response.status === 404
            ? 'Lição não encontrada.'
            : response.status === 422
              ? 'Alternativa inválida.'
              : 'Erro no servidor ao validar a resposta.';
        throw new Error(detail);
      }

      const data = await response.json();
      setIsCorrect(data.is_correct);
      setCorrectAnswer(data.correct_answer);
      if (data.hearts){
        setLives(data.hearts.lives);
      }
      setIsChecking(true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Sem conexão com o servidor. Verifique sua conexão e tente novamente.'
          : err.message
      );
      setIsChecking(false);
      setIsCorrect(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = () => {
    if (!isChecking) {
      validateAnswer();
    } else {
      setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1));
      resetState();
    }
  };

  const optionLabels = lesson?.options ? lesson.options.map(getOptionLabel) : [];

  return (
    <div className="min-h-screen bg-[#131f24] text-white flex flex-col justify-between">
      <LessonHeader
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
        onClose={handleCloseLesson}
        lives={lives}
      />

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-4 pb-12">
        <div className="w-full p-6 border-2 border-gray-700 rounded-2xl bg-[#1b2b32] text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
            Exercício {currentQuestion} de {totalQuestions}
          </span>

          {isLoadingLesson ? (
            <p className="py-8 text-gray-300 font-semibold">
              Carregando exercício...
            </p>
          ) : lesson ? (
            <>
              <QuestionStatement prefix={lesson.question} code="" suffix="" />

              <div
                className={
                  isChecking || isSubmitting
                    ? 'pointer-events-none opacity-80'
                    : ''
                }
              >
                <AnswerOptions
                  options={optionLabels}
                  selectedOption={selectedAnswer}
                  onSelect={setSelectedAnswer}
                />
              </div>
            </>
                    ) : isOutOfLives ? (
            <div className="py-8 space-y-4">
              <h2 className="text-2xl font-bold text-red-400">
                Você está sem vidas!
              </h2>

              <p className="text-gray-300">
                Complete uma revisão acertando 3 questões para recuperar uma vida.
              </p>

              <button
                onClick={onStartReview}
                className="px-6 py-3 rounded-xl font-bold bg-green-500 text-green-950 hover:bg-green-600 transition"
              >
                Fazer revisão
              </button>
            </div>
          ) : (
            <p className="py-8 text-gray-400">
              Nenhum exercício disponível nesta etapa.
            </p>
          )}
        </div>
      </main>

      <footer className="w-full border-t-2 border-gray-800 bg-[#131f24] relative z-10">
        {isChecking && (
          <FeedbackBanner isCorrect={isCorrect} correctAnswer={correctAnswer} />
        )}

        {error && (
          <p
            role="alert"
            className="max-w-4xl mx-auto px-4 pt-4 text-sm font-bold text-red-400 text-center"
          >
            {error}
          </p>
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
            disabled={
              !selectedAnswer || isSubmitting || isLoadingLesson || !lesson
            }
            className={`px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed ${
              isChecking
                ? isCorrect
                  ? 'bg-green-500 text-green-950 shadow-[0_4px_0_#15803d]'
                  : 'bg-red-500 text-red-950 shadow-[0_4px_0_#991b1b]'
                : 'bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d]'
            }`}
          >
            {isSubmitting
              ? 'Verificando...'
              : !isChecking
                ? 'Verificar'
                : currentQuestion === totalQuestions
                  ? 'Concluir'
                  : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  );
}