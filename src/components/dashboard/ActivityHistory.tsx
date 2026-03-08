import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityHistory, ActivityItem } from "@/hooks/useActivityHistory";
import { useAuth } from "@/hooks/useAuth";
import { History, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_CONFIG: Record<ActivityItem["type"], { label: string; color: string }> = {
  task_validated: { label: "Tâche validée", color: "text-secondary" },
  reward_approved: { label: "Récompense", color: "text-primary" },
  reward_rejected: { label: "Refusée", color: "text-muted-foreground" },
  penalty: { label: "Pénalité", color: "text-destructive" },
  reward_redeemed: { label: "Échangée", color: "text-primary" },
};

export default function ActivityHistory() {
  const { role } = useAuth();
  const { data: activities = [], isLoading } = useActivityHistory();
  const isParent = role === "parent";

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Historique des activités
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune activité pour le moment</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => {
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
