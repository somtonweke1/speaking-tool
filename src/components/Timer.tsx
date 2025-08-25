import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  isCountdown: boolean;
  onTimeUp: () => void;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ 
  duration, 
  isActive, 
  isCountdown, 
  onTimeUp, 
  className = '' 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  useEffect(() => {
    // Show warning when 30 seconds or less remain
    setIsWarning(timeLeft <= 30 && timeLeft > 0);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getTimerColor = (): string => {
    if (isCountdown) return 'text-blue-600';
    if (isWarning) return 'text-red-600';
    if (timeLeft > 30) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getProgressColor = (): string => {
    if (isCountdown) return 'bg-blue-500';
    if (isWarning) return 'bg-red-500';
    if (timeLeft > 30) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  if (!isActive && !isCountdown) {
    return (
      <div className={`text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-sm text-gray-500">Timer ready</div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {/* Timer Display */}
      <div className="relative mb-4">
        <div className="w-24 h-24 mx-auto relative">
          {/* Progress Circle */}
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
              animate={{
                strokeDasharray: 283,
                strokeDashoffset: 283 - (283 * getProgressPercentage()) / 100
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* Time Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">
                {isCountdown ? 'Get Ready' : 'Speaking Time'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2 mb-2">
        {isCountdown ? (
          <>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">Countdown</span>
          </>
        ) : (
          <>
            <div className={`w-3 h-3 rounded-full ${isWarning ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${isWarning ? 'text-red-600' : 'text-green-600'}`}>
              {isWarning ? 'Time Running Out!' : 'Recording'}
            </span>
          </>
        )}
      </div>

      {/* Warning Message */}
      {isWarning && !isCountdown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center space-x-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Wrap up your response soon!</span>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <motion.div
          className={`h-2 rounded-full ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${getProgressPercentage()}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default Timer;
