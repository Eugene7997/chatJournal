import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import query from "@/lib/db/db";
import { journalPrompt } from "@/lib/prompts/promptManager";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
    const session = await auth0.getSession();
    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
        return new Response(JSON.stringify("Missing sessionId"), { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
        return new Response(JSON.stringify("OPENROUTER_API_KEY is not set on the server"), { status: 500 });
    }

    let result;
    try {
        result = await query(
            `SELECT role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at`,
            [sessionId]
        );
    } 
    catch (error) {
        return new Response(JSON.stringify(`Database error: ${error}`), { status: 500 });
    }

    if (!result.rows.length) {
        return new Response(JSON.stringify("No messages found for this session"), { status: 404 });
    }

    const sessionDate = new Date(result.rows[0].created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const conversation = result.rows
        .map((row: { role: string; content: string; created_at: string }) => {
            const time = new Date(row.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            return `[${time}] ${row.role}: ${row.content}`;
        })
        .join("\n");

    const systemPrompt = journalPrompt(sessionDate);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Journal conversation:\n\n${conversation}` },
                ],
            }),
        });

        if (!response.ok) {
            return new Response(JSON.stringify(`LLM error: ${response.statusText}`), { status: 500 });
        }

        const data = await response.json();
        const journal = data.choices[0]?.message?.content ?? "";

        return new Response(JSON.stringify({ journal }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(`Error generating journal: ${error}`), { status: 500 });
    }
}
