import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import type { ChatCompletionResponse } from "@/lib/types/types";
import query from "@/lib/db/db";
import { chatPrompt } from "@/lib/prompts/promptManager";

const apiKey = process.env.OPENROUTER_API_KEY;

export async function GET(request: NextRequest) {
    const session = await auth0.getSession();
    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    // TODO: Decide whether to use userId. But requires schema changes.
    // const userId = session.user.sub;

    try {
        const result = await query(
            `SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at`,
            [sessionId]
        );

        const messages = result.rows;

        return new Response(JSON.stringify({ messages }), { status: 200 });
    }
    catch (error) {
        console.log(`error: ${error}`)
        return new Response(JSON.stringify(`Server error: ${error}`), { status: 500 });
    }
}

export async function POST(request: NextRequest) {

    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { message, role, stream, sessionId } = body 
    let { model } = body;

    if (!message) {
        return new Response(JSON.stringify("Missing 'message' in request body"), { status: 400 });
    }
    if (!role) {
        return new Response(JSON.stringify("Missing 'role' in request body"), { status: 400 });
    }
    if (!model) {
        model = "google/gemini-2.5-flash-lite"
    }

    if (!apiKey) {
        return new Response(JSON.stringify("OPENROUTER_API_KEY is not set on the server"), { status: 500 });
    }

    // Fetch conversation history for this session
    let historyMessages: { role: string; content: string }[] = [];
    if (sessionId) {
        const historyResult = await query(
            `SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at`,
            [sessionId]
        );
        historyMessages = historyResult.rows as { role: string; content: string }[];
    }

    const payLoad = {
        model,
        stream,
        messages: [
            { role: "system", content: chatPrompt },
            ...historyMessages,
            { role, content: message }
        ]
        // TODO: consider adding tools
        // tools
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payLoad)
        });

        if (!response.body) {
            return new Response("No response body", { status: 500 });
        }

        if (!stream) {
            const data: ChatCompletionResponse = await response.json();

            if (sessionId) {
                const assistantContent = data.choices[0]?.message?.content;

                // User message
                await query(
                    `INSERT INTO chat_messages (session_id, role, content, message_type, model)
                     VALUES ($1, $2, $3, 'text', $4)`,
                    [sessionId, role, message, model]
                );

                // Chatbot message
                const assistantMsgResult = await query(
                    `INSERT INTO chat_messages (session_id, role, content, message_type, model)
                     VALUES ($1, 'assistant', $2, 'text', $3) RETURNING id`,
                    [sessionId, assistantContent, data.model]
                );

                const assistantMessageId = assistantMsgResult.rows[0]?.id;
                if (assistantMessageId) {
                    await query(
                        `INSERT INTO chat_completion_usage
                            (message_id, openrouter_id, provider, prompt_tokens, completion_tokens, total_tokens, cost)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            assistantMessageId,
                            data.id,
                            data.provider ?? null,
                            data.usage?.prompt_tokens ?? null,
                            data.usage?.completion_tokens ?? null,
                            data.usage?.total_tokens ?? null,
                            data.usage?.cost ?? null,
                        ]
                    );
                }
            }

            return new Response(JSON.stringify({ data }), { status: 200 })
        }
        else {
            return new Response(response.body, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                }
            });
        }
    }

    catch (error) {
        console.log(`Error: ${error}`);
        if (error instanceof Error) {
            return new Response(JSON.stringify(error.toString()), { status: 500 });
        }
        else {
            return new Response(JSON.stringify("Some dumb ship happened"), { status: 500 });
        }
    }
}

export async function DELETE() {
    const session = await auth0.getSession();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
}