"use client";

import { motion } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import { InstagramIcon } from "@/components/ui/PlatformIcons";
import { CheckCircle, PauseCircle, AlertCircle } from "lucide-react";

interface AccountCardProps {
  account: {
    id: number;
    platform: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    status: string;
    createdAt: string;
  };
  stats?: {
    posts: number;
    views: number;
    spend: number;
    roi: number;
  };
  onClick?: () => void;
  delay?: number;
}

export default function AccountCard({ account, stats, onClick, delay = 0 }: AccountCardProps) {
  const platformConfig = {
    INSTAGRAM: {
      icon: <InstagramIcon className="w-6 h-6" />,
      color: "bg-gradient-to-br from-[#833ab2] to-[#e1306c]",
      label: "Instagram",
    },
    TIKTOK: {
      icon: <div className="w-6 h-6 flex items-center justify-center text-xs font-bold">TT</div>,
      color: "bg-gradient-to-br from-[#fe2c53] to-[#00f0f3]",
      label: "TikTok",
    },
  };

  const config = platformConfig[account.platform as keyof typeof platformConfig] || {
    icon: null,
    color: "bg-gray-500",
    label: account.platform,
  };

  const statusConfig = {
    ACTIVE: { icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />, label: "Ativa" },
    PAUSED: { icon: <PauseCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />, label: "Pausada" },
    ERROR: { icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />, label: "Erro" },
  };

  const status = statusConfig[account.status as keyof typeof statusConfig] || statusConfig.ACTIVE;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center text-white`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{account.displayName || account.username}</h3>
            <p className="text-sm text-muted-foreground">@{account.username} · {config.label}</p>
          </div>
        </div>
        {status.icon}
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold">{formatNumber(stats.views || 0)}</div>
            <div className="text-xs text-muted-foreground">Visualizações</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold">{stats.posts}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold">{stats.spend > 0 ? `R$ ${stats.spend.toFixed(2)}` : "R$ 0,00"}</div>
            <div className="text-xs text-muted-foreground">Investimento</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <div className={`text-2xl font-bold ${stats.roi > 0 ? "text-green-600 dark:text-green-400" : stats.roi < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {stats.roi > 0 ? "+" : ""}{stats.roi.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">ROI</div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
        <span>Adicionada: {new Date(account.createdAt).toLocaleDateString("pt-BR")}</span>
        <span className={`px-2 py-0.5 rounded-full ${config.color} text-white/90`}>
          {status.label}
        </span>
      </div>
    </motion.div>
  );
}