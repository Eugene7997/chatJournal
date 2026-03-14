import { auth0 } from "@/lib/auth/auth0";
import Chat from "@/src/components/Chat";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <>
            <Chat/>
        </>
    );
}
