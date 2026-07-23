export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContentStatus = "draft" | "review" | "published";
export type VerificationStatus = "placeholder" | "verified";
export type MediaType = "image" | "video";
export type AccessStatus = "open" | "contact_required" | "organized_only";
export type ContactInterest =
  | "journey"
  | "culture"
  | "ginseng"
  | "partnership"
  | "other";

type ContentCommonRow = {
  id: string;
  status: ContentStatus;
  is_placeholder: boolean;
  placeholder_label: string | null;
  source_url: string | null;
  source_credit: string | null;
  usage_permission: string | null;
  verified_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

type ContentCommonInsert = {
  id?: string;
  status?: ContentStatus;
  is_placeholder?: boolean;
  placeholder_label?: string | null;
  source_url?: string | null;
  source_credit?: string | null;
  usage_permission?: string | null;
  verified_at?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

type ContentCommonUpdate = ContentCommonInsert;

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: ContentCommonRow & {
          site_name: string;
          tagline: string | null;
          description: string | null;
          primary_cta_label: string | null;
          primary_cta_href: string | null;
          legal_address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          zalo_url: string | null;
          maps_url: string | null;
          privacy_url: string | null;
          header_title: string | null;
          header_subtitle: string | null;
          footer_title: string | null;
          footer_description: string | null;
          seo_title: string | null;
          seo_description: string | null;
          navigation: Json;
          hero_video_url: string | null;
          hero_video_asset_id: string | null;
          hero_mobile_poster_url: string | null;
          hero_mobile_poster_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          site_name: string;
          tagline?: string | null;
          description?: string | null;
          primary_cta_label?: string | null;
          primary_cta_href?: string | null;
          legal_address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          zalo_url?: string | null;
          maps_url?: string | null;
          privacy_url?: string | null;
          header_title?: string | null;
          header_subtitle?: string | null;
          footer_title?: string | null;
          footer_description?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          navigation?: Json;
          hero_video_url?: string | null;
          hero_video_asset_id?: string | null;
          hero_mobile_poster_url?: string | null;
          hero_mobile_poster_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          site_name?: string;
          tagline?: string | null;
          description?: string | null;
          primary_cta_label?: string | null;
          primary_cta_href?: string | null;
          legal_address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          zalo_url?: string | null;
          maps_url?: string | null;
          privacy_url?: string | null;
          header_title?: string | null;
          header_subtitle?: string | null;
          footer_title?: string | null;
          footer_description?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          navigation?: Json;
          hero_video_url?: string | null;
          hero_video_asset_id?: string | null;
          hero_mobile_poster_url?: string | null;
          hero_mobile_poster_asset_id?: string | null;
        };
        Relationships: [];
      };
      hero_slides: {
        Row: ContentCommonRow & {
          eyebrow: string | null;
          title: string;
          description: string | null;
          image_url: string;
          alt_text: string;
          cta_label: string | null;
          cta_href: string | null;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          eyebrow?: string | null;
          title: string;
          description?: string | null;
          image_url: string;
          alt_text: string;
          cta_label?: string | null;
          cta_href?: string | null;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          eyebrow?: string | null;
          title?: string;
          description?: string | null;
          image_url?: string;
          alt_text?: string;
          cta_label?: string | null;
          cta_href?: string | null;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      stories: {
        Row: ContentCommonRow & {
          eyebrow: string | null;
          title: string;
          description: string | null;
          body: Json;
          quote: string | null;
          image_url: string | null;
          alt_text: string | null;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          eyebrow?: string | null;
          title: string;
          description?: string | null;
          body?: Json;
          quote?: string | null;
          image_url?: string | null;
          alt_text?: string | null;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          eyebrow?: string | null;
          title?: string;
          description?: string | null;
          body?: Json;
          quote?: string | null;
          image_url?: string | null;
          alt_text?: string | null;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      journeys: {
        Row: ContentCommonRow & {
          title: string;
          slug: string;
          category: string;
          short_description: string;
          body: Json;
          image_url: string;
          alt_text: string;
          location_label: string | null;
          duration_label: string | null;
          access_note: string | null;
          safety_note: string | null;
          highlights: Json;
          access_status: AccessStatus;
          contact_required: boolean;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          title: string;
          slug: string;
          category: string;
          short_description: string;
          body?: Json;
          image_url: string;
          alt_text: string;
          location_label?: string | null;
          duration_label?: string | null;
          access_note?: string | null;
          safety_note?: string | null;
          highlights?: Json;
          access_status?: AccessStatus;
          contact_required?: boolean;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          title?: string;
          slug?: string;
          category?: string;
          short_description?: string;
          body?: Json;
          image_url?: string;
          alt_text?: string;
          location_label?: string | null;
          duration_label?: string | null;
          access_note?: string | null;
          safety_note?: string | null;
          highlights?: Json;
          access_status?: AccessStatus;
          contact_required?: boolean;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      ginseng_story_steps: {
        Row: ContentCommonRow & {
          step_number: number;
          title: string;
          description: string;
          quote: string | null;
          image_url: string | null;
          alt_text: string | null;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          step_number: number;
          title: string;
          description: string;
          quote?: string | null;
          image_url?: string | null;
          alt_text?: string | null;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          step_number?: number;
          title?: string;
          description?: string;
          quote?: string | null;
          image_url?: string | null;
          alt_text?: string | null;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      culture_stories: {
        Row: ContentCommonRow & {
          title: string;
          description: string;
          image_url: string;
          alt_text: string;
          caption: string | null;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          title: string;
          description: string;
          image_url: string;
          alt_text: string;
          caption?: string | null;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          title?: string;
          description?: string;
          image_url?: string;
          alt_text?: string;
          caption?: string | null;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      local_products: {
        Row: ContentCommonRow & {
          name: string;
          slug: string;
          category: string;
          description: string;
          image_url: string;
          alt_text: string;
          origin_note: string | null;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          name: string;
          slug: string;
          category: string;
          description: string;
          image_url: string;
          alt_text: string;
          origin_note?: string | null;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          name?: string;
          slug?: string;
          category?: string;
          description?: string;
          image_url?: string;
          alt_text?: string;
          origin_note?: string | null;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      ginseng_products: {
        Row: ContentCommonRow & {
          name: string;
          slug: string;
          product_type: string;
          short_description: string;
          image_url: string;
          alt_text: string;
          contact_url: string | null;
          origin_note: string | null;
          legal_disclaimer: string;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          name: string;
          slug: string;
          product_type: string;
          short_description: string;
          image_url: string;
          alt_text: string;
          contact_url?: string | null;
          origin_note?: string | null;
          legal_disclaimer: string;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          name?: string;
          slug?: string;
          product_type?: string;
          short_description?: string;
          image_url?: string;
          alt_text?: string;
          contact_url?: string | null;
          origin_note?: string | null;
          legal_disclaimer?: string;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      travel_guides: {
        Row: ContentCommonRow & {
          title: string;
          slug: string;
          category: string;
          excerpt: string;
          body: Json;
          image_url: string | null;
          alt_text: string | null;
          read_time_label: string | null;
          season_label: string | null;
          sections: Json;
          media_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          title: string;
          slug: string;
          category: string;
          excerpt: string;
          body?: Json;
          image_url?: string | null;
          alt_text?: string | null;
          read_time_label?: string | null;
          season_label?: string | null;
          sections?: Json;
          media_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          title?: string;
          slug?: string;
          category?: string;
          excerpt?: string;
          body?: Json;
          image_url?: string | null;
          alt_text?: string | null;
          read_time_label?: string | null;
          season_label?: string | null;
          sections?: Json;
          media_asset_id?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: ContentCommonRow & {
          title: string;
          file_url: string;
          storage_path: string | null;
          alt_text: string;
          section: string | null;
          verification_status: VerificationStatus;
          media_type: MediaType;
          mime_type: string | null;
          file_size_bytes: number | null;
          external_url: string | null;
          width: number | null;
          height: number | null;
          poster_asset_id: string | null;
        };
        Insert: ContentCommonInsert & {
          title: string;
          file_url: string;
          storage_path?: string | null;
          alt_text: string;
          section?: string | null;
          verification_status?: VerificationStatus;
          media_type?: MediaType;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          external_url?: string | null;
          width?: number | null;
          height?: number | null;
          poster_asset_id?: string | null;
        };
        Update: ContentCommonUpdate & {
          title?: string;
          file_url?: string;
          storage_path?: string | null;
          alt_text?: string;
          section?: string | null;
          verification_status?: VerificationStatus;
          media_type?: MediaType;
          mime_type?: string | null;
          file_size_bytes?: number | null;
          external_url?: string | null;
          width?: number | null;
          height?: number | null;
          poster_asset_id?: string | null;
        };
        Relationships: [];
      };
      page_sections: {
        Row: {
          id: string;
          section_key: string;
          eyebrow: string | null;
          title: string;
          description: string | null;
          secondary_text: string | null;
          cta_label: string | null;
          cta_href: string | null;
          badges: Json;
          stats: Json;
          media_asset_id: string | null;
          status: ContentStatus;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          eyebrow?: string | null;
          title: string;
          description?: string | null;
          secondary_text?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          badges?: Json;
          stats?: Json;
          media_asset_id?: string | null;
          status?: ContentStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          section_key?: string;
          eyebrow?: string | null;
          title?: string;
          description?: string | null;
          secondary_text?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          badges?: Json;
          stats?: Json;
          media_asset_id?: string | null;
          status?: ContentStatus;
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          role: "admin" | "editor";
          is_active: boolean;
          last_sign_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          role?: "admin" | "editor";
          is_active?: boolean;
          last_sign_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          email?: string;
          role?: "admin" | "editor";
          is_active?: boolean;
          last_sign_in_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          interest: ContactInterest | null;
          message: string;
          consent: boolean;
          status: "new" | "in_progress" | "resolved" | "spam";
          request_fingerprint: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          interest?: ContactInterest | null;
          message: string;
          consent: boolean;
          status?: "new" | "in_progress" | "resolved" | "spam";
          request_fingerprint: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "new" | "in_progress" | "resolved" | "spam";
          interest?: ContactInterest | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          consent: boolean;
          status: "subscribed" | "unsubscribed";
          request_fingerprint: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          consent: boolean;
          status?: "subscribed" | "unsubscribed";
          request_fingerprint: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          consent?: boolean;
          status?: "subscribed" | "unsubscribed";
          request_fingerprint?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          key: string;
          window_started_at: string;
          request_count: number;
          updated_at: string;
        };
        Insert: {
          key: string;
          window_started_at?: string;
          request_count?: number;
          updated_at?: string;
        };
        Update: {
          window_started_at?: string;
          request_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_rate_limit: {
        Args: {
          p_key: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      access_status: AccessStatus;
      content_status: ContentStatus;
      verification_status: VerificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ContentTableName =
  | "site_settings"
  | "hero_slides"
  | "stories"
  | "journeys"
  | "ginseng_story_steps"
  | "culture_stories"
  | "local_products"
  | "ginseng_products"
  | "travel_guides"
  | "media_assets"
  | "page_sections";
