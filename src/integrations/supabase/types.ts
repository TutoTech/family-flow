export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      child_stats: {
        Row: {
          child_id: string
          current_points: number
          daily_penalties: number
          id: string
          streak_days: number
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          child_id: string
          current_points?: number
          daily_penalties?: number
          id?: string
          streak_days?: number
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          child_id?: string
          current_points?: number
          daily_penalties?: number
          id?: string
          streak_days?: number
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          platform: string
          push_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform: string
          push_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform?: string
          push_token?: string
          user_id?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_settings: {
        Row: {
          family_id: string
          id: string
          parent_alert_delay_minutes: number
          penalty_threshold_per_day: number
          photo_retention_days: number
          points_to_money_rate: number
          streak_bonus_percent: number
          tts_delay_minutes: number
          updated_at: string
        }
        Insert: {
          family_id: string
          id?: string
          parent_alert_delay_minutes?: number
          penalty_threshold_per_day?: number
          photo_retention_days?: number
          points_to_money_rate?: number
          streak_bonus_percent?: number
          tts_delay_minutes?: number
          updated_at?: string
        }
        Update: {
          family_id?: string
          id?: string
          parent_alert_delay_minutes?: number
          penalty_threshold_per_day?: number
          photo_retention_days?: number
          points_to_money_rate?: number
          streak_bonus_percent?: number
          tts_delay_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_settings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      house_rules: {
        Row: {
          created_at: string
          description: string | null
          family_id: string
          icon: string | null
          id: string
          is_active: boolean
          label: string
          points_penalty: number
          wallet_penalty: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          family_id: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          points_penalty?: number
          wallet_penalty?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          points_penalty?: number
          wallet_penalty?: number
        }
        Relationships: [
          {
            foreignKeyName: "house_rules_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties_log: {
        Row: {
          child_id: string
          comment: string | null
          created_at: string
          family_id: string
          id: string
          logged_by_parent_id: string
          rule_id: string
        }
        Insert: {
          child_id: string
          comment?: string | null
          created_at?: string
          family_id: string
          id?: string
          logged_by_parent_id: string
          rule_id: string
        }
        Update: {
          child_id?: string
          comment?: string | null
          created_at?: string
          family_id?: string
          id?: string
          logged_by_parent_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_log_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "house_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          family_id: string | null
          id: string
          is_active: boolean
          name: string
          pin_code_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          pin_code_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pin_code_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          author: string | null
          category: string | null
          id: string
          is_active: boolean
          language: string
          text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          id?: string
          is_active?: boolean
          language?: string
          text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          id?: string
          is_active?: boolean
          language?: string
          text?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          approved_by_parent_id: string | null
          child_id: string
          created_at: string
          id: string
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
        }
        Insert: {
          approved_by_parent_id?: string | null
          child_id: string
          created_at?: string
          id?: string
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
        }
        Update: {
          approved_by_parent_id?: string | null
          child_id?: string
          created_at?: string
          id?: string
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          cost_points: number
          created_at: string
          description: string | null
          family_id: string
          icon: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          cost_points: number
          created_at?: string
          description?: string | null
          family_id: string
          icon?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          cost_points?: number
          created_at?: string
          description?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      task_evidence_photos: {
        Row: {
          deleted_at: string | null
          expires_at: string | null
          id: string
          mime_type: string
          storage_key: string
          task_instance_id: string
          uploaded_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          mime_type?: string
          storage_key: string
          task_instance_id: string
          uploaded_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          mime_type?: string
          storage_key?: string
          task_instance_id?: string
          uploaded_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_evidence_photos_task_instance_id_fkey"
            columns: ["task_instance_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      task_instances: {
        Row: {
          assigned_to_user_id: string
          completed_at: string | null
          created_at: string
          due_at: string
          family_id: string
          id: string
          scheduled_for_date: string
          status: Database["public"]["Enums"]["task_status"]
          task_template_id: string
          updated_at: string
          validated_at: string | null
          validated_by_user_id: string | null
        }
        Insert: {
          assigned_to_user_id: string
          completed_at?: string | null
          created_at?: string
          due_at: string
          family_id: string
          id?: string
          scheduled_for_date: string
          status?: Database["public"]["Enums"]["task_status"]
          task_template_id: string
          updated_at?: string
          validated_at?: string | null
          validated_by_user_id?: string | null
        }
        Update: {
          assigned_to_user_id?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string
          family_id?: string
          id?: string
          scheduled_for_date?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_template_id?: string
          updated_at?: string
          validated_at?: string | null
          validated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          assigned_to_user_id: string
          created_at: string
          created_by_user_id: string
          description: string | null
          due_time: string
          family_id: string
          icon: string | null
          id: string
          is_active: boolean
          points_reward: number
          recurrence_config: Json | null
          recurrence_type: Database["public"]["Enums"]["recurrence_type"]
          requires_photo: boolean
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id: string
          created_at?: string
          created_by_user_id: string
          description?: string | null
          due_time: string
          family_id: string
          icon?: string | null
          id?: string
          is_active?: boolean
          points_reward?: number
          recurrence_config?: Json | null
          recurrence_type?: Database["public"]["Enums"]["recurrence_type"]
          requires_photo?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          due_time?: string
          family_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          points_reward?: number
          recurrence_config?: Json | null
          recurrence_type?: Database["public"]["Enums"]["recurrence_type"]
          requires_photo?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_daily_task_instances: {
        Args: { _family_id: string }
        Returns: undefined
      }
      get_user_family_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "child"
      recurrence_type: "daily" | "weekly" | "weekdays" | "weekends" | "custom"
      redemption_status: "requested" | "approved" | "rejected" | "delivered"
      task_status:
        | "pending"
        | "done"
        | "late"
        | "awaiting_validation"
        | "validated"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "child"],
      recurrence_type: ["daily", "weekly", "weekdays", "weekends", "custom"],
      redemption_status: ["requested", "approved", "rejected", "delivered"],
      task_status: [
        "pending",
        "done",
        "late",
        "awaiting_validation",
        "validated",
        "rejected",
      ],
    },
  },
} as const
