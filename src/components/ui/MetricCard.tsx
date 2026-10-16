"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  onClick?: () => void;
  delay?: number;
}

export default function MetricCard({
  label,
  value,
  icon,
  trend = "neutral",
  trendValue,
  onClick,
  delay = 0,
}: MetricCardProps) {
  const trendIcon = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    neutral: <Minus className="w-4 h-4" />,
  };

  const trendColor = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 ${trendColor[trend]}`}>
            {trendIcon[trend]}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1 text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}