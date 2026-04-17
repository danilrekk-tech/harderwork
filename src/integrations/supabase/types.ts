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
      ai_conversations: {
        Row: {
          context_type: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string
          actor_name: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          actor_name?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          actor_name?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          trigger_config: Json
          trigger_type: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          trigger_config?: Json
          trigger_type: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger_config?: Json
          trigger_type?: string
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
      client_notes: {
        Row: {
          body: string
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string
          created_at: string
          deal_status: Database["public"]["Enums"]["deal_status"]
          email: string
          expected_close_date: string | null
          id: string
          invoice_amount: number
          name: string
          notes: string
          phone: string
          product: string
          stage_id: string | null
          tags: string[] | null
          temperature: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string
          created_at?: string
          deal_status?: Database["public"]["Enums"]["deal_status"]
          email?: string
          expected_close_date?: string | null
          id?: string
          invoice_amount?: number
          name?: string
          notes?: string
          phone?: string
          product?: string
          stage_id?: string | null
          tags?: string[] | null
          temperature?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          deal_status?: Database["public"]["Enums"]["deal_status"]
          email?: string
          expected_close_date?: string | null
          id?: string
          invoice_amount?: number
          name?: string
          notes?: string
          phone?: string
          product?: string
          stage_id?: string | null
          tags?: string[] | null
          temperature?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "deal_stages"
            referencedColumns: ["id"]
          },
        ]
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
      deal_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      fortune_wheel_spins: {
        Row: {
          id: string
          reward_label: string
          reward_xp: number
          spun_at: string
          user_id: string
        }
        Insert: {
          id?: string
          reward_label?: string
          reward_xp?: number
          spun_at?: string
          user_id: string
        }
        Update: {
          id?: string
          reward_label?: string
          reward_xp?: number
          spun_at?: string
          user_id?: string
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
      manager_group_members: {
        Row: {
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "manager_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_groups: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      manager_kpi: {
        Row: {
          id: string
          monthly_clients_target: number
          monthly_invoices_target: number
          monthly_revenue_target: number
          set_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          monthly_clients_target?: number
          monthly_invoices_target?: number
          monthly_revenue_target?: number
          set_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          monthly_clients_target?: number
          monthly_invoices_target?: number
          monthly_revenue_target?: number
          set_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mystery_boxes: {
        Row: {
          id: string
          opened_at: string
          reward_type: string
          reward_value: Json
          user_id: string
        }
        Insert: {
          id?: string
          opened_at?: string
          reward_type: string
          reward_value?: Json
          user_id: string
        }
        Update: {
          id?: string
          opened_at?: string
          reward_type?: string
          reward_value?: Json
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      one_on_one_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          leader_id: string
          manager_id: string
          meeting_date: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          leader_id: string
          manager_id: string
          meeting_date?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          leader_id?: string
          manager_id?: string
          meeting_date?: string | null
        }
        Relationships: []
      }
      penalties: {
        Row: {
          created_at: string
          created_by: string
          id: string
          reason: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          reason?: string
          user_id: string
          xp_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          reason?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      penalty_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          title: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          id?: string
          title: string
          xp_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          title?: string
          xp_amount?: number
        }
        Relationships: []
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
      team_plan: {
        Row: {
          created_at: string
          created_by: string
          id: string
          month: string
          plan_target: number
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          month: string
          plan_target?: number
          plan_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          month?: string
          plan_target?: number
          plan_type?: string
          updated_at?: string
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
