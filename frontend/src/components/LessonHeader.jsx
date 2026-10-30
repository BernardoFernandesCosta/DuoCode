import React from 'react';

/**
 * Componente de cabeçalho da tela de exercício (#11)
 * @param {number} currentStep - Questão atual (ex: 1)
 * @param {number} totalSteps - Total de questões na lição (ex: 5)
 * @param {function} onClose - Função executada ao clicar no botão de fechar (X)
 * @param {number} lives - (Opcional) Quantidade de vidas restantes no estilo Duolingo
 */
export default function LessonHeader({ 
  currentStep = 1, 
  totalSteps = 5, 
  onClose,
  lives = 5 
}) {
  // Calcula a porcentagem garantindo que fique entre 0% e 100%
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((currentStep / totalSteps) * 100))
  );

  return (
    <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-4 flex items-center gap-4 bg-transparent">
      {/* Botão de Fechar / Sair da Lição */}
      <button
        onClick={onClose}
        type="button"
        aria-label="Sair da lição"
        title="Sair da lição"
        className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Barra de Progresso Visual */}
      <div 
        className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden relative"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Brilho superior clássico estilo Duolingo */}
          <div className="absolute top-1 left-2 right-2 h-1 bg-white/25 rounded-full" />
        </div>
      </div>

      {/* Indicador de Vidas / Progresso numérico (Consistência Gamificada) */}
      {lives !== undefined && (
        <div className="flex items-center gap-1.5 font-bold text-red-500 select-none">
          <span className="text-xl" role="img" aria-label="Vidas">❤️</span>
          <span className="text-base">{lives}</span>
        </div>
      )}
    </header>
  );
}