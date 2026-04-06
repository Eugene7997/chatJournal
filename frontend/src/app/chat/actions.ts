"use server";

import { auth0 } from "@/lib/auth/auth0";
import { cookies } from "next/headers";
import query from "@/lib/db/db";

export async function syncUser() {
    const session = await auth0.getSession();
    if (!session) return;

    try {
        await query(
            `INSERT INTO users (sub) VALUES ($1) ON CONFLICT (sub) DO NOTHING`,
            [session.user.sub]
        );
        const cookieStore = await cookies();
        cookieStore.set("user_synced", "1", {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: "/",
        });
    } 
    catch (error) {
        console.error("Failed to sync user to DB:", error);
    }
}
