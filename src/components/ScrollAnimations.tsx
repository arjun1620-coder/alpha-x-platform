"use client";

import { useEffect } from "react";

/**
 * ScrollAnimations — Apple-style IntersectionObserver.
 * Activates `.animate-on-scroll` and `.animate-on-scroll-scale` elements.
 */
export default function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    // Observe both animation types
    document.querySelectorAll(".animate-on-scroll, .animate-on-scroll-scale").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
