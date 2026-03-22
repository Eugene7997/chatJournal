import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import query from "@/lib/db/db";

export async function POST(request: NextRequest) {
    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const {
        sessionId, role, content, messageType, model, audioUrl, audioDuration,
        openrouterId, provider, promptTokens, completionTokens, totalTokens, cost,
    } = await request.json();

    if (!sessionId || !role || !content) {
        return new Response(
            JSON.stringify({ error: "Missing required fields: sessionId, role, content" }),
            { status: 400 }
        );
    }

    try {
        // chat_messages table
        const msgResult = await query(
            `INSERT INTO chat_messages (session_id, role, content, message_type, model, audio_url, audio_duration)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [sessionId, role, content, messageType ?? "text", model ?? null, audioUrl ?? null, audioDuration ?? null]
        );

        const messageId = msgResult.rows[0]?.id;
        const hasUsage = openrouterId || promptTokens != null || completionTokens != null || totalTokens != null || cost != null;
        
        // chat_completion_usage table
        if (messageId && hasUsage) {
            await query(
                `INSERT INTO chat_completion_usage
                    (message_id, openrouter_id, provider, prompt_tokens, completion_tokens, total_tokens, cost)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [messageId, openrouterId ?? null, provider ?? null, promptTokens ?? null, completionTokens ?? null, totalTokens ?? null, cost ?? null]
            );
        }

        return new Response(JSON.stringify({ message_id: messageId }), { status: 201 });
    } catch (error) {
        console.error(`error: ${error}`);
        return new Response(JSON.stringify({ error: `Server error: ${error}` }), { status: 500 });
    }
}
