// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update this file (or generate it with
// `supabase gen types typescript`) to keep the app in sync.

export type QuoteStatus = "draft" | "sent";
export type Plan = "free" | "pro";

export interface ProfileRow {
  user_id: string;
  business_name: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  trn: string | null;
  vat_registered: boolean;
  plan: Plan;
  created_at: string;
  updated_at: string;
}

export interface QuoteRow {
  id: string;
  user_id: string;
  quote_number: string;
  customer_name: string | null;
  original_message: string | null;
  ai_reply: string | null;
  service: string;
  description: string | null;
  location: string | null;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { user_id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      quotes: {
        Row: QuoteRow;
        Insert: Partial<QuoteRow> & { user_id: string; quote_number: string };
        Update: Partial<QuoteRow>;
        Relationships: [];
      };
      quote_counters: {
        Row: { user_id: string; last_number: number };
        Insert: { user_id: string; last_number?: number };
        Update: { user_id?: string; last_number?: number };
        Relationships: [];
      };
      quote_usage: {
        Row: { user_id: string; month_start: string; quote_count: number; updated_at: string };
        Insert: { user_id: string; month_start: string; quote_count?: number; updated_at?: string };
        Update: { quote_count?: number; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_quote_number: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
