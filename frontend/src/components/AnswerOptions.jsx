import React from 'react';

export default function AnswerOptions({ options, selectedOption, onSelect }) {
  return (
    <div className="flex flex-col gap-3 w-full mt-6">
      {options.map((option, index) => {
        const isSelected = selectedOption === option;
        
        return (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className={`p-4 rounded-xl border-2 text-left font-semibold transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-600 bg-gray-800/50 text-gray-200 hover:border-gray-400 hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}