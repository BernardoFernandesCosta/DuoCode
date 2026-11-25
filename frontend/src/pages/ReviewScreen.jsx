
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function ReviewScreen({ onBack, onLivesUpdated }) {
  const [sessionId, setSessionId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadReview() {
      try {
        const response = await fetch(`${API_URL}/lessons/review`);

        if (!response.ok) {
          throw new Error('Não foi possível carregar a revisão.');
        }

        const data = await response.json();

        setSessionId(data.session_id);
        setLessons(data.lessons);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, []);

  async function finishReview() {
    const response = await fetch(
      `${API_URL}/lessons/review/complete?session_id=${sessionId}`,
      { method: 'POST' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao concluir revisão.');
    }

    setFinished(true);

    if (onLivesUpdated) {
      onLivesUpdated(data.hearts);
    }
  }

  async function handleAnswer() {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    const currentLesson = lessons[currentIndex];

    try {
      const response = await fetch(`${API_URL}/lessons/review/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          lesson_id: currentLesson.id,
          answer: selectedAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao validar resposta.');
      }

      if (!data.is_correct) {
        setMessage('Resposta incorreta! Tente novamente.');
        setSelectedAnswer('');
        return;
      }

      if (data.completed) {
        await finishReview();
      } else {
        setCurrentIndex((previous) => previous + 1);
        setSelectedAnswer('');
        setMessage('');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <p className="text-gray-300 animate-pulse">
          Carregando revisão...
        </p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#1c2b30] border border-gray-700 rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-red-400 mb-6">{message}</p>
          <button
            onClick={onBack}
            className="bg-green-500 hover:bg-green-400 text-green-950 font-bold px-6 py-3 rounded-xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#1c2b30] border border-green-500/40 rounded-2xl p-8 text-center max-w-md w-full shadow-xl">
          <div className="text-6xl mb-5">❤️</div>

          <h2 className="text-2xl font-extrabold text-green-400 mb-3">
            Revisão concluída!
          </h2>

          <p className="text-gray-300 mb-6">
            Parabéns! Você respondeu às três questões corretamente e recuperou uma vida.
          </p>

          <button
            onClick={onBack}
            className="w-full bg-green-500 hover:bg-green-400 text-green-950 font-extrabold py-3 rounded-xl transition"
          >
            Voltar aos exercícios
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentIndex];
  const progress = ((currentIndex + 1) / lessons.length) * 100;

  return (
    <div className="flex-1 flex justify-center items-start px-4 py-10">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <span className="text-green-400 text-sm font-bold uppercase tracking-widest">
            DuoCode • Treinamento
          </span>

          <h1 className="text-3xl font-extrabold text-white mt-2">
            Lição de revisão
          </h1>

          <p className="text-gray-400 mt-2">
            Acerte as três questões e recupere uma vida!
          </p>
        </div>

        <div className="bg-[#1c2b30] border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-xl">

          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 font-semibold">
              Questão {currentIndex + 1} de {lessons.length}
            </span>

            <span className="text-green-400 font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-7">
            {currentLesson.question}
          </h2>

          <div className="flex flex-col gap-3">
            {currentLesson.options.map((option) => {
              const isSelected = selectedAnswer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedAnswer(option.id)}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition duration-200 ${
                    isSelected
                      ? 'border-green-400 bg-green-500/10 text-green-300'
                      : 'border-gray-600 bg-[#26383e] text-gray-200 hover:border-green-500 hover:bg-[#30464c]'
                  }`}
                >
                  <span className={`w-9 h-9 flex items-center justify-center rounded-lg font-extrabold shrink-0 ${
                    isSelected
                      ? 'bg-green-500 text-green-950'
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    {option.id}
                  </span>

                  <span className="font-medium">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {message && (
            <div className="mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-center">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleAnswer}
            disabled={!selectedAnswer || isSubmitting}
            className="w-full mt-7 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-green-950 font-extrabold py-4 rounded-xl transition"
          >
            {isSubmitting ? 'Verificando...' : 'Confirmar resposta'}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full mt-3 text-gray-400 hover:text-white font-semibold py-2 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewScreen;
