export type Database = {
    public: {
        Tables: {
            links: {
                Row: {
                    id: string;
                    username: string;
                    template_type: string;
                    guest_password_hash: string | null;
                    owner_pin_hash: string;
                    settings: LinkSettings;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                    created_by_admin: string | null;
                };
                Insert: Omit<Database['public']['Tables']['links']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['links']['Insert']>;
            };
            memories: {
                Row: {
                    id: string;
                    link_id: string;
                    title: string;
                    event_date: string;
                    description: string | null;
                    image_url: string | null;
                    video_url: string | null;
                    audio_url: string | null;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['memories']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['memories']['Insert']>;
            };
            gallery: {
                Row: {
                    id: string;
                    link_id: string;
                    image_url: string;
                    width: number | null;
                    height: number | null;
                    caption: string | null;
                    taken_at: string | null;
                    sort_order: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['gallery']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['gallery']['Insert']>;
            };
            games: {
                Row: {
                    id: string;
                    link_id: string;
                    question: string;
                    answer: string;
                    category: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['games']['Insert']>;
            };
            messages: {
                Row: {
                    id: string;
                    link_id: string;
                    title: string | null;
                    content: string;
                    open_at: string;
                    is_opened: boolean;
                    opened_at: string | null;
                    visible_to: 'owner' | 'guest' | 'both';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['messages']['Insert']>;
            };
        };
        Functions: {
            verify_guest_password: {
                Args: { p_link_id: string; p_password: string };
                Returns: boolean;
            };
            verify_owner_pin: {
                Args: { p_link_id: string; p_pin: string };
                Returns: boolean;
            };
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
        };
    };
};

export interface LinkSettings {
    // Profile
    names?: [string, string]; // [Person 1, Person 2]
    anniversary_date?: string; // ISO date
    short_note?: string;

    // Theme
    theme?: 'love' | 'friendship' | 'family';
    background_color?: string;
    accent_color?: string;
    font_family?: string;

    // Additional customization
    custom_css?: string;
}

export type ViewMode = 'guest' | 'owner';

export interface AuthState {
    isAuthenticated: boolean;
    viewMode: ViewMode | null;
    linkId: string | null;
}
