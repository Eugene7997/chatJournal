import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import query from "@/lib/db/db";

export async function POST(request: NextRequest) {
    const session = await auth0.getSession();
    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { sessionId, title, content } = body;

    if (!sessionId || !content) {
        return new Response(JSON.stringify("Missing sessionId or content"), { status: 400 });
    }

    try {
        const result = await query<{ id: string }>(
            `INSERT INTO journals (session_id, sub, title, content) VALUES ($1, $2, $3, $4) RETURNING id`,
            [sessionId, session.user.sub, title ?? "", content]
        );
        return new Response(JSON.stringify({ journal_id: result.rows[0].id }), { status: 201 });
    } 
    catch (error) {
        return new Response(JSON.stringify(`Database error: ${error}`), { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth0.getSession();
    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { journalId, deleteAll } = body;

    if (!journalId && !deleteAll) {
        return new Response(JSON.stringify("Missing journalId or deleteAll"), { status: 400 });
    }

    try {
        if (deleteAll) {
            await query(`DELETE FROM journals WHERE sub = $1`, [session.user.sub]);
        } 
        else {
            await query(`DELETE FROM journals WHERE id = $1 AND sub = $2`, [journalId, session.user.sub]);
        }
        return new Response(JSON.stringify({ message: "deleted" }), { status: 200 });
    }
    catch (error) {
        return new Response(JSON.stringify(`Database error: ${error}`), { status: 500 });
    }
}

export async function GET() {
    const session = await auth0.getSession();
    if (!session) {
        return new Response(JSON.stringify("Unauthorized"), { status: 401 });
    }

    try {
        const result = await query(
            `SELECT id, session_id, sub, title, content, created_at
             FROM journals
             WHERE sub = $1
             ORDER BY created_at DESC`,
            [session.user.sub]
        );
        return new Response(JSON.stringify({ journals: result.rows }), { status: 200 });
    }
    catch (error) {
        return new Response(JSON.stringify(`Database error: ${error}`), { status: 500 });
    }
}
