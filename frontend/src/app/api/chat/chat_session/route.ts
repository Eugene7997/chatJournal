import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import query from "@/lib/db/db";

export async function DELETE(request: NextRequest) {
    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.sub;

    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "sessionId is required" }), { status: 400 });
        }

        await query(
            `DELETE FROM chat_sessions WHERE id = $1 AND sub = $2`,
            [sessionId, userId]
        );

        return new Response(JSON.stringify({ message: "deleted" }), { status: 200 });
    }
    catch (error) {
        console.error(`error: ${error}`);
        return new Response(JSON.stringify(`Server error: ${error}`), { status: 500 });
    }
}

export async function POST() {

    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.sub;

    try {
        const result = await query(
            `INSERT INTO chat_sessions (sub) 
            SELECT sub FROM users WHERE sub = $1
            RETURNING id`,
            [userId]
        );
        const chatSessionId = result.rows[0]?.id;

        return new Response(JSON.stringify({ chat_session_id: chatSessionId }), { status: 200 });
    }
    catch (error) {
        console.error(`error: ${error}`)
        return new Response(JSON.stringify(`Server error: ${error}`), { status: 500 });
    }
}

export async function GET() {
    const session = await auth0.getSession();

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.sub;

    try {
        const result = await query(
            `SELECT id, name FROM chat_sessions WHERE sub = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const sessions = result.rows.map(row => ({ id: row.id, name: row.name ?? null }));

        return new Response(JSON.stringify({ sessions }), { status: 200 });
    }
    catch (error) {
        console.error(`error: ${error}`)
        return new Response(JSON.stringify(`Server error: ${error}`), { status: 500 });
    }
}