"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

export default function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = [
      "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
      "#ef4444", "#ec4899", "#a855f7", "#3b82f6", "#14b8a6",
    ];

    const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 1.5}px`,
            backgroundColor: piece.color,
            borderRadius: piece.id % 3 === 0 ? "50%" : "2px",
            animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
