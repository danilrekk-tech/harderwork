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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievement_collections: {
        Row: {
          bonus_xp: number
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          bonus_xp?: number
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          bonus_xp?: number
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          collection_id: string | null
          condition_target: number
          condition_type: string
          created_at: string
          created_by: string | null
          description: string
          icon: string
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          collection_id?: string | null
          condition_target?: number
          condition_type: string
          created_at?: string
          created_by?: string | null
          description?: string
          icon?: string
          id?: string
          title: string
          xp_reward?: number
        }
        Update: {
          collection_id?: string | null
          condition_target?: number
          condition_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          icon?: string
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      action_events: {
        Row: {
          description: string
          id: string
          manager_name: string | null
          timestamp: string
          type: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          description?: string
          id?: string
          manager_name?: string | null
          timestamp?: string
          type: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          description?: string
          id?: string
          manager_name?: string | null
          timestamp?: string
          type?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      bonus_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          metric: string
          period: string
          prize: string
          target: number
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          metric?: string
          period?: string
          prize?: string
          target?: number
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          metric?: string
          period?: string
          prize?: string
          target?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      boost_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          effect: string
          icon: string
          id: string
          name: string
          xp_cost: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          effect?: string
          icon?: string
          id?: string
          name: string
          xp_cost?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          effect?: string
          icon?: string
          id?: string
          name?: string
          xp_cost?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string
          created_at: string
          deal_status: Database["public"]["Enums"]["deal_status"]
          email: string
          id: string
          invoice_amount: number
          name: string
          notes: string
          phone: string
          product: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string
          created_at?: string
          deal_status?: Database["public"]["Enums"]["deal_status"]
          email?: string
          id?: string
          invoice_amount?: number
          name?: string
          notes?: string
          phone?: string
          product?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          deal_status?: Database["public"]["Enums"]["deal_status"]
          email?: string
          id?: string
          invoice_amount?: number
          name?: string
          notes?: string
          phone?: string
          product?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          end_date: string
          id: string
          is_active: boolean
          metric: string
          prize: string
          prize_xp: number
          start_date: string
          target: number
          teams: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date: string
          id?: string
          is_active?: boolean
          metric?: string
          prize?: string
          prize_xp?: number
          start_date: string
          target?: number
          teams?: Json | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          metric?: string
          prize?: string
          prize_xp?: number
          start_date?: string
          target?: number
          teams?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          completed: boolean
          created_at: string
          current: number
          date: string
          id: string
          target: number
          title: string
          type: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current?: number
          date: string
          id?: string
          target?: number
          title: string
          type: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          current?: number
          date?: string
          id?: string
          target?: number
          title?: string
          type?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          id: string
          issued_at: string
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          last_active_date: string
          level: number
          name: string
          processed_clients_count: number
          streak_days: number
          total_xp_earned: number
          updated_at: string
          user_id: string
          xp: number
          xp_spent: number
          xp_to_next_level: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_active_date?: string
          level?: number
          name?: string
          processed_clients_count?: number
          streak_days?: number
          total_xp_earned?: number
          updated_at?: string
          user_id: string
          xp?: number
          xp_spent?: number
          xp_to_next_level?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_active_date?: string
          level?: number
          name?: string
          processed_clients_count?: number
          streak_days?: number
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
          xp?: number
          xp_spent?: number
          xp_to_next_level?: number
        }
        Relationships: []
      }
      reminders: {
        Row: {
          amount: number | null
          client_id: string | null
          client_time: string
          client_timezone: string
          completed: boolean
          created_at: string
          id: string
          my_time: string
          reason: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          client_time?: string
          client_timezone?: string
          completed?: boolean
          created_at?: string
          id?: string
          my_time?: string
          reason?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          client_time?: string
          client_timezone?: string
          completed?: boolean
          created_at?: string
          id?: string
          my_time?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          number: number
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          number: number
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          number?: number
          start_date?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_boosts: {
        Row: {
          boost_id: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          boost_id: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          boost_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_boosts_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: false
            referencedRelation: "boost_items"
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
      user_settings: {
        Row: {
          combo: Json
          dashboard_widgets: Json
          end_time: string
          focus_session: Json
          id: string
          momentum: Json
          multi_level_plan: Json
          personal_records: Json
          plan_completed_this_month: boolean
          plan_target: number
          plan_type: string
          skills: Json
          start_time: string
          timezone: string
          updated_at: string
          user_id: string
          work_days: Json
        }
        Insert: {
          combo?: Json
          dashboard_widgets?: Json
          end_time?: string
          focus_session?: Json
          id?: string
          momentum?: Json
          multi_level_plan?: Json
          personal_records?: Json
          plan_completed_this_month?: boolean
          plan_target?: number
          plan_type?: string
          skills?: Json
          start_time?: string
          timezone?: string
          updated_at?: string
          user_id: string
          work_days?: Json
        }
        Update: {
          combo?: Json
          dashboard_widgets?: Json
          end_time?: string
          focus_session?: Json
          id?: string
          momentum?: Json
          multi_level_plan?: Json
          personal_records?: Json
          plan_completed_this_month?: boolean
          plan_target?: number
          plan_type?: string
          skills?: Json
          start_time?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          work_days?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      use_invite: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "leader" | "manager"
      deal_status: "processed" | "invoice_sent" | "invoice_paid"
      invoice_status: "issued" | "paid"
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
      app_role: ["leader", "manager"],
      deal_status: ["processed", "invoice_sent", "invoice_paid"],
      invoice_status: ["issued", "paid"],
    },
  },
} as const
