"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Video, Trash2, RefreshCw, Edit3, ExternalLink, Copy, Check, Users, CheckCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/PlatformIcons";
import { cn, getPlatformColor } from "@/lib/utils";
import EyeAnimation from "@/components/EyeAnimation";
import { useAuth } from "@/contexts/AuthContext";

interface Account {
  id: number;
  platform: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  accessToken?: string | null;
  status: string;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [copiedToken, setCopiedToken] = useState<number | null>(null);
  const [activityLevel, setActivityLevel] = useState(0);

  const [formData, setFormData] = useState({
    platform: "INSTAGRAM",
    username: "",
    displayName: "",
    accessToken: "",
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setAccounts(data.accounts);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAccount ? `/api/accounts/manage` : "/api/accounts";
    const method = editingAccount ? "PUT" : "POST";
    const body = editingAccount
      ? { accountId: editingAccount.id, ...formData }
      : { ...formData, ipAddress: "auto" };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowAddForm(false);
      setEditingAccount(null);
      setFormData({ platform: "INSTAGRAM", username: "", displayName: "", accessToken: "" });
      fetchAccounts();
      setActivityLevel(80);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/accounts/manage?accountId=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) fetchAccounts();
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      username: account.username,
      displayName: account.displayName || account.username,
      accessToken: account.accessToken || "",
    });
    setShowAddForm(true);
  };

  const handleSync = async (id: number) => {
    const res = await fetch(`/api/accounts/manage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accountId: id, action: "sync" }),
    });
    if (res.ok) {
      fetchAccounts();
      setActivityLevel(50);
    }
  };

  const copyToken = (token: string | null | undefined, id: number) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const platformOptions = [
    { value: "INSTAGRAM", label: "Instagram", icon: <InstagramIcon className="w-5 h-5" /> },
    { value: "TIKTOK", label: "TikTok", icon: <Video className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 bg-clip-text text-transparent">
            Gerenciar Contas
          </h1>
          <p className="text-muted-foreground mt-2">
            {accounts.length} contas conectadas · {user?.name}
          </p>
        </div>
        <motion.button
          onClick={() => {
            setShowAddForm(true);
            setEditingAccount(null);
            setFormData({ platform: "INSTAGRAM", username: "", displayName: "", accessToken: "" });
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-5 h-5" />
          Adicionar Conta
        </motion.button>
      </motion.div>

      {/* Eye Animation */}
      <div className="flex justify-center">
        <EyeAnimation size={160} interactive={true} activityLevel={activityLevel} />
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
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
              className="glass-card rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingAccount ? "Editar Conta" : "Adicionar Nova Conta"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAccount(null);
                  }}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Plataforma</label>
                  <div className="flex gap-3">
                    {platformOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, platform: opt.value })}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                          formData.platform === opt.value
                            ? "border-primary-500 bg-primary-50/20"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nome de usuário *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="@seu_usuario"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O nome de usuário é obrigatório e usado para identificar a conta.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nome de exibição</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Nome amigável para a conta"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Access Token / API Key
                  </label>
                  <input
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="Token de acesso (opcional para uso futuro)"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium"
                    whileHover={{ scale: 1.02 }}
                  >
                    {editingAccount ? "Salvar alterações" : "Adicionar conta"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAccount(null);
                    }}
                    className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted/50"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando contas...</div>
        ) : accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass-card rounded-2xl"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground mb-6">
              Adicione suas contas do Instagram e TikTok para começar o monitoramento.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium"
            >
              Adicionar primeira conta
            </button>
          </motion.div>
        ) : (
          accounts.map((account, idx) => {
            const gradient = getPlatformColor(account.platform);
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold`}>
                    {account.platform === "INSTAGRAM" ? (
                      <InstagramIcon className="w-8 h-8" />
                    ) : (
                      <Video className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {account.displayName || account.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{account.username} · {account.platform === "INSTAGRAM" ? "Instagram" : "TikTok"}
                    </p>
                    {account.ipAddress && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {account.ipAddress}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {account.accessToken && (
                    <button
                      onClick={() => copyToken(account.accessToken, account.id)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                      title={copiedToken === account.id ? "Copiado!" : "Copiar token"}
                    >
                      {copiedToken === account.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleSync(account.id)}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                    title="Sincronizar"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 glass-card rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Integração com APIs
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-background/30 rounded-xl">
              <h4 className="font-medium mb-2">Instagram Graph API</h4>
              <p className="text-sm text-muted-foreground">
                Para puxar dados reais do Instagram, você precisa de um token de acesso válido.
                Obtenha-o em{" "}
                <a
                  href="https://developers.facebook.com/docs/instagram-graph-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  developers.facebook.com
                </a>
                .
              </p>
            </div>
            <div className="p-4 bg-background/30 rounded-xl">
              <h4 className="font-medium mb-2">TikTok API</h4>
              <p className="text-sm text-muted-foreground">
                Para integrar com TikTok, registre seu app no{" "}
                <a
                  href="https://developers.tiktok.com/doc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  TikTok for Developers
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {accounts.length >= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl"
        >
          <p className="text-sm text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Parabéns! Você atingiu o nível de 5 contas conectadas.
          </p>
        </motion.div>
      )}
    </div>
  );
}
