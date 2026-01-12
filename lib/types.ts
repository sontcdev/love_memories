// Database types based on Supabase schema

export type TemplateType = 'LOVE' | 'EVERY' | 'IDOL'
export type ModeCount = 'UP' | 'DOWN' | 'NONE'
export type ContentType = 'GALLERY' | 'TIMELINE' | 'LETTER' | 'IDOL_MILESTONE'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

export interface Page {
    id: string
    username: string
    passcode_hash: string | null
    template_type: TemplateType
    theme_config: Record<string, any>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface PageData {
    id: string
    page_id: string
    mode_count: ModeCount
    target_date: string | null
    title_text: string
    participants: Participant[]
    background_music_url: string | null
    is_music_autoplay: boolean
    created_at: string
    updated_at: string
}

export interface Participant {
    name: string
    dob: string
    role: string
    avatar_url: string
}

export interface ContentItem {
    id: string
    page_id: string
    type: ContentType
    title: string | null
    content: string | null
    image_url: string | null
    date_event: string | null
    sort_order: number
    created_at: string
    updated_at: string
}

export interface GameCard {
    id: string
    content: string
    level: DifficultyLevel
    created_at: string
    updated_at: string
}

// Supabase Database type
export interface Database {
    public: {
        Tables: {
            pages: {
                Row: Page
                Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Page, 'id' | 'created_at' | 'updated_at'>>
            }
            page_data: {
                Row: PageData
                Insert: Omit<PageData, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<PageData, 'id' | 'created_at' | 'updated_at'>>
            }
            content_items: {
                Row: ContentItem
                Insert: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>
            }
            game_cards: {
                Row: GameCard
                Insert: Omit<GameCard, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<GameCard, 'id' | 'created_at' | 'updated_at'>>
            }
        }
    }
}

// Template color configurations
export const TEMPLATE_COLORS = {
    LOVE: {
        background: '#FFCDD4',
        primary: '#E30523',
        buttonText: '#FFFFFF',
    },
    EVERY: {
        background: '#6AD59D',
        primary: '#3D2181',
        buttonText: '#FFFFFF',
    },
    IDOL: {
        background: '#97D5FF',
        primary: '#FFFFFF',
        buttonText: '#E30523',
    },
} as const

// Difficulty level translations
export const DIFFICULTY_LABELS = {
    EASY: 'Dễ',
    MEDIUM: 'Vừa',
    HARD: 'Khó',
} as const
