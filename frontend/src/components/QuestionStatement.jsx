import React from 'react';

export default function QuestionStatement({ prefix, code, suffix }) {
  return (
    <h1 className="text-xl md:text-2xl font-bold leading-relaxed break-words text-white w-full">
      {prefix}
      {code && (
        <code className="bg-gray-800 px-2 py-1 mx-2 rounded text-yellow-300 text-[0.9em] break-all">
          {code}
        </code>
      )}
      {suffix && <span> {suffix}</span>}
    </h1>
  );
}