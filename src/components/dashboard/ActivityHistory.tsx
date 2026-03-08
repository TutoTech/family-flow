import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivityHistory, ActivityItem } from "@/hooks/useActivityHistory";
import { useAuth } from "@/hooks/useAuth";
import { History, Star, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_CONFIG: Record<ActivityItem["type"], { label: string; color: string; category: string }> = {
  task_validated: { label: "Tâche validée", color: "text-secondary", category: "tasks" },
  reward_approved: { label: "Récompense", color: "text-primary", category: "rewards" },
  reward_rejected: { label: "Refusée", color: "text-muted-foreground", category: "rewards" },
  penalty: { label: "Pénalité", color: "text-destructive", category: "penalties" },
  reward_redeemed: { label: "Échangée", color: "text-primary", category: "rewards" },
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Tout",
  tasks: "Tâches",
  rewards: "Récompenses",
  penalties: "Pénalités",
};

export default function ActivityHistory() {
  const { role } = useAuth();
  const { data: activities = [], isLoading } = useActivityHistory();
  const isParent = role === "parent";

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [childFilter, setChildFilter] = useState("all");

  const childNames = useMemo(() => {
    if (!isParent) return [];
    const map = new Map<string, string>();
    activities.forEach((a) => {
      if (a.childId && a.childName) map.set(a.childId, a.childName);
    });
    return Array.from(map.entries());
  }, [activities, isParent]);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (categoryFilter !== "all" && TYPE_CONFIG[a.type].category !== categoryFilter) return false;
      if (childFilter !== "all" && a.childId !== childFilter) return false;
      return true;
    });
  }, [activities, categoryFilter, childFilter]);

  const hasFilters = categoryFilter !== "all" || childFilter !== "all";

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Historique des activités
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isParent && childNames.length > 0 && (
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Tous les enfants</SelectItem>
                {childNames.map(([id, name]) => (
                  <SelectItem key={id} value={id} className="text-xs">{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {hasFilters && (
            <button
              onClick={() => { setCategoryFilter("all"); setChildFilter("all"); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{hasFilters ? "Aucun résultat pour ces filtres" : "Aucune activité pour le moment"}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((activity) => {
              const config = TYPE_CONFIG[activity.type];
              const pointsPositive = activity.points > 0;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {isParent && activity.childName && (
                        <span>{activity.childName}</span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  {activity.points !== 0 && (
                    <span
                      className={`text-xs font-semibold flex items-center gap-0.5 flex-shrink-0 ${
                        pointsPositive ? "text-secondary" : "text-destructive"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      {pointsPositive ? "+" : ""}
                      {activity.points}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
