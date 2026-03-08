import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { useFamilyChildren } from "@/hooks/useTasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, Users } from "lucide-react";

export default function StatsCharts() {
  const { t } = useTranslation();
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const { data: children = [] } = useFamilyChildren();
  const childId = selectedChild === "all" ? null : selectedChild;
  const { dailyStats, weeklyStats, loading } = useWeeklyStats(4, childId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const recentDaily = dailyStats.slice(-14);
  const childName = selectedChild === "all"
    ? t("stats.wholeFamily")
    : children.find((c) => c.user_id === selectedChild)?.name ?? t("common.child");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <BarChart3 className="h-5 w-5 text-primary" />
              {t("stats.title")}
            </CardTitle>
            <CardDescription>
              {t("stats.evolution", { name: childName })}
            </CardDescription>
          </div>
          {children.length > 0 && (
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-44">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stats.selectAll")}</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.user_id} value={child.user_id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">{t("stats.weekly")}</TabsTrigger>
            <TabsTrigger value="daily">{t("stats.daily")}</TabsTrigger>
            <TabsTrigger value="points">{t("stats.pointsTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="weekLabel" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="tasksCompleted" name={t("stats.tasksChart")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="penalties" name={t("stats.penaltiesChart")} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label={t("stats.totalTasks")} value={weeklyStats.reduce((s, w) => s + w.tasksCompleted, 0)} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
              <SummaryCard label={t("stats.totalPenalties")} value={weeklyStats.reduce((s, w) => s + w.penalties, 0)} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
              <SummaryCard label={t("stats.pointsEarned")} value={weeklyStats.reduce((s, w) => s + w.pointsEarned, 0)} icon={<BarChart3 className="h-4 w-4 text-primary" />} />
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentDaily} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="tasksCompleted" name={t("stats.tasksChart")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="penalties" name={t("stats.penaltiesChart")} stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="points">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentDaily} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="pointsEarned" name={t("stats.pointsEarned")} stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
