import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import query from "@/lib/db/db";

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
        console.log(`error: ${error}`)
        return new Response(JSON.stringify(`Database account deletion FAILED: ${error}`), { status: 500 });
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
            `SELECT id FROM chat_sessions WHERE sub = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const sessionIds: string[] = result.rows.map(row => row.id);

        return new Response(JSON.stringify({ sessionIds }), { status: 200 });
    }
    catch (error) {
        console.log(`error: ${error}`)
        return new Response(JSON.stringify(`Database account deletion FAILED: ${error}`), { status: 500 });
    }
}