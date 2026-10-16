"use client";

import { Theme } from "@/contexts/ThemeContext";
import { Sun, Moon, Bell, Search } from "lucide-react";
import EyeAnimation from "@/components/EyeAnimation";
import { motion } from "framer-motion";

interface TopBarProps {
  theme: Theme;
  toggleTheme: () => void;
  activityLevel: number;
}

export default function TopBar({ theme, toggleTheme, activityLevel }: TopBarProps) {
  return (
    <header className="glass-card border-b px-6 py-4 flex items-center justify-between h-20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contas, posts..."
            className="pl-10 pr-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          animate={{ scale: activityLevel > 0 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          <EyeAnimation size={60} interactive={false} activityLevel={activityLevel} />
        </motion.div>

        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-all duration-200">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>
    </header>
  );
}
