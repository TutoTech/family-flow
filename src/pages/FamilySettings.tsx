import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, ArrowLeft, DollarSign, Flame, AlertTriangle, Clock, Camera } from "lucide-react";

interface FamilySettings {
  points_to_money_rate: number;
  streak_bonus_percent: number;
  penalty_threshold_per_day: number;
  tts_delay_minutes: number;
  parent_alert_delay_minutes: number;
  photo_retention_days: number;
}

export default function FamilySettingsPage() {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        });
      }
      if (error) toast.error("Erreur lors du chargement des paramètres");
      setLoading(false);
    };
    fetchSettings();
  }, [profile?.family_id]);

  const handleSave = async () => {
    if (!profile?.family_id || !settings) return;
    setSaving(true);

    // Validation
    if (settings.points_to_money_rate < 0 || settings.points_to_money_rate > 100) {
      toast.error("Le taux de conversion doit être entre 0 et 100");
      setSaving(false);
      return;
    }
    if (settings.streak_bonus_percent < 0 || settings.streak_bonus_percent > 100) {
      toast.error("Le bonus de série doit être entre 0 et 100%");
      setSaving(false);
      return;
    }
    if (settings.penalty_threshold_per_day < 1 || settings.penalty_threshold_per_day > 50) {
      toast.error("Le seuil de pénalités doit être entre 1 et 50");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("family_settings")
      .update(settings)
      .eq("family_id", profile.family_id!);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Paramètres sauvegardés !");
    }
    setSaving(false);
  };

  const updateField = (field: keyof FamilySettings, value: number) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (role !== "parent") {
    navigate("/dashboard");
    return null;
  }

  if (loading || !settings) {
    return (
      <DashboardLayout title="Paramètres">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paramètres du foyer">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Paramètres du foyer
            </h2>
            <p className="text-sm text-muted-foreground">
              Configurez les règles et paramètres de votre famille
            </p>
          </div>
        </div>

        {/* Points & Argent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Points & Argent
            </CardTitle>
            <CardDescription>
              Définissez le taux de conversion entre les points gagnés et l'argent réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="points_to_money_rate">Taux de conversion (€ par point)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="points_to_money_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.points_to_money_rate}
                  onChange={(e) => updateField("points_to_money_rate", parseFloat(e.target.value) || 0)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">€ / point</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemple : avec 0.10€/pt, 100 points = 10.00€
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Séries & Bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Séries & Bonus
            </CardTitle>
            <CardDescription>
              Récompensez la régularité avec un bonus sur les points gagnés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streak_bonus_percent">Bonus de série (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="streak_bonus_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.streak_bonus_percent}
                  onChange={(e) => updateField("streak_bonus_percent", parseInt(e.target.value) || 0)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bonus ajouté aux points quand l'enfant maintient une série de jours consécutifs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pénalités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Pénalités
            </CardTitle>
            <CardDescription>
              Nombre maximum de pénalités par jour avant alerte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="penalty_threshold_per_day">Seuil de pénalités par jour</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="penalty_threshold_per_day"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.penalty_threshold_per_day}
                  onChange={(e) => updateField("penalty_threshold_per_day", parseInt(e.target.value) || 1)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">pénalités / jour</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Délais & Alertes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Délais & Alertes
            </CardTitle>
            <CardDescription>
              Configurez les délais pour les rappels et notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tts_delay_minutes">Rappel automatique avant l'heure limite (minutes)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tts_delay_minutes"
                  type="number"
                  min="1"
                  max="120"
                  value={settings.tts_delay_minutes}
                  onChange={(e) => updateField("tts_delay_minutes", parseInt(e.target.value) || 5)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Une notification de rappel sera envoyée à l'enfant X minutes avant l'heure limite de chaque tâche
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="parent_alert_delay_minutes">Délai d'alerte parent (minutes)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="parent_alert_delay_minutes"
                  type="number"
                  min="1"
                  max="120"
                  value={settings.parent_alert_delay_minutes}
                  onChange={(e) => updateField("parent_alert_delay_minutes", parseInt(e.target.value) || 15)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Temps avant de notifier le parent si une tâche n'est pas complétée
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-violet-500" />
              Photos de preuve
            </CardTitle>
            <CardDescription>
              Durée de conservation des photos de preuve des tâches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="photo_retention_days">Durée de rétention (jours)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo_retention_days"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.photo_retention_days}
                  onChange={(e) => updateField("photo_retention_days", parseInt(e.target.value) || 30)}
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">jours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
