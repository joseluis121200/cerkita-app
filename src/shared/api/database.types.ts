// Tipos de la base de datos (supabase/migrations 0001 a 0004).
// Escritos a mano con el formato de `supabase gen types`. En cuanto funcione Supabase local,
// regenerarlos con `npm run db:types` (AGENTS.md, regla 1). No editar a mano después.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type FamilyFk<Name extends string> = {
  foreignKeyName: Name;
  columns: ['family_id'];
  isOneToOne: false;
  referencedRelation: 'families';
  referencedColumns: ['id'];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: '13.0.5' };
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_path: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name: string; avatar_path?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; display_name?: string; avatar_path?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          plan_status: Database['public']['Enums']['plan_status'];
          trial_ends_at: string;
          paid_until: string | null;
          revenuecat_app_user_id: string | null;
          invite_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          plan_status?: Database['public']['Enums']['plan_status'];
          trial_ends_at?: string;
          paid_until?: string | null;
          revenuecat_app_user_id?: string | null;
          invite_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['families']['Row']>;
        Relationships: [];
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: Database['public']['Enums']['member_role'];
          display_role_label: string | null;
          receive_critical_emails: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role: Database['public']['Enums']['member_role'];
          display_role_label?: string | null;
          receive_critical_emails?: boolean;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['family_members']['Row']>;
        Relationships: [FamilyFk<'family_members_family_id_fkey'>];
      };
      elder_monitors: {
        Row: {
          id: string;
          family_id: string;
          elder_user_id: string | null;
          display_name: string;
          relationship_label: string | null;
          avatar_path: string | null;
          timezone: string;
          phone_for_call: string | null;
          window_start: string;
          reminder_1_at: string;
          reminder_2_at: string;
          admin_alert_at: string;
          active_days_mask: number;
          paused_until: string | null;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          elder_user_id?: string | null;
          display_name: string;
          relationship_label?: string | null;
          avatar_path?: string | null;
          timezone?: string;
          phone_for_call?: string | null;
          window_start?: string;
          reminder_1_at?: string;
          reminder_2_at?: string;
          admin_alert_at?: string;
          active_days_mask?: number;
          paused_until?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['elder_monitors']['Row']>;
        Relationships: [FamilyFk<'elder_monitors_family_id_fkey'>];
      };
      pairing_codes: {
        Row: {
          id: string;
          code_6_digits: string;
          family_id: string;
          elder_monitor_id: string;
          created_by: string | null;
          expires_at: string;
          used_at: string | null;
          used_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code_6_digits: string;
          family_id: string;
          elder_monitor_id: string;
          created_by?: string | null;
          expires_at: string;
          used_at?: string | null;
          used_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pairing_codes']['Row']>;
        Relationships: [FamilyFk<'pairing_codes_family_id_fkey'>];
      };
      device_push_tokens: {
        Row: { id: string; user_id: string; expo_push_token: string; platform: Database['public']['Enums']['push_platform']; updated_at: string };
        Insert: { id?: string; user_id: string; expo_push_token: string; platform: Database['public']['Enums']['push_platform']; updated_at?: string };
        Update: Partial<Database['public']['Tables']['device_push_tokens']['Row']>;
        Relationships: [];
      };
      moments: {
        Row: {
          id: string;
          family_id: string;
          author_id: string;
          storage_path: string;
          caption: string | null;
          expires_on: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          author_id?: string;
          storage_path: string;
          caption?: string | null;
          expires_on?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moments']['Row']>;
        Relationships: [FamilyFk<'moments_family_id_fkey'>];
      };
      moment_reactions: {
        Row: { moment_id: string; family_id: string; user_id: string; emoji: string; created_at: string };
        Insert: { moment_id: string; family_id: string; user_id?: string; emoji: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['moment_reactions']['Row']>;
        Relationships: [FamilyFk<'moment_reactions_family_id_fkey'>];
      };
      moment_comments: {
        Row: { id: string; moment_id: string; family_id: string; author_id: string; body: string; created_at: string };
        Insert: { id?: string; moment_id: string; family_id: string; author_id?: string; body: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['moment_comments']['Row']>;
        Relationships: [FamilyFk<'moment_comments_family_id_fkey'>];
      };
      member_nudges: {
        Row: {
          id: string;
          family_id: string;
          from_user_id: string;
          to_user_id: string;
          local_date: string;
          notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          from_user_id?: string;
          to_user_id: string;
          local_date?: string;
          notified_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['member_nudges']['Row']>;
        Relationships: [FamilyFk<'member_nudges_family_id_fkey'>];
      };
      daily_checkins: {
        Row: {
          id: string;
          elder_monitor_id: string;
          family_id: string;
          local_date: string;
          status: Database['public']['Enums']['checkin_status'];
          confirmed_at: string | null;
          source: Database['public']['Enums']['checkin_source'] | null;
          resolved_by_user_id: string | null;
          resolution_note: string | null;
          family_notified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          elder_monitor_id: string;
          family_id: string;
          local_date: string;
          status?: Database['public']['Enums']['checkin_status'];
          confirmed_at?: string | null;
          source?: Database['public']['Enums']['checkin_source'] | null;
          resolved_by_user_id?: string | null;
          resolution_note?: string | null;
          family_notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_checkins']['Row']>;
        Relationships: [FamilyFk<'daily_checkins_family_id_fkey'>];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_family: { Args: { p_name: string }; Returns: string };
      join_family: { Args: { p_invite_token: string }; Returns: string };
      set_member_role: {
        Args: { p_member_id: string; p_role: Database['public']['Enums']['member_role'] };
        Returns: undefined;
      };
      create_pairing_code: {
        Args: { p_elder_monitor_id: string };
        Returns: { pairing_code: string; valid_until: string }[];
      };
      redeem_pairing_code: {
        Args: { p_code: string; p_user_id: string };
        Returns: { paired_family_id: string; paired_elder_monitor_id: string }[];
      };
      register_checkin: {
        Args: { p_source: Database['public']['Enums']['checkin_source']; p_occurred_at?: string };
        Returns: boolean;
      };
      resolve_checkin: { Args: { p_checkin_id: string; p_note?: string }; Returns: boolean };
      count_locked_moments: { Args: { p_family_id: string }; Returns: number };
      set_member_label: { Args: { p_member_id: string; p_label: string }; Returns: undefined };
      remove_member: { Args: { p_member_id: string }; Returns: undefined };
      register_push_token: {
        Args: { p_token: string; p_platform: Database['public']['Enums']['push_platform'] };
        Returns: undefined;
      };
    };
    Enums: {
      member_role: 'admin' | 'member' | 'elder';
      plan_status: 'trialing' | 'free_limited' | 'active_paid' | 'grace_period';
      checkin_status: 'pending' | 'ok' | 'reminded_1' | 'reminded_2' | 'alerted_admins' | 'resolved_by_admin';
      checkin_source: 'morning_button' | 'photo_opened' | 'manual_admin';
      push_platform: 'ios' | 'android';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
