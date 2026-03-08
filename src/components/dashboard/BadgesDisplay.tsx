import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLevelBadges } from "@/hooks/useLevelBadges";
import { useProfileSwitch } from "@/hooks/useProfileSwitch";
import { useAuth } from "@/hooks/useAuth";
import { Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import i18n from "@/i18n";

export default function BadgesDisplay() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeProfile, isImpersonating } = useProfileSwitch();
  const viewUserId = isImpersonating ? activeProfile?.userId : user?.id;
  const { allBadges, badges } = useLevelBadges(viewUserId);
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;

  const earnedCount = badges.length;
  const totalCount = allBadges.length;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            {t("badges.title")}
          </div>
          <Badge variant="secondary" className="text-xs">
            {earnedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-5 gap-2">
            {allBadges.map((badge) => (
              <Tooltip key={badge.key}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-default ${
                      badge.earned
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "bg-muted/30 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-[9px] text-center text-muted-foreground leading-tight line-clamp-2">
                      {t(`badges.names.${badge.key}`)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-48 text-center">
                  <p className="font-medium">{t(`badges.names.${badge.key}`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`badges.descriptions.${badge.key}`)}</p>
                  {badge.earned && badge.earnedAt && (
                    <p className="text-xs text-primary mt-1">
                      {t("badges.earnedAgo", {
                        time: formatDistanceToNow(new Date(badge.earnedAt), { locale: dateFnsLocale }),
                      })}
                    </p>
                  )}
                  {!badge.earned && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {t("badges.notEarned")}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
