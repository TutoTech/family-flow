import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useActivityHistory, ActivityItem } from "@/hooks/useActivityHistory";
import { useAuth } from "@/hooks/useAuth";
import { History, Star, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

const RECENT_COUNT = 10;

function ActivityRow({
  activity,
  config,
  isParent,
  dateFnsLocale,
}: {
  activity: ActivityItem;
  config: { label: string; color: string };
  isParent: boolean;
  dateFnsLocale: Locale;
}) {
  const pointsPositive = activity.points > 0;
  return (
    <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-lg flex-shrink-0">{activity.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{activity.title}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {isParent && activity.childName && <span>{activity.childName}</span>}
          <span>
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: dateFnsLocale })}
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
}

export default function ActivityHistory() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { data: activities = [], isLoading } = useActivityHistory();
  const isParent = role === "parent";

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [childFilter, setChildFilter] = useState("all");
  const [olderOpen, setOlderOpen] = useState(false);

  const TYPE_CONFIG: Record<ActivityItem["type"], { label: string; color: string; category: string }> = {
    task_validated: { label: t("activity.taskValidated"), color: "text-secondary", category: "tasks" },
    reward_approved: { label: t("activity.reward"), color: "text-primary", category: "rewards" },
    reward_rejected: { label: t("activity.rewardRejected"), color: "text-muted-foreground", category: "rewards" },
    penalty: { label: t("activity.penalty"), color: "text-destructive", category: "penalties" },
    reward_redeemed: { label: t("activity.rewardRedeemed"), color: "text-primary", category: "rewards" },
  };

  const CATEGORY_LABELS: Record<string, string> = {
    all: t("common.all"),
    tasks: t("activity.tasks"),
    rewards: t("activity.rewards"),
    penalties: t("activity.penaltiesFilter"),
  };

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

  const recentItems = filtered.slice(0, RECENT_COUNT);
  const olderItems = filtered.slice(RECENT_COUNT);

  const hasFilters = categoryFilter !== "all" || childFilter !== "all";
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          {t("activity.title")}
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
                <SelectItem value="all" className="text-xs">{t("activity.allChildren")}</SelectItem>
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
              {t("common.reset")}
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
            <p className="text-sm">{hasFilters ? t("activity.noResults") : t("activity.noActivity")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentItems.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                config={TYPE_CONFIG[activity.type]}
                isParent={isParent}
                dateFnsLocale={dateFnsLocale}
              />
            ))}

            {olderItems.length > 0 && (
              <Collapsible open={olderOpen} onOpenChange={setOlderOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2.5 px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                  {olderOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {t("activity.olderActivities", { count: olderItems.length })}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1">
                    {olderItems.map((activity) => (
                      <ActivityRow
                        key={activity.id}
                        activity={activity}
                        config={TYPE_CONFIG[activity.type]}
                        isParent={isParent}
                        dateFnsLocale={dateFnsLocale}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
