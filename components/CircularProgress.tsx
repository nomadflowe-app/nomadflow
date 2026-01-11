import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
      {/* Dynamic Glow Background */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-1000 group-hover:opacity-30"
        style={{
          background: `conic-gradient(from 0deg, #FFC400 ${safePercentage}%, transparent ${safePercentage}%)`,
          transform: 'rotate(-90deg)'
        }}
      />

      <svg
        className="transform -rotate-90 relative z-10 overflow-visible"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC400" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track - More visible */}
        <circle
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.15)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress with ULTRA Glow */}
        <motion.circle
          strokeWidth={strokeWidth + 2} // Slightly thicker progress
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          strokeLinecap="round"
          stroke="url(#goldGradient)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          filter="url(#glow)"
          className="drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]"
        />
      </svg>

      <div className="absolute flex flex-col items-center z-20">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-black text-white leading-none tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-[7px] text-white/70 uppercase font-black tracking-[0.2em] mt-1 drop-shadow-md">{label}</span>
      </div>
    </div>
  );
};

export default CircularProgress;
