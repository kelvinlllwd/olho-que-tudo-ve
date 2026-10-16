"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface CalendarHeatmapProps {
  activities: Array<{
    date: string;
    accountId?: number | null;
    account?: { username: string; platform: string } | null;
    action: string;
    notes?: string | null;
  }>;
}

export default function CalendarHeatmap({ activities }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const activityMap = new Map<string, any[]>();
  activities.forEach((a) => {
    const day = dayjs(a.date).format("YYYY-MM-DD");
    if (!activityMap.has(day)) activityMap.set(day, []);
    activityMap.get(day)!.push(a);
  });

  const goToPrev = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  const goToNext = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  const goToToday = () => setCurrentMonth(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getActivityForDay = (day: number) => {
    const dateStr = dayjs(new Date(year, month, day)).format("YYYY-MM-DD");
    return activityMap.get(dateStr) || [];
  };

  const getActivityLevel = (day: number) => {
    const acts = getActivityForDay(day);
    if (acts.length === 0) return 0;
    const hasPost = acts.some((a) => a.action === "POSTED");
    const hasNoPost = acts.some((a) => a.action === "NO_POST");
    if (hasPost) return 4;
    if (hasNoPost) return 1;
    return acts.length > 0 ? 2 : 0;
  };

  const getDayColor = (level: number) => {
    const colors = [
      "bg-muted/20",
      "bg-blue-500/20",
      "bg-purple-500/20",
      "bg-secondary-500/20",
      "bg-green-500/20",
    ];
    return colors[level] || colors[0];
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const selectedDayActivities = selectedDate
    ? getActivityForDay(selectedDate.getDate())
    : [];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Calendário de Atividade</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {dayjs(currentMonth).format("MMMM YYYY")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={goToToday}
            className="px-3 py-1 rounded-lg text-sm bg-background/30 hover:bg-background/50 transition-all"
          >
            Hoje
          </motion.button>
          <motion.button
            onClick={goToPrev}
            className="p-1 rounded-lg hover:bg-muted/50 transition-all"
            whileHover={{ scale: 1.1 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={goToNext}
            className="p-1 rounded-lg hover:bg-muted/50 transition-all"
            whileHover={{ scale: 1.1 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-10" />;
          }

          const activityLevel = getActivityLevel(day);
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
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={cn(
                "h-12 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                getDayColor(activityLevel),
                isToday && "ring-2 ring-primary-500",
                isSelected && "ring-2 ring-secondary-500 bg-secondary-500/30",
                activityLevel > 0 && "hover:brightness-110"
              )}
            >
              <span className="relative z-10">{day}</span>
              {activityLevel > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedDate && selectedDateActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 pt-4 border-t border-border/30"
        >
          <h4 className="text-sm font-medium mb-3">
            Atividade de {dayjs(selectedDate).format("DD [de] MMMM")}
          </h4>
          <div className="space-y-2">
            {selectedDateActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                {activity.action === "POSTED" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-yellow-400" />
                )}
                <span>
                  {activity.account?.username || "Conta desconhecida"}: {activity.notes || activity.action}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {selectedDate && selectedDateActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 pt-4 border-t border-border/30"
        >
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada para este dia.
          </p>
        </motion.div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted/20" />
          <span>Nenhuma atividade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/20" />
          <span>Sem postagem</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20" />
          <span>Postado</span>
        </div>
      </div>
    </div>
  );
}
