"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/PlatformIcons";
import EyeAnimation from "@/components/EyeAnimation";
import { formatNumber, formatCurrency, calculateROI } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MetricData {
  totals: any;
  byAccount: any[];
  byPlatform: any[];
  dailyArray: any[];
  postTypeData: any[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [activeChart, setActiveChart] = useState<"views" | "spend" | "revenue" | "posts">("views");
  const [activityLevel, setActivityLevel] = useState(0);

  const fetchData = async (range: string) => {
    setLoading(true);
    try {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "365d" ? 365 : 30;
      const res = await fetch(`/api/analytics?range=${range}`, {
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        setData({
          totals: result.totals || {},
          byAccount: result.byAccount || [],
          byPlatform: result.byPlatform || [],
          dailyArray: result.dailyArray || [],
          postTypeData: result.postTypeData || [],
        });
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange]);

  const ranges = [
    { value: "7d", label: "7 dias" },
    { value: "30d", label: "30 dias" },
    { value: "90d", label: "90 dias" },
    { value: "365d", label: "365 dias" },
  ];

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <EyeAnimation size={120} interactive={false} />
      </div>
    );
  }

  if (!data) return null;

  const { totals, byAccount, byPlatform, dailyArray, postTypeData } = data;

  const maxDaily = Math.max(...dailyArray.map((d) => d.views), 1);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 bg-clip-text text-transparent">
            Analíticas
          </h1>
          <p className="text-muted-foreground mt-2">
            Dados detalhados do seu desempenho nas redes sociais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-background/30 rounded-xl">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  selectedRange === range.value
                    ? "bg-primary-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card"
            whileHover={{ scale: 1.05 }}
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>
        </div>
      </motion.div>

      {/* Eye Animation */}
      <div className="flex justify-center">
        <EyeAnimation size={140} interactive={true} activityLevel={activityLevel} />
      </div>

      {/* KPI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <KPICard
          label="Receita Total"
          value={formatCurrency(totals?.totalRevenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="green"
        />
        <KPICard
          label="Investimento"
          value={formatCurrency(totals?.totalSpend || 0)}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="red"
        />
        <KPICard
          label="ROI"
          value={`${totals?.roi > 0 ? "+" : ""}${totals?.roi.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color={totals?.roi > 0 ? "green" : "red"}
        />
        <KPICard
          label="Engajamento"
          value={formatNumber((totals?.totalLikes || 0) + (totals?.totalComments || 0) + (totals?.totalShares || 0))}
          icon={<Heart className="w-6 h-6 text-white" />}
          color="pink"
        />
      </motion.div>

      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-4"
      >
        {[
          { value: "views", label: "Visualizações", icon: <Eye className="w-4 h-4" /> },
          { value: "spend", label: "Investimento", icon: <DollarSign className="w-4 h-4" /> },
          { value: "revenue", label: "Receita", icon: <DollarSign className="w-4 h-4" /> },
          { value: "posts", label: "Posts", icon: <FileText className="w-4 h-4" /> },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveChart(opt.value as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeChart === opt.value
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
                : "glass-card text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-8"
      >
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          Evolução ao longo do tempo
        </h3>

        <div className="h-[300px]">
          {dailyArray.length > 0 ? (
            <LineChartComponent
              data={dailyArray}
              metric={activeChart}
              max={maxDaily}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para este período
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Por Plataforma
          </h3>
          <div className="space-y-4">
            {byPlatform?.map((p: any) => (
              <div key={p.platform} className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                    p.platform === "INSTAGRAM"
                      ? "from-[#833ab2] via-[#c13583] to-[#e1306c]"
                      : "from-[#fe2c53] to-[#00f0f3]"
                  )}
                >
                  {p.platform === "INSTAGRAM" ? (
                    <InstagramIcon className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{p.platform}</span>
                    <span className="text-sm text-muted-foreground">
                      {p.posts} posts
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatNumber(p.views)} views · {formatCurrency(p.spend)} investido
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.views / maxDaily) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Post Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Tipos de Postagem
          </h3>
          <div className="space-y-4">
            {postTypeData?.map((item: any) => (
              <div key={item.type} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                  {item.type}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} posts
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / Math.max(...postTypeData.map((p: any) => p.count), 1)) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Performing Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Contas com Melhor Desempenho
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3">Conta</th>
                <th className="pb-3">Posts</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Engajamento</th>
                <th className="pb-3">Investimento</th>
                <th className="pb-3">Receita</th>
                <th className="pb-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {byAccount?.map((a: any) => (
                <tr key={a.id} className="border-t border-border/30">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500" />
                      <span className="font-medium">{a.username}</span>
                    </div>
                  </td>
                  <td className="py-3">{a.postCount || 0}</td>
                  <td className="py-3">{formatNumber(a.views)}</td>
                  <td className="py-3">{formatNumber(a.likes + a.comments)}</td>
                  <td className="py-3">{formatCurrency(a.spend)}</td>
                  <td className="py-3">{formatCurrency(a.revenue)}</td>
                  <td className="py-3">
                    <span className={cn(
                      "font-medium",
                      a.roi > 0 ? "text-green-400" : a.roi < 0 ? "text-red-400" : "text-muted-foreground"
                    )}>
                      {a.roi > 0 ? "+" : ""}{a.roi.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function KPICard({ label, value, icon, color }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-rose-500",
    pink: "from-pink-500 to-fuchsia-500",
    blue: "from-blue-500 to-cyan-500",
  };
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function LineChartComponent({ data, metric, max }: {
  data: any[];
  metric: string;
  max: number;
}) {
  const metricLabels: Record<string, string> = {
    views: "Visualizações",
    spend: "Investimento",
    revenue: "Receita",
    posts: "Posts",
  };

  const formatValue = (val: number) => {
    if (metric === "spend" || metric === "revenue") return formatCurrency(val);
    return formatNumber(val);
  };

  return (
    <div className="h-full flex items-end justify-between gap-2">
      {data.map((d, i) => {
        const value = d[metric] || 0;
        const height = data.length > 1 ? (value / max) * 100 : 0;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center group">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-secondary-500 dark:from-secondary-500 dark:to-purple-500 relative overflow-hidden"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 5)}%` }}
              transition={{ duration: 0.8, delay: i * 0.02 }}
            >
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                {formatValue(value)}
              </div>
            </motion.div>
            <span className="text-xs text-muted-foreground mt-2 rotate-45 origin-top-left">
              {new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
