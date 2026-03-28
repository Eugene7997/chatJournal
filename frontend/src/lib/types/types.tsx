export interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

export interface User {
    name?           : string    | undefined,
    nickname?       : string    | undefined,
    picture?        : string    | undefined,
    sub             : string    | undefined,
    given_name?     : string    | undefined,
    family_name?    : string    | undefined,
    email?          : string    | undefined,
    email_verified? : boolean   | undefined
}

export interface ChatCompletionResponse {
    id: string;
    model: string;
    provider: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: Usage;
}

export interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost: number;
    prompt_tokens_details?: {
        cached_tokens?: number; // Also called cached_input_tokens
        cache_creation_input_tokens?: number;
        audio_tokens?: number;
    };
    completion_tokens_details?: {
        reasoning_tokens?: number;
    };
}

export interface Journal {
    id          : string; // UUID
    session_id  : string; // UUID
    sub         : string;
    title       : string;
    content     : string;
    created_at  : string; // ISO timestamp
}

export interface ChatSession {
    id   : string;
    name : string | null;
}

export interface ChatMessage {
    id              : string; // UUID
    session_id      : string; // UUID
    role            : "user" | "assistant" | "system";
    content         : string;
    message_type    : "text" | "audio" | "image";
    audio_url       : string | null;
    audio_duration  : number | null;
    model           : string | null;
    created_at      : string; // ISO timestamp
}