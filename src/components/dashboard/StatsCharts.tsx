import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

export default function StatsCharts() {
  const { dailyStats, weeklyStats, loading } = useWeeklyStats(4);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  // Get last 14 days for daily view
  const recentDaily = dailyStats.slice(-14);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <BarChart3 className="h-5 w-5 text-primary" />
          Statistiques
        </CardTitle>
        <CardDescription>
          Évolution sur les 4 dernières semaines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Par semaine</TabsTrigger>
            <TabsTrigger value="daily">Par jour</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
          </TabsList>

          {/* Weekly bar chart */}
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="weekLabel" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="tasksCompleted" name="Tâches" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="penalties" name="Pénalités" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard
                label="Total tâches"
                value={weeklyStats.reduce((s, w) => s + w.tasksCompleted, 0)}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
              />
              <SummaryCard
                label="Total pénalités"
                value={weeklyStats.reduce((s, w) => s + w.penalties, 0)}
                icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              />
              <SummaryCard
                label="Points gagnés"
                value={weeklyStats.reduce((s, w) => s + w.pointsEarned, 0)}
                icon={<BarChart3 className="h-4 w-4 text-primary" />}
              />
            </div>
          </TabsContent>

          {/* Daily line chart */}
          <TabsContent value="daily">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentDaily} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="tasksCompleted" name="Tâches" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="penalties" name="Pénalités" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Points area chart */}
          <TabsContent value="points">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentDaily} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pointsEarned"
                    name="Points gagnés"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.15)"
                    strokeWidth={2}
                  />
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
