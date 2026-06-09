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
  public: {
    Tables: {
      mysteries: {
        Row: {
          accused_suspect: string | null
          case_file: Json
          category: string
          conversation: Json
          created_at: string
          id: string
          solution_revealed: Json | null
          solved_correctly: boolean | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accused_suspect?: string | null
          case_file: Json
          category: string
          conversation?: Json
          created_at?: string
          id?: string
          solution_revealed?: Json | null
          solved_correctly?: boolean | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accused_suspect?: string | null
          case_file?: Json
          category?: string
          conversation?: Json
          created_at?: string
          id?: string
          solution_revealed?: Json | null
          solved_correctly?: boolean | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          codename: string | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[]
          last_active_date: string | null
          level: number
          mysteries_solved: number
          rabbit_holes_explored: number
          rank: string
          reality_checks_completed: number
          secret_files_unlocked: number
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          codename?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          interests?: string[]
          last_active_date?: string | null
          level?: number
          mysteries_solved?: number
          rabbit_holes_explored?: number
          rank?: string
          reality_checks_completed?: number
          secret_files_unlocked?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          codename?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[]
          last_active_date?: string | null
          level?: number
          mysteries_solved?: number
          rabbit_holes_explored?: number
          rank?: string
          reality_checks_completed?: number
          secret_files_unlocked?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      rabbit_holes: {
        Row: {
          created_at: string
          id: string
          nodes: Json
          root_question: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nodes?: Json
          root_question: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nodes?: Json
          root_question?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reality_checks: {
        Row: {
          blind_spots: Json
          confidence_score: number
          context: string | null
          created_at: string
          id: string
          next_actions: Json
          plan: string
          risk_score: number
          risks: Json
          strengths: Json
          success_score: number
          suggestions: Json
          summary: string
          updated_at: string
          user_id: string
          verdict: string
        }
        Insert: {
          blind_spots?: Json
          confidence_score?: number
          context?: string | null
          created_at?: string
          id?: string
          next_actions?: Json
          plan: string
          risk_score?: number
          risks?: Json
          strengths?: Json
          success_score?: number
          suggestions?: Json
          summary?: string
          updated_at?: string
          user_id: string
          verdict?: string
        }
        Update: {
          blind_spots?: Json
          confidence_score?: number
          context?: string | null
          created_at?: string
          id?: string
          next_actions?: Json
          plan?: string
          risk_score?: number
          risks?: Json
          strengths?: Json
          success_score?: number
          suggestions?: Json
          summary?: string
          updated_at?: string
          user_id?: string
          verdict?: string
        }
        Relationships: []
      }
      secret_files: {
        Row: {
          category: string
          created_at: string
          deep_explanation: string
          id: string
          rabbit_hole_links: string[]
          related_concepts: string[]
          summary: string
          topic: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          deep_explanation: string
          id?: string
          rabbit_hole_links?: string[]
          related_concepts?: string[]
          summary: string
          topic: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          deep_explanation?: string
          id?: string
          rabbit_hole_links?: string[]
          related_concepts?: string[]
          summary?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
