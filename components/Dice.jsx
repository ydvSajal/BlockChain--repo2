import React, { useState, useEffect } from 'react';

const Dice = ({ value = null, isRolling = false }) => {
  const [animationState, setAnimationState] = useState('idle'); // idle, rolling, result
  const [displayValue, setDisplayValue] = useState(value || 1);

  // Update animation state based on props
  useEffect(() => {
    if (isRolling) {
      setAnimationState('rolling');
    } else if (value && value !== '?') {
      setAnimationState('result');
      setDisplayValue(value);
    } else {
      setAnimationState('idle');
    }
  }, [isRolling, value]);

  // Calculate rotation angles for each face (result state)
  // Each number has specific rotation angles to face forward after rolling
  const getRotation = () => {
    if (animationState === 'idle' && (!value || value === '?')) {
      // Show a random face in idle state
      return 'rotateX(-20deg) rotateY(-20deg)';
    }
    
    // Final position based on result number - specific rotations to show each face forward
    const rotations = {
      1: 'rotateX(0deg) rotateY(0deg)',        // front face
      2: 'rotateX(0deg) rotateY(180deg)',      // back face
      3: 'rotateX(0deg) rotateY(-90deg)',      // right face
      4: 'rotateX(0deg) rotateY(90deg)',       // left face
      5: 'rotateX(-90deg) rotateY(0deg)',      // top face
      6: 'rotateX(90deg) rotateY(0deg)',       // bottom face
    };
    
    return rotations[displayValue] || rotations[1];
  };

  // Render dot pattern for each face
  const renderDots = (faceValue) => {
    const dotPatterns = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['left-top', 'left-middle', 'left-bottom', 'right-top', 'right-middle', 'right-bottom'],
    };

    const positions = {
      'top-left': 'col-start-1 row-start-1',
      'top-right': 'col-start-3 row-start-1',
      'center': 'col-start-2 row-start-2',
      'bottom-left': 'col-start-1 row-start-3',
      'bottom-right': 'col-start-3 row-start-3',
      // Two columns for face 6
      'left-top': 'col-start-1 row-start-1',
      'left-middle': 'col-start-1 row-start-2',
      'left-bottom': 'col-start-1 row-start-3',
      'right-top': 'col-start-3 row-start-1',
      'right-middle': 'col-start-3 row-start-2',
      'right-bottom': 'col-start-3 row-start-3',
    };

    return dotPatterns[faceValue].map((position, index) => (
      <div
        key={`${faceValue}-${position}-${index}`}
        className={`w-4 h-4 bg-gray-900 rounded-full ${positions[position]}`}
      />
    ));
  };

  return (
    <div className="dice-container" style={{ perspective: '1000px' }}>
      <div
        className={`dice-cube ${
          animationState === 'rolling' 
            ? 'dice-rolling' 
            : animationState === 'result' 
            ? 'dice-result' 
            : ''
        }`}
        style={{
          transform: animationState === 'rolling' ? undefined : getRotation(),
        }}
      >
        {/* Face 1 - Front */}
        <div className="dice-face dice-face-1">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(1)}
          </div>
        </div>

        {/* Face 2 - Back */}
        <div className="dice-face dice-face-2">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(2)}
          </div>
        </div>

        {/* Face 3 - Right */}
        <div className="dice-face dice-face-3">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(3)}
          </div>
        </div>

        {/* Face 4 - Left */}
        <div className="dice-face dice-face-4">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(4)}
          </div>
        </div>

        {/* Face 5 - Top */}
        <div className="dice-face dice-face-5">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(5)}
          </div>
        </div>

        {/* Face 6 - Bottom */}
        <div className="dice-face dice-face-6">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-4">
            {renderDots(6)}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dice-container {
          width: 150px;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .dice-cube {
          width: 150px;
          height: 150px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-20deg) rotateY(-20deg);
          transition: transform 2s ease-in-out;
        }

        .dice-face {
          position: absolute;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          border: 3px solid #333;
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
          backface-visibility: hidden;
        }

        .dice-face-1 {
          transform: translateZ(75px);
        }

        .dice-face-2 {
          transform: rotateY(180deg) translateZ(75px);
        }

        .dice-face-3 {
          transform: rotateY(90deg) translateZ(75px);
        }

        .dice-face-4 {
          transform: rotateY(-90deg) translateZ(75px);
        }

        .dice-face-5 {
          transform: rotateX(90deg) translateZ(75px);
        }

        .dice-face-6 {
          transform: rotateX(-90deg) translateZ(75px);
        }

        .dice-rolling {
          animation: roll 2s ease-in-out infinite;
        }

        @keyframes roll {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          12.5% {
            transform: rotateX(135deg) rotateY(105deg) rotateZ(60deg);
          }
          25% {
            transform: rotateX(270deg) rotateY(190deg) rotateZ(120deg);
          }
          37.5% {
            transform: rotateX(405deg) rotateY(285deg) rotateZ(180deg);
          }
          50% {
            transform: rotateX(540deg) rotateY(370deg) rotateZ(240deg);
          }
          62.5% {
            transform: rotateX(675deg) rotateY(465deg) rotateZ(300deg);
          }
          75% {
            transform: rotateX(810deg) rotateY(550deg) rotateZ(360deg);
          }
          87.5% {
            transform: rotateX(945deg) rotateY(645deg) rotateZ(420deg);
          }
          100% {
            transform: rotateX(1080deg) rotateY(720deg) rotateZ(480deg);
          }
        }

        /* Idle state - subtle floating animation */
        .dice-cube:not(.dice-rolling) {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateX(-20deg) rotateY(-20deg);
          }
          50% {
            transform: translateY(-10px) rotateX(-25deg) rotateY(-25deg);
          }
        }

        /* Result state - emphasize the winning face */
        .dice-cube.dice-result {
          animation: none;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
        }
      `}</style>
    </div>
  );
};

export default Dice;
