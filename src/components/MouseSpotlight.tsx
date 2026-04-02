"use client";

import { useEffect, useRef } from "react";

/**
 * MouseSpotlight — Creates a soft radial glow that follows the cursor.
 * Similar to the effect on Apple's product pages.
 */
export default function MouseSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let animationId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    // Smooth interpolation for buttery movement
    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (spotlight) {
        spotlight.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed top-0 left-0 z-[1] pointer-events-none w-[400px] h-[400px] rounded-full opacity-0 md:opacity-100 transition-opacity duration-1000"
      style={{
        background:
          "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0.02) 40%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
