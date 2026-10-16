"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Edit3, Save, Plus } from "lucide-react";
import EyeAnimation from "@/components/EyeAnimation";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface ActivityEntry {
  id: number;
  date: string;
  action: string;
  accountId?: number | null;
  account?: { username: string; platform: string } | null;
  notes?: string | null;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLevel, setActivityLevel] = useState(0);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await fetch(`/api/daily-activity?year=${year}&month=${month}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchActivity();
  }, [currentMonth]);

  const activityMap = new Map<string, ActivityEntry[]>();
  activities.forEach((a) => {
    const day = dayjs(a.date).format("YYYY-MM-DD");
    if (!activityMap.has(day)) activityMap.set(day, []);
    activityMap.get(day)!.push(a);
  });

  const getDayActivities = (day: number) => {
    const dateStr = dayjs(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)).format("YYYY-MM-DD");
    return activityMap.get(dateStr) || [];
  };

  const getActivityLevel = (day: number) => {
    const acts = getDayActivities(day);
    if (acts.length === 0) return 0;
    const hasPost = acts.some((a) => a.action === "POSTED");
    if (hasPost) return 4;
    return acts.length > 0 ? 2 : 0;
  };

  const getDayColor = (level: number) => {
    const colors = ["bg-muted/20", "bg-blue-500/20", "bg-purple-500/20", "bg-yellow-500/20", "bg-green-500/20"];
    return colors[level] || colors[0];
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedDayActs = selectedDate ? getDayActivities(selectedDate.getDate()) : [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 bg-clip-text text-transparent">
            Calendário de Atividades
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu histórico de postagens e marque os dias sem atividade
          </p>
        </div>
        <button
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today);
            setSelectedDate(today);
          }}
          className="px-4 py-2 rounded-xl glass-card"
        >
          Hoje
        </button>
      </motion.div>

      {/* Eye Animation */}
      <div className="flex justify-center">
        <EyeAnimation size={160} interactive={true} activityLevel={activityLevel} />
      </div>

      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {dayjs(currentMonth).format("MMMM YYYY")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentMonth(new Date(year, month - 1, 1))
              }
              className="p-2 rounded-lg hover:bg-muted/50 transition-all"
            >
              ←
            </button>
            <button
              onClick={() =>
                setCurrentMonth(new Date(year, month + 1, 1))
              }
              className="p-2 rounded-lg hover:bg-muted/50 transition-all"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-xs font-medium text-muted-foreground py-3">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-14" />;
            }

            const level = getActivityLevel(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected =
              selectedDate &&
              day === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();

            return (
              <motion.button
                key={day}
                onClick={() => {
                  setSelectedDate(new Date(year, month, day));
                  setActivityLevel(level * 20);
                }}
                className={cn(
                  "h-14 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                  getDayColor(level),
                  isToday && "ring-2 ring-primary-500",
                  isSelected && "ring-2 ring-secondary-500"
                )}
              >
                <span className="relative z-10">{day}</span>
                {level > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        level === 4
                          ? "bg-green-400"
                          : level === 2
                          ? "bg-purple-400"
                          : "bg-yellow-400"
                      )}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 pt-6 border-t border-border/30"
          >
            <h3 className="text-lg font-semibold mb-4">
              {dayjs(selectedDate).format("DD [de] MMMM")}
            </h3>
            {selectedDayActs.length > 0 ? (
              <div className="space-y-3">
                {selectedDayActs.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-background/30 rounded-xl"
                  >
                    {activity.action === "POSTED" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-400" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium">
                        {activity.account?.username || "Conta"}:
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {activity.notes || activity.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma atividade registrada para este dia.</p>
                <button
                  onClick={async () => {
                    const dateStr = dayjs(selectedDate).toISOString();
                    await fetch("/api/daily-activity", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        date: dateStr,
                        action: "NO_POST",
                        notes: "Nenhuma postagem hoje",
                      }),
                    });
                    fetchActivity();
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm"
                >
                  Marcar como sem postagem
                </button>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted/20" /> Nenhuma atividade
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500/20" /> Sem postagem
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20" /> Postado
          </div>
        </div>
      </div>
    </div>
  );
}
