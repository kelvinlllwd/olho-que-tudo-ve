"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { Eye } from "lucide-react";

interface EyeAnimationProps {
  size?: number;
  interactive?: boolean;
  activityLevel?: number;
  onEyeClick?: () => void;
}

export default function EyeAnimation({
  size = 64,
  interactive = false,
  activityLevel = 0,
  onEyeClick,
}: EyeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const pupilX = useSpring(useTransform(mouseX, [0, size], [-4, 4]), springConfig);
  const pupilY = useSpring(useTransform(mouseY, [0, size], [-4, 4]), springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !interactive) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);
      setMousePos({ x, y });
    },
    [interactive, mouseX, mouseY, size]
  );

  useEffect(() => {
    if (!interactive) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, interactive]);

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!interactive) return;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: size, height: size }}
      onClick={onEyeClick}
    >
      <motion.div
        className="absolute rounded-full bg-primary-500"
        style={{ width: size, height: size }}
        animate={{
          scale: activityLevel > 0 ? [1, 1.1, 1] : 1,
          opacity: activityLevel > 0 ? [0.8, 1, 0.8] : 1,
        }}
        transition={{ duration: 0.5, repeat: activityLevel > 0 ? Infinity : 0 }}
      >
        <Eye className="w-full h-full text-white p-1" />
      </motion.div>
    </div>
  );
}