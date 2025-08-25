import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VolumeVisualizerProps {
  volume: number; // 0-100
  isRecording: boolean;
}

const VolumeVisualizer: React.FC<VolumeVisualizerProps> = ({ volume, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVolume = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isRecording) {
        // Draw idle state
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Calculate bar height based on volume
      const barHeight = (volume / 100) * canvas.height;
      const barWidth = canvas.width / 20; // 20 bars

      // Draw volume bars
      for (let i = 0; i < 20; i++) {
        const x = i * barWidth;
        const height = barHeight * (0.5 + Math.random() * 0.5); // Add some randomness
        
        // Color based on volume level
        let color;
        if (volume > 80) {
          color = '#ef4444'; // Red for too loud
        } else if (volume > 60) {
          color = '#22c55e'; // Green for good
        } else if (volume > 30) {
          color = '#eab308'; // Yellow for too quiet
        } else {
          color = '#6b7280'; // Gray for very quiet
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height - height, barWidth - 1, height);
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(drawVolume);
    };

    drawVolume();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [volume, isRecording]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full h-15 border border-gray-200 rounded-lg bg-gray-50"
      />
      <div className="mt-2 text-center">
        <span className={`text-sm font-medium ${
          volume > 80 ? 'text-red-600' : 
          volume > 60 ? 'text-green-600' : 
          volume > 30 ? 'text-yellow-600' : 'text-gray-500'
        }`}>
          {isRecording ? `${Math.round(volume)}%` : 'Not recording'}
        </span>
      </div>
    </div>
  );
};

export default VolumeVisualizer;
