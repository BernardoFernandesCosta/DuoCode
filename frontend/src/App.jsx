
import { useState } from 'react';
import ExerciseScreen from './pages/ExerciseScreen';
import CodeExerciseScreen from './pages/CodeExerciseScreen';
import ReviewScreen from './pages/ReviewScreen';

function App() {
  const [mode, setMode] = useState('multiple_choice');
  const [returnMode, setReturnMode] = useState('multiple_choice');
  const [lives, setLives] = useState(5);

  function handleLivesUpdated(hearts) {
    setLives(hearts.lives);
  }

  return (
    <div className="min-h-screen bg-[#131f24] flex flex-col">
      <nav
        aria-label="Tipo de exercício"
        className="w-full border-b border-gray-800 bg-[#0f191d] px-4 py-3"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <span className="font-extrabold text-lg tracking-tight text-green-400">
            DuoCode
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('multiple_choice')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                mode === 'multiple_choice'
                  ? 'bg-green-500 text-green-950'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Múltipla Escolha
            </button>

            <button
              type="button"
              onClick={() => setMode('code')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                mode === 'code'
                  ? 'bg-green-500 text-green-950'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Editor de Código
            </button>

            <button
              type="button"
              onClick={() => {setReturnMode(mode); setMode('review');}}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                mode === 'review'
                  ? 'bg-green-500 text-green-950'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Revisão
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {mode === 'multiple_choice' ? (
          <ExerciseScreen
            onStartReview={() => setMode('review')}
          />
        ) : mode === 'code' ? (
          <CodeExerciseScreen
            onStartReview={() => setMode('review')}
          />
        ) : (
          <ReviewScreen
            onBack={() => setMode('multiple_choice')}
            onLivesUpdated={handleLivesUpdated}
          />
        )}
      </div>
    </div>
  );
}

export default App;
