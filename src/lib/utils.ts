import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDaysArray(year: number, month: number): (Date | null)[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < start.getDay(); i++) {
    week.push(null);
  }

  for (let d = 1; d <= end.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      days.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    days.push(week);
  }

  return days.flat();
}

export function calculateROI(spend: number, revenue: number): number {
  if (spend === 0) return revenue > 0 ? Infinity : 0;
  return ((revenue - spend) / spend) * 100;
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case "INSTAGRAM":
      return "from-[#833ab2] via-[#c13583] to-[#e1306c]";
    case "TIKTOK":
      return "from-[#fe2c53] to-[#00f0f3]";
    default:
      return "from-gray-500 to-gray-600";
  }
}

export function getPostTypeLabel(type: string): string {
  switch (type) {
    case "FEED": return "Feed";
    case "REEL": return "Reel";
    case "STORY": return "Story";
    case "VIDEO": return "Vídeo";
    case "SHORT": return "Short";
    case "LIVE": return "Live";
    default: return type;
  }
}

export function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
