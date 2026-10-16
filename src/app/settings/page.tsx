"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Globe,
  Smartphone,
  Key,
  Save,
  Copy,
  Check,
  MapPin,
  Clock,
  Trash2,
  Users,
  UserCheck,
  Bell,
  Mail,
} from "lucide-react";
import EyeAnimation from "@/components/EyeAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface IPLog {
  id: number;
  ipAddress: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [ipLogs, setIpLogs] = useState<IPLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchIPLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ip", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setIpLogs(data.logs);
    } catch {}
    setLoading(false);
  };

  const detectIP = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setCurrentIP(data.ip);
    } catch {
      setCurrentIP("127.0.0.1");
    }
  };

  useEffect(() => {
    fetchIPLogs();
    detectIP();
  }, []);

  const saveIPBinding = async () => {
    await fetch("/api/ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ipAddress: currentIP,
        location: "Auto-detectado",
      }),
    });
    fetchIPLogs();
    setActivityLevel(60);
  };

  const copyToken = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua segurança, vinculação de IP e preferências
        </p>
      </motion.div>

      {/* Eye Animation */}
      <div className="flex justify-center">
        <EyeAnimation size={140} interactive={true} activityLevel={activityLevel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Perfil
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2">Nome</label>
                <div className="p-3 bg-background/30 rounded-xl">{user?.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2">E-mail</label>
                <div className="p-3 bg-background/30 rounded-xl break-all">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2">Função</label>
                <div className="p-3 bg-background/30 rounded-xl flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs font-medium",
                      user?.role === "OWNER"
                        ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400"
                        : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400"
                    )}
                  >
                    {user?.role === "OWNER" ? "Proprietário" : "Membro"}
                  </span>
                </div>
              </div>
              {user?.partnerCode && (
                <div>
                  <label className="text-sm font-medium mb-2">Código de Parceiro</label>
                  <div className="p-3 bg-background/30 rounded-xl font-mono text-sm flex items-center justify-between">
                    <span>{user.partnerCode}</span>
                    <button
                      onClick={() => copyToken(user.partnerCode!)}
                      className="p-1 rounded hover:bg-muted/50 transition-all"
                    >
                      {copied === user.partnerCode ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Segurança
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Autenticação de Dois Fatores</div>
                    <div className="text-sm text-muted-foreground">Proteja sua conta com 2FA</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/20 text-primary-400"
                >
                  Ativar
                </motion.button>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Notificações por e-mail</div>
                    <div className="text-sm text-muted-foreground">Receba relatórios semanais</div>
                  </div>
                </div>
                <label className="relative inline-flex h-6 w-10 items-center rounded-full">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <span className="absolute inline-block h-6 w-10 rounded-full bg-secondary-500" />
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Alertas
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Dia sem postagem</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Baixo desempenho (ROI negativo)</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conta com erro de conexão</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Orçamento gasto (80%+)</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - IP Binding & Logs */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Vínculo de IP
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Monitore e registre os endereços IP que acessam sua conta.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">IP detectado</label>
                <div className="p-3 bg-background/30 rounded-xl font-mono text-lg flex items-center justify-between">
                  <span>{currentIP || "Carregando..."}</span>
                  <button
                    onClick={detectIP}
                    className="p-1 rounded hover:bg-muted/50 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Localização</label>
                <div className="p-3 bg-background/30 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">
                    {currentIP ? "Localização automática" : "Aguardando detecção..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                onClick={saveIPBinding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <Save className="w-4 h-4" />
                Salvar vinculo de IP
              </motion.button>
              <button
                onClick={fetchIPLogs}
                className="px-4 py-2 rounded-xl glass-card"
              >
                Atualizar lista
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Histórico de IPs ({ipLogs.length})
              </h3>
              <button
                onClick={() => setActivityLevel(40)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-all"
              >
                🔄
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3">IP</th>
                    <th className="pb-3">Localização</th>
                    <th className="pb-3">Device</th>
                    <th className="pb-3">Data/Hora</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ipLogs.map((log) => (
                    <tr key={log.id} className="border-t border-border/30">
                      <td className="py-3 font-mono text-sm">{log.ipAddress}</td>
                      <td className="py-3">
                        {log.city ? `${log.city}, ${log.country}` : log.location || "Desconhecido"}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {log.userAgent || "N/A"}
                      </td>
                      <td className="py-3 text-sm">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => copyToken(log.ipAddress)}
                          className="p-1 rounded hover:bg-muted/50 transition-all"
                        >
                          {copied === log.ipAddress ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ipLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro de IP ainda.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
