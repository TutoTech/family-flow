import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, DollarSign, Flame, AlertTriangle, Clock, Camera, Globe, Coins, Shield } from "lucide-react";
import SetPinDialog from "@/components/dashboard/SetPinDialog";
import { CURRENCIES, CurrencyCode } from "@/hooks/useCurrency";

interface FamilySettings {
  points_to_money_rate: number;
  streak_bonus_percent: number;
  penalty_threshold_per_day: number;
  tts_delay_minutes: number;
  parent_alert_delay_minutes: number;
  photo_retention_days: number;
  currency: string;
}

export default function FamilySettingsPage() {
  const { t, i18n } = useTranslation();
  const { profile, role, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("pin_code_hash")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setHasPin(!!data?.pin_code_hash);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!profile?.family_id) return;
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("family_settings")
        .select("*")
        .eq("family_id", profile.family_id!)
        .single();
      if (data) {
        setSettings({
          points_to_money_rate: data.points_to_money_rate,
          streak_bonus_percent: data.streak_bonus_percent,
          penalty_threshold_per_day: data.penalty_threshold_per_day,
          tts_delay_minutes: data.tts_delay_minutes,
          parent_alert_delay_minutes: data.parent_alert_delay_minutes,
          photo_retention_days: data.photo_retention_days,
          currency: (data as any).currency ?? "EUR",
        });
      }
      if (error) toast.error(t("settings.loadError"));
      setLoading(false);
    };
    fetchSettings();
  }, [profile?.family_id]);

  const handleSave = async () => {
    if (!profile?.family_id || !settings) return;
    setSaving(true);

    if (settings.points_to_money_rate < 0 || settings.points_to_money_rate > 100) {
      toast.error(t("settings.validationRate")); setSaving(false); return;
    }
    if (settings.streak_bonus_percent < 0 || settings.streak_bonus_percent > 100) {
      toast.error(t("settings.validationStreak")); setSaving(false); return;
    }
    if (settings.penalty_threshold_per_day < 1 || settings.penalty_threshold_per_day > 50) {
      toast.error(t("settings.validationPenalty")); setSaving(false); return;
    }

    const { error } = await supabase
      .from("family_settings")
      .update(settings as any)
      .eq("family_id", profile.family_id!);

    if (error) {
      toast.error(t("settings.saveError"));
    } else {
      toast.success(t("settings.saved"));
      queryClient.invalidateQueries({ queryKey: ["family-currency"] });
    }
    setSaving(false);
  };

  const updateField = (field: keyof FamilySettings, value: number | string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleCurrencyChange = (code: string) => {
    setSettings((prev) => (prev ? { ...prev, currency: code } : prev));
  };

  const currencySymbol = CURRENCIES.find((c) => c.code === settings?.currency)?.symbol ?? "€";

  if (role !== "parent") {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading || !settings) {
    return (
      <DashboardLayout title={t("settings.pageTitle")}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("settings.pageTitle")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {t("settings.pageTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </div>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              {t("settings.language")}
            </CardTitle>
            <CardDescription>{t("settings.languageDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">{t("settings.french")}</SelectItem>
                <SelectItem value="en">{t("settings.english")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              {t("settings.currency")}
            </CardTitle>
            <CardDescription>{t("settings.currencyDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={settings.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="max-w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Points & Argent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              {t("settings.pointsMoney")}
            </CardTitle>
            <CardDescription>{t("settings.pointsMoneyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="points_to_money_rate">{t("settings.conversionRate", { symbol: currencySymbol })}</Label>
              <div className="flex items-center gap-2">
                <Input id="points_to_money_rate" type="number" step="0.01" min="0" max="100" value={settings.points_to_money_rate} onChange={(e) => updateField("points_to_money_rate", parseFloat(e.target.value) || 0)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">{currencySymbol} / {t("common.pts")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.conversionExample", { symbol: currencySymbol })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Séries & Bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              {t("settings.streaksBonus")}
            </CardTitle>
            <CardDescription>{t("settings.streaksBonusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streak_bonus_percent">{t("settings.streakPercent")}</Label>
              <div className="flex items-center gap-2">
                <Input id="streak_bonus_percent" type="number" min="0" max="100" value={settings.streak_bonus_percent} onChange={(e) => updateField("streak_bonus_percent", parseInt(e.target.value) || 0)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.streakHint")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pénalités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("settings.penaltiesTitle")}
            </CardTitle>
            <CardDescription>{t("settings.penaltiesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="penalty_threshold_per_day">{t("settings.penaltyThreshold")}</Label>
              <div className="flex items-center gap-2">
                <Input id="penalty_threshold_per_day" type="number" min="1" max="50" value={settings.penalty_threshold_per_day} onChange={(e) => updateField("penalty_threshold_per_day", parseInt(e.target.value) || 1)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">{t("settings.penaltiesPerDay")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Délais & Alertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              {t("settings.delaysTitle")}
            </CardTitle>
            <CardDescription>{t("settings.delaysDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tts_delay_minutes">{t("settings.reminderDelay")}</Label>
              <div className="flex items-center gap-2">
                <Input id="tts_delay_minutes" type="number" min="1" max="120" value={settings.tts_delay_minutes} onChange={(e) => updateField("tts_delay_minutes", parseInt(e.target.value) || 5)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">{t("common.min")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.reminderHint")}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="parent_alert_delay_minutes">{t("settings.parentAlertDelay")}</Label>
              <div className="flex items-center gap-2">
                <Input id="parent_alert_delay_minutes" type="number" min="1" max="120" value={settings.parent_alert_delay_minutes} onChange={(e) => updateField("parent_alert_delay_minutes", parseInt(e.target.value) || 15)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">{t("common.min")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.parentAlertHint")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-violet-500" />
              {t("settings.photosTitle")}
            </CardTitle>
            <CardDescription>{t("settings.photosDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="photo_retention_days">{t("settings.retentionDays")}</Label>
              <div className="flex items-center gap-2">
                <Input id="photo_retention_days" type="number" min="1" max="365" value={settings.photo_retention_days} onChange={(e) => updateField("photo_retention_days", parseInt(e.target.value) || 30)} className="max-w-32" />
                <span className="text-sm text-muted-foreground">{t("common.days")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? t("common.saving") : t("settings.saveButton")}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
