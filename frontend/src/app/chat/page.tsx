import { auth0 } from "@/lib/auth/auth0";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ChatClient from "@/src/components/ChatClient";
import UserSync from "@/src/components/UserSync";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/login");
    }

    // "Lazy" Sync: Ensure user exists in our DB upon first successful load.
    // Skipped for returning users who already have the sync cookie set.
    // TODO: Auth0 is horrible. We need to migrate.
    const cookieStore = await cookies();
    const synced = cookieStore.get("user_synced");

    const { session: initialSessionId } = await searchParams;

    return (
        <>
            {!synced && <UserSync />}
            <ChatClient initialSessionId={initialSessionId} />
        </>
    );
}
