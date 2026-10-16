"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EyeAnimation from "@/components/EyeAnimation";
import MetricCard from "@/components/ui/MetricCard";
import AccountCard from "@/components/ui/AccountCard";
import PostForm from "@/components/ui/PostForm";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import {
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  DollarSign,
  Hash,
  Plus,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Video,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
  CheckCircle,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/PlatformIcons";
import { cn, formatNumber, formatCurrency, calculateROI } from "@/lib/utils";

interface Account {
  id: number;
  platform: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  status: string;
  createdAt: string;
  ipAddress?: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [activityLevel, setActivityLevel] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/metrics?days=30", {
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simulate system activity
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityLevel(Math.floor(Math.random() * 100) + 20);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePostSubmit = async (postData: any) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        setShowPostForm(false);
        fetchData();
        setActivityLevel(120);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <EyeAnimation size={64} interactive={false} />
          <p className="mt-6 text-muted-foreground">O olho está carregando os dados...</p>
        </motion.div>
      </div>
    );
  }

  const { totals, byAccount, byPlatform, accounts } = data || {
    totals: {},
    byAccount: [],
    byPlatform: [],
    accounts: [],
  };

  if (!data && !loading) {
    return (
      <div className="text-center py-20">
        <EyeAnimation size={64} interactive={false} />
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Recarregar dados
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Eye */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoramento em tempo real de todas as suas contas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={fetchData}
            className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-all"
            whileHover={{ rotate: 90, scale: 1.1 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => setShowPostForm(true)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white font-medium flex items-center gap-2 hover:bg-primary-700 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="w-4 h-4" />
            Nova postagem
          </motion.button>
        </div>
      </motion.div>

      

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <MetricCard
          label="Contas Ativas"
          value={totals?.totalAccounts || 0}
          icon={<Users className="w-6 h-6 text-primary" />}
          trend={totals?.activeAccounts > 0 ? "up" : "neutral"}
          trendValue={totals?.activeAccounts ? `${totals.activeAccounts} ativas` : undefined}
        />
        <MetricCard
          label="Total de Posts"
          value={totals?.totalPosts || 0}
          icon={<FileText className="w-6 h-6 text-primary" />}
          trend="up"
          trendValue={`+${totals?.totalPosts || 0} este mês`}
        />
        <MetricCard
          label="Visualizações"
          value={formatNumber(totals?.totalViews || 0)}
          icon={<Eye className="w-6 h-6 text-primary" />}
          trend="up"
          trendValue={`+${formatNumber(Math.round((totals?.totalViews || 0) / 10))}`}
        />
        <MetricCard
          label="Engajamento Total"
          value={formatNumber((totals?.totalLikes || 0) + (totals?.totalComments || 0) + (totals?.totalShares || 0))}
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
          trend="up"
        />
        <MetricCard
          label="Investimento"
          value={formatCurrency(totals?.totalSpend || 0)}
          icon={<DollarSign className="w-6 h-6 text-primary" />}
          trend={totals?.totalSpend > 0 ? "down" : "neutral"}
        />
        <MetricCard
          label="ROI"
          value={`${totals?.roi > 0 ? "+" : ""}${totals?.roi.toFixed(1)}%`}
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          trend={totals?.roi > 0 ? "up" : totals?.roi < 0 ? "down" : "neutral"}
        />
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {byPlatform?.map((p: any) => (
          <motion.div
            key={p.platform}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                  p.platform === "INSTAGRAM"
                    ? "bg-gradient-to-br from-[#833ab2] to-[#e1306c]"
                    : "bg-gradient-to-br from-[#fe2c53] to-[#00f0f3]"
                )}
              >
                  {p.platform === "INSTAGRAM" ? (
                    <InstagramIcon className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </div>
              <h3 className="font-bold text-lg">{p.platform}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{p.posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatNumber(p.views)}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(p.spend)}</div>
                <div className="text-xs text-muted-foreground">Investimento</div>
              </div>
              <div>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    p.revenue > p.spend ? "text-green-400" : "text-red-400"
                  )}
                >
                  {formatCurrency(p.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">Receita</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Accounts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Suas Contas</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {accounts?.length || 0} contas conectadas
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts?.map((account: Account, idx: number) => (
            <AccountCard
              key={account.id}
              account={account}
              stats={byAccount?.find((a: any) => a.id === account.id)}
              delay={idx * 0.1}
              onClick={() => {}}
            />
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => (window.location.href = "/accounts")}
            className="bg-card border border-border border-dashed rounded-xl p-6 flex flex-col items-center justify-center h-48 hover:border-primary/50 transition-all group"
          >
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Adicionar nova conta
            </p>
          </motion.button>
        </div>
      </motion.div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <CalendarHeatmap
          activities={data?.dailyArray?.map((d: any) => ({
            date: d.date,
            action: d.posts > 0 ? "POSTED" : "NO_POST",
            account: null,
          })) || []}
        />
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Status do Sistema</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Conexão de Dados</p>
              <p className="text-sm text-muted-foreground">
                APIs conectadas e sincronizando
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Monitoramento 24/7</p>
              <p className="text-sm text-muted-foreground">
                Ativo desde {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">IP Binding</p>
              <p className="text-sm text-muted-foreground">
                Proteção ativa para {accounts?.length || 0} contas
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Post Form Modal */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Nova Postagem</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                >
                  ✕
                </button>
              </div>

              <PostForm
                accounts={
                  accounts?.map((a: Account) => ({
                    id: a.id,
                    username: a.username,
                    platform: a.platform,
                  })) || []
                }
                onSubmit={handlePostSubmit}
                onCancel={() => setShowPostForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
