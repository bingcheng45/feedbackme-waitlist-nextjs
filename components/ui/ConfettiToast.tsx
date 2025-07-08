"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

interface ConfettiToastProps {
  position: number;
  email: string;
  isExisting: boolean;
}

export function ConfettiToast({ position, email, isExisting }: ConfettiToastProps) {
  useEffect(() => {
    if (!isExisting) {
      // Trigger confetti animation for new registrations
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isExisting]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber text-black rounded-lg p-4 shadow-lg border-2 border-feedbackme-yellow/30"
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🎉</div>
        <div className="flex-1">
          <div className="font-bold text-lg">
            {isExisting ? "Already on the waitlist!" : "Welcome to the waitlist!"}
          </div>
          <div className="text-sm opacity-90">
            You're <span className="font-bold">#{position}</span> in line
          </div>
          <div className="text-xs opacity-75 mt-1">
            <span className="font-bold underline">{email}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">#{position}</div>
          <div className="text-xs opacity-75">Position</div>
        </div>
      </div>
    </motion.div>
  );
} 