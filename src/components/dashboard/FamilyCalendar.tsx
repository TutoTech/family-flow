import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useCalendarTasks } from "@/hooks/useCalendarTasks";
import { cn } from "@/lib/utils";

const CHILD_COLORS = [
  "bg-primary/80 text-primary-foreground",
  "bg-secondary/80 text-secondary-foreground",
  "bg-accent/80 text-accent-foreground",
  "bg-destructive/80 text-destructive-foreground",
  "bg-emerald-500/80 text-white",
  "bg-amber-500/80 text-white",
];

const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted-foreground",
  awaiting_validation: "bg-amber-500",
  validated: "bg-emerald-500",
  rejected: "bg-destructive",
  late: "bg-destructive",
  done: "bg-emerald-500",
};

export default function FamilyCalendar() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "fr" ? fr : enUS;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { tasks, children, isLoading } = useCalendarTasks(currentMonth);

  const childColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    children.forEach((child, i) => {
      map[child.user_id] = CHILD_COLORS[i % CHILD_COLORS.length];
    });
    return map;
  }, [children]);

  const childNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    children.forEach((c) => { map[c.user_id] = c.name; });
    return map;
  }, [children]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      const d = task.scheduled_for_date;
      if (!map[d]) map[d] = [];
      map[d].push(task);
    });
    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return format(d, "EEE", { locale });
    });
  }, [locale]);

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedTasks = selectedDateStr ? (tasksByDate[selectedDateStr] ?? []) : [];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t("calendar.title")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {children.map((child) => (
            <Badge key={child.user_id} className={cn("text-xs", childColorMap[child.user_id])}>
              {child.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Weekday headers */}
              {weekDays.map((day) => (
                <div key={day} className="bg-muted px-1 py-2 text-center text-xs font-medium text-muted-foreground capitalize">
                  {day}
                </div>
              ))}
              {/* Day cells */}
              {calendarDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayTasks = tasksByDate[dateStr] ?? [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "bg-card min-h-[60px] md:min-h-[80px] p-1 text-left transition-colors hover:bg-muted/50 relative",
                      !isCurrentMonth && "opacity-40",
                      isSelected && "ring-2 ring-primary ring-inset",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-0.5 space-y-0.5 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task) => {
                        const tmpl = task.task_template as any;
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "text-[10px] leading-tight rounded px-1 py-0.5 truncate",
                              childColorMap[task.assigned_to_user_id] ?? "bg-muted"
                            )}
                            title={tmpl?.title}
                          >
                            {tmpl?.icon} {tmpl?.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">
                    {format(selectedDate, "EEEE d MMMM", { locale })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("calendar.noTasks")}</p>
                  ) : (
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        {selectedTasks.map((task) => {
                          const tmpl = task.task_template as any;
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-2 rounded-lg border bg-card"
                            >
                              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_DOT[task.status] ?? "bg-muted")} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{tmpl?.icon} {tmpl?.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {tmpl?.points_reward} {t("common.pts")}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {childNameMap[task.assigned_to_user_id] ?? t("common.child")} · {format(new Date(task.due_at), "HH:mm")} · {t(`calendar.status.${task.status}`)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
