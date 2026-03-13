/**
 * Dialog d'édition d'avatar.
 * Permet de choisir un emoji comme avatar ou d'uploader
 * une photo de profil. Offre aussi la possibilité de supprimer l'avatar.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Upload, Trash2 } from "lucide-react";

const EMOJI_OPTIONS = [
  "😀", "😎", "🤩", "🥳", "😇", "🤗", "🧐", "🤠",
  "👦", "👧", "👨", "👩", "🧑", "👶", "🧒", "🧓",
  "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞",
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁",
  "🌟", "🔥", "💎", "🎯", "🎨", "🎵", "🚀", "⚡",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AvatarEditorDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEmojiAvatar = profile?.avatar_url && !profile.avatar_url.startsWith("http");

  const handleSaveEmoji = async () => {
    if (!user?.id || !selectedEmoji) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: selectedEmoji })
      .eq("user_id", user.id);

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("avatar.saved"));
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      // Force a page reload to update auth context profile
      window.location.reload();
    }
    setSaving(false);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("avatar.invalidFile"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("avatar.fileTooLarge"));
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("task-evidence")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(t("common.error"));
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage
      .from("task-evidence")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    const avatarUrl = urlData?.signedUrl || "";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("avatar.saved"));
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      window.location.reload();
    }
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("user_id", user.id);

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("avatar.removed"));
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      window.location.reload();
    }
    setSaving(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("avatar.title")}</DialogTitle>
          <DialogDescription>{t("avatar.description")}</DialogDescription>
        </DialogHeader>

        {/* Current avatar preview */}
        <div className="flex flex-col items-center gap-3 py-2">
          <Avatar className="h-20 w-20 text-3xl">
            {isEmojiAvatar ? (
              <AvatarFallback className="text-3xl bg-primary/10">
                {profile.avatar_url}
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {profile?.name ? getInitials(profile.name) : "?"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {profile?.avatar_url && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive gap-1"
              onClick={handleRemoveAvatar}
              disabled={saving}
            >
              <Trash2 className="h-3 w-3" />
              {t("avatar.remove")}
            </Button>
          )}
        </div>

        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emoji" className="gap-2">
              <Smile className="h-4 w-4" />
              {t("avatar.emoji")}
            </TabsTrigger>
            <TabsTrigger value="photo" className="gap-2">
              <Upload className="h-4 w-4" />
              {t("avatar.photo")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emoji" className="space-y-4">
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg hover:bg-muted transition-colors ${
                    selectedEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveEmoji}
                disabled={!selectedEmoji || saving}
                className="w-full"
              >
                {saving ? t("common.saving") : t("avatar.saveEmoji")}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("avatar.uploadHint")}
              </p>
              <label className="cursor-pointer">
                <Button variant="outline" className="gap-2" disabled={uploading} asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? t("common.loading") : t("avatar.chooseFile")}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                  disabled={uploading}
                />
              </label>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
