import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ResultModal = ({ result, betNumber, betAmount, onClose }) => {
  // Trigger canvas-confetti on win
  useEffect(() => {
    if (result && result.won) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [result]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  if (!result) return null;

  // Framer Motion variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      y: -100, 
      scale: 0.8, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.4
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {/* Modal Overlay with Backdrop Blur */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        {/* Modal Card with Framer Motion */}
        <motion.div
          className="relative w-[90%] max-w-md p-8 rounded-3xl shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            background: result.won
              ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center text-white">
            {result.won ? (
              // WIN Layout
              <>
                <div className="mb-6 animate-bounce">
                  <h2 className="text-4xl font-black mb-2">
                    🎉 YOU WON! 🎉
                  </h2>
                  <div className="h-1 w-32 bg-white/50 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                  {/* Bet Info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 text-sm mb-1">You bet on:</p>
                    <div className="text-3xl font-bold">{betNumber}</div>
                  </div>

                  {/* Result */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                    <p className="text-white/90 text-sm mb-2">Dice rolled:</p>
                    <div className="text-6xl font-black animate-pulse">
                      {result.rolled}
                    </div>
                  </div>

                  {/* Payout */}
                  <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-400/50">
                    <p className="text-yellow-100 text-sm mb-1">Payout:</p>
                    <div className="text-5xl font-black text-yellow-300 animate-pulse">
                      +{result.payout} ETH
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="mt-6 text-white/90 text-lg font-semibold animate-pulse">
                  Congratulations! 🎊
                </div>
              </>
            ) : (
              // LOSS Layout
              <>
                <div className="mb-6">
                  <h2 className="text-4xl font-black mb-2">
                    You Lost 😔
                  </h2>
                  <div className="h-1 w-32 bg-white/50 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                  {/* Bet Info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 text-sm mb-1">You bet on:</p>
                    <div className="text-3xl font-bold">{betNumber}</div>
                  </div>

                  {/* Result */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
                    <p className="text-white/90 text-sm mb-2">Dice rolled:</p>
                    <div className="text-6xl font-black">
                      {result.rolled}
                    </div>
                  </div>

                  {/* Loss Amount */}
                  <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm rounded-xl p-6 border-2 border-red-400/50">
                    <p className="text-red-100 text-sm mb-1">Lost:</p>
                    <div className="text-5xl font-black text-red-300">
                      -{betAmount} ETH
                    </div>
                  </div>
                </div>

                {/* Try Again Message */}
                <div className="mt-6 text-white/90 text-lg font-semibold">
                  Better luck next time! 🎲
                </div>
              </>
            )}
          </div>

          {/* Close Button Text */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all hover:scale-105 border border-white/30"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>


    </AnimatePresence>
  );
};

export default ResultModal;
