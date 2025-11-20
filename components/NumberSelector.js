import React from 'react';

const NumberSelector = ({ selectedNumber, onSelectNumber, disabled = false }) => {
  const numbers = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-white text-center">
        Select Your Number
      </label>
      
      {/* 2 rows × 3 columns grid for numbers 1-6 */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {numbers.map((number) => (
          <button
            key={number}
            onClick={() => onSelectNumber(number)}
            disabled={disabled}
            className={`
              aspect-square rounded-lg font-bold text-3xl
              transition-all duration-200 transform
              border-2
              ${selectedNumber === number
                ? 'border-green-500 bg-green-100 text-green-700 scale-105 shadow-lg'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:scale-105'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
            `}
          >
            {number}
          </button>
        ))}
      </div>
      
      {selectedNumber !== null && (
        <div className="text-center text-sm text-gray-300 mt-2">
          Selected: <span className="text-green-400 font-bold text-lg">{selectedNumber}</span>
        </div>
      )}
    </div>
  );
};

export default NumberSelector;