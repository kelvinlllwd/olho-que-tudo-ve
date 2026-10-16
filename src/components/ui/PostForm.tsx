"use client";

import { motion } from "framer-motion";
import { cn, formatNumber, getPostTypeLabel, getPlatformColor } from "@/lib/utils";
import { Video, Image, Clock, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { InstagramIcon } from "@/components/ui/PlatformIcons";
import { useState } from "react";

interface PostFormProps {
  accounts: Array<{ id: number; username: string; platform: string }>;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const postTypes = [
  { value: "FEED", label: "Feed", icon: <Image className="w-4 h-4" /> },
  { value: "REELS", label: "Reels", icon: <Video className="w-4 h-4" /> },
  { value: "STORY", label: "Story", icon: <Image className="w-4 h-4" /> },
  { value: "VIDEO", label: "Vídeo", icon: <Video className="w-4 h-4" /> },
  { value: "SHORT", label: "Short", icon: <Video className="w-4 h-4" /> },
  { value: "LIVE", label: "Live", icon: <Video className="w-4 h-4" /> },
];

export default function PostForm({ accounts, onSubmit, onCancel }: PostFormProps) {
  const [formData, setFormData] = useState({
    accountId: accounts[0]?.id || "",
    platform: "INSTAGRAM",
    type: "FEED",
    caption: "",
    mediaUrl: "",
    postedAt: new Date().toISOString().slice(0, 16),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    spend: 0,
    revenue: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        postedAt: new Date(formData.postedAt),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === Number(formData.accountId));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Conta</label>
          <select
            value={formData.accountId}
            onChange={(e) => {
              const account = accounts.find((a) => a.id === Number(e.target.value));
              setFormData({
                ...formData,
                accountId: Number(e.target.value),
                platform: account?.platform || "INSTAGRAM",
              });
            }}
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.username} ({account.platform})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de postagem</label>
          <div className="flex gap-2 flex-wrap">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  formData.type === type.value
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-background/30 text-muted-foreground hover:bg-background/50"
                )}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Legenda</label>
        <textarea
          value={formData.caption}
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          placeholder="Digite a legenda do post..."
          rows={3}
          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Data e hora</label>
          <input
            type="datetime-local"
            value={formData.postedAt}
            onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL da mídia (opcional)</label>
          <input
            type="url"
            value={formData.mediaUrl}
            onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <Eye className="w-4 h-4" /> Views
          </label>
          <input
            type="number"
            value={formData.views}
            onChange={(e) => setFormData({ ...formData, views: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <Heart className="w-4 h-4" /> Likes
          </label>
          <input
            type="number"
            value={formData.likes}
            onChange={(e) => setFormData({ ...formData, likes: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> Comentários
          </label>
          <input
            type="number"
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <Share2 className="w-4 h-4" /> Compartilhamentos
          </label>
          <input
            type="number"
            value={formData.shares}
            onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Investimento (R$)</label>
          <input
            type="number"
            value={formData.spend}
            onChange={(e) => setFormData({ ...formData, spend: Number(e.target.value) })}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Receita (R$)</label>
          <input
            type="number"
            value={formData.revenue}
            onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? "Salvando..." : "Adicionar postagem"}
        </motion.button>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            Cancelar
          </motion.button>
        )}
      </div>
    </form>
  );
}

export const postTypeOptions = postTypes;
