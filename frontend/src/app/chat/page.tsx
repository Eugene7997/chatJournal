import { auth0 } from "@/lib/auth/auth0";
import { redirect } from "next/navigation";
import query from "@/lib/db/db";
import Chat from "@/components/Chat";

export default async function ChatPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/login");
    }

    // "Lazy" Sync: Ensure user exists in our DB upon first successful load
    // TODO: Auth0 is horrible. We need to migrate.
    try {
        await query(
            `INSERT INTO users (sub) VALUES ($1) ON CONFLICT (sub) DO NOTHING`,
            [session.user.sub]
        );
    } catch (error) {
        console.error("Failed to sync user to DB:", error);
    }

    return (
        <>
            <Chat/>
        </>
    );
}
