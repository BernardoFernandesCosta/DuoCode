import { useEffect, useState } from 'react';
import LessonHeader from '../components/LessonHeader';
import QuestionStatement from '../components/QuestionStatement';
import CodeEditor from '../components/CodeEditor';
import FeedbackBanner from '../components/FeedbackBanner';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function CodeExerciseScreen({onStartReview}) {
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [lives, setLives] = useState(5);
  const [isOutOfLives, setIsOutOfLives] = useState(false);

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


  useEffect(() => {
  let isMounted = true;

  const fetchCodeLessons = async () => {
    setIsLoadingLessons(true);
    setRequestError(null);

    try {
      const response = await fetch(`${API_URL}/code-lessons`);

      if (!response.ok) {
        if (response.status === 403) {
          if (isMounted) {
            setIsOutOfLives(true);
            setLives(0);
          }

          throw new Error(
            'Você está sem vidas! Faça uma revisão para recuperar uma vida.'
          );
        }

        throw new Error(
          'Não foi possível carregar os exercícios de código.'
        );
      }

      const data = await response.json();
      const loadedLessons = data.code_lessons ?? [];

      if (isMounted) {
        setIsOutOfLives(false);
        setLessons(loadedLessons);
        setCurrentIndex(0);
        setCode(loadedLessons[0]?.starter_code ?? '');
      }
    } catch (err) {
      if (isMounted) {
        setLessons([]);
        setRequestError(
          err instanceof TypeError
            ? 'Sem conexão com o servidor. Verifique se o backend está rodando.'
            : err.message
        );
      }
    } finally {
      if (isMounted) {
        setIsLoadingLessons(false);
      }
    }
  };

  fetchCodeLessons();

  return () => {
    isMounted = false;
  };
}, [reloadKey]);

  const currentLesson = lessons[currentIndex] ?? null;
  const totalLessons = lessons.length || 1;
  const hasPassed = executionResult?.is_correct === true;
  const isLastLesson =
    lessons.length > 0 && currentIndex === lessons.length - 1;

  const goToLesson = (nextIndex) => {
    const targetLesson = lessons[nextIndex];
    if (!targetLesson) return;

    setCurrentIndex(nextIndex);
    setCode(targetLesson.starter_code ?? '');
    setExecutionResult(null);
    setRequestError(null);
    setIsCompleted(false);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setRequestError(null);
    if (executionResult?.is_correct) {
      setExecutionResult(null);
    }
  };

  const handleResetCode = () => {
    if (!currentLesson) return;
    setCode(currentLesson.starter_code ?? '');
    setExecutionResult(null);
    setRequestError(null);
  };

  const handleCloseLesson = () => {
    if (
      window.confirm(
        'Tem certeza de que deseja sair? Você perderá o progresso desta lição!'
      )
    ) {
      goToLesson(0);
    }
  };

const handleRunCode = async () => {
  if (!currentLesson || isRunning) return;

  setIsRunning(true);
  setRequestError(null);

  try {
    const response = await fetch(
      `${API_URL}/lessons/${currentLesson.id}/run-code`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        setIsOutOfLives(true);
        setLives(0);

        throw new Error(
          'Você está sem vidas! Faça uma revisão para recuperar uma vida.'
        );
      }

      const detail =
        response.status === 404
          ? 'Exercício de código não encontrado no servidor.'
          : 'Erro no servidor ao executar o código.';

      throw new Error(detail);
    }

    const data = await response.json();

    setExecutionResult(data);

    if (data.hearts) {
      setLives(data.hearts.lives);
    }
  } catch (err) {
    setExecutionResult(null);

    setRequestError(
      err instanceof TypeError
        ? 'Sem conexão com o servidor. Verifique se o backend está rodando.'
        : err.message
    );
  } finally {
    setIsRunning(false);
  }
};

  const handlePrimaryAction = () => {
    if (hasPassed) {
      if (isLastLesson) {
        setIsCompleted(true);
      } else {
        goToLesson(currentIndex + 1);
      }
    } else {
      handleRunCode();
    }
  };

  if (isCompleted) {
    return (
      <div className="flex-1 bg-[#131f24] text-white flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full p-8 border-2 border-green-500/60 rounded-2xl bg-[#1b2b32] text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500 text-[#131f24] flex items-center justify-center text-3xl font-black">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white">Prática concluída!</h2>
          <p className="text-gray-300">
            Você completou todos os {lessons.length} exercícios de código Python
            com sucesso.
          </p>
          <button
            type="button"
            onClick={() => goToLesson(0)}
            className="px-8 py-3 rounded-xl font-bold bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all"
          >
            Refazer exercícios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#131f24] text-white flex flex-col justify-between">
      <LessonHeader
        currentStep={currentIndex + 1}
        totalSteps={totalLessons}
        onClose={handleCloseLesson}
        lives={lives}
      />

      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto px-4 pb-10">
        <div className="w-full p-6 border-2 border-gray-700 rounded-2xl bg-[#1b2b32] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
              Exercício de Código {currentIndex + 1} de {totalLessons}
            </span>
            {currentLesson?.title && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-gray-200 border border-gray-700">
                {currentLesson.title}
              </span>
            )}
          </div>

          {isLoadingLessons ? (
  <p className="py-10 text-gray-300 font-semibold text-center">
    Carregando exercícios de código...
  </p>
) : isOutOfLives ? (
  <div className="py-8 text-center space-y-4">
    <h2 className="text-2xl font-bold text-red-400">
      Você está sem vidas!
    </h2>

    <p className="text-gray-300">
      Complete uma revisão acertando 3 questões para recuperar uma vida.
    </p>

    <button
      type="button"
      onClick={onStartReview}
      className="px-6 py-3 rounded-xl font-bold bg-green-500 text-green-950 hover:bg-green-600 transition"
    >
      Fazer revisão
    </button>
  </div>
) : currentLesson ? (
  <>
    <div className="text-left">
      <QuestionStatement question={currentLesson.question} />
    </div>

    <CodeEditor
      value={code}
      onChange={handleCodeChange}
      onRun={handleRunCode}
      onReset={handleResetCode}
      disabled={isRunning}
    />

    {executionResult && (
      <div className="w-full rounded-xl border border-gray-700 bg-[#0f191d] p-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Saída da execução
          </span>
          <span
            className={`text-xs font-bold ${
              executionResult.is_correct
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {executionResult.passed_tests}/
            {executionResult.total_tests} testes
          </span>
        </div>

        <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap break-words m-0">
          {executionResult.output
            ? executionResult.output
            : '(Sem saída no terminal)'}
        </pre>
      </div>
    )}
  </>
) : (
  <div className="py-8 text-center space-y-4">
    <p className="text-gray-400">
      Nenhum exercício de código disponível no momento.
    </p>

    <button
      type="button"
      onClick={() => setReloadKey((prev) => prev + 1)}
      className="px-5 py-2 rounded-xl font-bold border-2 border-gray-600 text-gray-200 hover:bg-gray-800 transition"
    >
      Tentar novamente
    </button>
  </div>
)}
        </div>
      </main>

      <footer className="w-full border-t-2 border-gray-800 bg-[#131f24] relative z-10">
        {executionResult && (
          <FeedbackBanner
            isCorrect={executionResult.is_correct}
            message={
              executionResult.is_correct
                ? 'Todos os casos de teste passaram com sucesso!'
                : executionResult.error
            }
            passedTests={executionResult.passed_tests}
            totalTests={executionResult.total_tests}
          />
        )}

        {requestError && (
          <p
            role="alert"
            className="max-w-4xl mx-auto px-4 pt-4 text-sm font-bold text-red-400 text-center"
          >
            {requestError}
          </p>
        )}

        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <button
            type="button"
            onClick={() => goToLesson(currentIndex - 1)}
            disabled={currentIndex === 0 || isRunning}
            className="px-6 py-3 rounded-xl font-bold border-2 border-gray-600 text-gray-300 disabled:opacity-40 hover:bg-gray-800 transition"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isRunning || isLoadingLessons || !currentLesson}
            className={`px-8 py-3 rounded-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed ${
              hasPassed
                ? 'bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d]'
                : 'bg-green-500 text-green-950 hover:bg-green-600 shadow-[0_4px_0_#15803d]'
            }`}
          >
            {isRunning
              ? 'Executando...'
              : hasPassed
                ? isLastLesson
                  ? 'Concluir'
                  : 'Continuar'
                : 'Executar / Verificar'}
          </button>
        </div>
      </footer>
    </div>
  );
}
