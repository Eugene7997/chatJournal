import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import type { ChatCompletionResponse } from "@/lib/types/types";

const apiKey = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {

    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    let { message, role, stream, model } = await request.json();

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

    const payLoad = {
        model,
        stream,
        messages: [
            { role: "user", content: message }
        ]
    }

    try {
        let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            let data: ChatCompletionResponse = await response.json();
            let result = data.choices[0].message.content;
            return new Response(JSON.stringify({ message: result }), { status: 200 })
        }
        else {
            return new Response(response.body, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                }
            });
        }
    }

    catch (err: any) {
        console.log(`Error: ${err}`);
        if (err instanceof Error) {
            return new Response(JSON.stringify(err.toString()), { status: 500 });
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