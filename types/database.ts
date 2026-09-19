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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      managers: {
        Row: {
          assists: number
          created_at: string
          goals: number
          id: number
          is_active: boolean
          name: string
          profile_id: string | null
          team_id: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          id?: number
          is_active?: boolean
          name: string
          profile_id?: string | null
          team_id: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          id?: number
          is_active?: boolean
          name?: string
          profile_id?: string | null
          team_id?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          participants_recorded: boolean
          created_at: string
          id: number
          location: string | null
          manager_id: number | null
          notes: string | null
          opponent_goals: number
          opponent_id: number
          our_goals: number
          played_at: string
          season_id: number
          team_id: number
        }
        Insert: {
          participants_recorded?: boolean
          created_at?: string
          id?: number
          location?: string | null
          manager_id?: number | null
          notes?: string | null
          opponent_goals: number
          opponent_id: number
          our_goals: number
          played_at?: string
          season_id: number
          team_id: number
        }
        Update: {
          participants_recorded?: boolean
          created_at?: string
          id?: number
          location?: string | null
          manager_id?: number | null
          notes?: string | null
          opponent_goals?: number
          opponent_id?: number
          our_goals?: number
          played_at?: string
          season_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "opponents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      opponents: {
        Row: {
          created_at: string
          id: number
          name: string
          team_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          team_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          team_id?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          can_edit_other_player_stats: boolean
          can_manage_matches: boolean
          can_manage_seasons: boolean
          can_send_invites: boolean
          can_view_other_manager_stats: boolean
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          can_edit_other_player_stats?: boolean
          can_manage_matches?: boolean
          can_manage_seasons?: boolean
          can_send_invites?: boolean
          can_view_other_manager_stats?: boolean
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: string
        }
        Update: {
          can_edit_other_player_stats?: boolean
          can_manage_matches?: boolean
          can_manage_seasons?: boolean
          can_send_invites?: boolean
          can_view_other_manager_stats?: boolean
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          is_active: boolean
          name: string
          start_date: string | null
          team_id: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          is_active?: boolean
          name: string
          start_date?: string | null
          team_id: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          is_active?: boolean
          name?: string
          start_date?: string | null
          team_id?: number
        }
        Relationships: []
      }
      match_players: {
        Row: { match_id: number; player_id: number }
        Insert: { match_id: number; player_id: number }
        Update: { match_id?: number; player_id?: number }
        Relationships: [
          { foreignKeyName: 'match_players_match_id_fkey'; columns: ['match_id']; isOneToOne: false; referencedRelation: 'matches'; referencedColumns: ['id'] },
          { foreignKeyName: 'match_players_player_id_fkey'; columns: ['player_id']; isOneToOne: false; referencedRelation: 'managers'; referencedColumns: ['id'] },
        ]
      }
      team_members: {
        Row: { profile_id: string; team_id: number; can_manage_permissions: boolean; can_manage_matches: boolean; can_edit_other_player_stats: boolean; can_view_other_manager_stats: boolean; can_send_invites: boolean; can_manage_seasons: boolean }
        Insert: { profile_id: string; team_id: number }
        Update: { profile_id?: string; team_id?: number }
        Relationships: []
      }
      teams: {
        Row: { created_at: string; id: number; name: string; owner_profile_id: string }
        Insert: { created_at?: string; id?: number; name: string; owner_profile_id: string }
        Update: { created_at?: string; id?: number; name?: string; owner_profile_id?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_season: { Args: { p_season_id: number }; Returns: undefined }
      save_match_with_players: { Args: { p_team_id: number; p_match: Json; p_player_ids: number[]; p_match_id?: number }; Returns: number }
      assign_invited_user_to_team: { Args: { p_team_id: number; p_user_id: string }; Returns: undefined }
      set_team_permissions: { Args: { p_team_id: number; p_user_id: string; p_permissions: Json }; Returns: undefined }
      update_player_stats: { Args: { p_team_id: number; p_manager_id: number; p_goals: number; p_assists: number }; Returns: undefined }
      create_managed_team: { Args: { p_name: string }; Returns: number }
      delete_managed_team: { Args: { p_team_id: number }; Returns: undefined }
      get_my_team_id: { Args: never; Returns: number | null }
      is_admin: { Args: never; Returns: boolean }
      set_profile_display_name: {
        Args: { p_display_name: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
