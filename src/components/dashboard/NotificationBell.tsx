import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import i18n from "@/i18n";

const typeIcons: Record<string, string> = {
  task_completed: "✅",
  task_assigned: "📋",
  task_reminder: "⏰",
  reward_approved: "🎁",
  reward_requested: "🎁",
  redemption_requested: "🎁",
  penalty: "⚠️",
  info: "ℹ️",
};

const typeToSection: Record<string, string> = {
  task_completed: "section-tasks",
  task_assigned: "section-tasks",
  task_reminder: "section-tasks",
  reward_approved: "section-rewards",
  reward_requested: "section-rewards",
  redemption_requested: "section-rewards",
  penalty: "section-penalties",
};

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: (notification: Notification) => void;
}) {
  const dateFnsLocale = i18n.language === "fr" ? fr : enUS;
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 border-b border-border last:border-0 transition-colors cursor-pointer hover:bg-muted/50",
        !notification.is_read && "bg-primary/5"
      )}
      onClick={() => onClick(notification)}
    >
      <span className="text-lg mt-0.5">{typeIcons[notification.type] || "ℹ️"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-medium", !notification.is_read && "text-primary")}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: dateFnsLocale,
          })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Header height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    const sectionId = typeToSection[notification.type];
    if (sectionId) {
      setOpen(false);
      if (location.pathname === "/dashboard") {
        // Délai plus long pour laisser le popover se fermer sur mobile
        setTimeout(() => scrollToSection(sectionId), 300);
      } else {
        // Navigation vers le dashboard puis scroll
        navigate("/dashboard", { state: { scrollTo: sectionId } });
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              {t("notifications.readAll")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("notifications.noNotifications")}
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onClick={handleNotificationClick} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
