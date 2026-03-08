import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLevelBadges, LEVELS } from "@/hooks/useLevelBadges";
import { Sparkles } from "lucide-react";

export default function LevelProgressCard() {
  const { t } = useTranslation();
  const { levelInfo, totalPoints } = useLevelBadges();

  if (!levelInfo) return null;

  const { currentLevel, nextLevel, progress, pointsToNextLevel } = levelInfo;

  return (
    <Card className="shadow-card bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("level.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level Display */}
        <div className="flex items-center gap-4">
          <div className="text-4xl">{currentLevel.icon}</div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${currentLevel.color}`}>
                {t(`level.levels.${currentLevel.name}`)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("level.levelN", { n: currentLevel.level })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalPoints} {t("level.totalPoints")}
            </p>
          </div>
        </div>

        {/* Progress to next level */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("level.nextLevel")}</span>
              <span className="font-medium flex items-center gap-1">
                {nextLevel.icon} {t(`level.levels.${nextLevel.name}`)}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {t("level.pointsToGo", { points: pointsToNextLevel })}
            </p>
          </div>
        )}

        {/* Max level reached */}
        {!nextLevel && (
          <div className="text-center py-2">
            <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              {t("level.maxReached")}
            </span>
          </div>
        )}

        {/* Level ladder preview */}
        <div className="flex justify-between gap-1 pt-2">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className={`flex flex-col items-center gap-0.5 p-1 rounded transition-opacity ${
                lvl.level <= currentLevel.level ? "opacity-100" : "opacity-30"
              }`}
            >
              <span className="text-lg">{lvl.icon}</span>
              <span className="text-[10px] text-muted-foreground">{lvl.level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
