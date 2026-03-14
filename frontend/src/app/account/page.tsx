import { auth0 } from "@/lib/auth/auth0";
import { redirect } from "next/navigation";

export default async function AccountPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <>
            <p>Logged in as {session.user.email}</p>

            <h1>User Profile</h1>
            <pre>{JSON.stringify(session.user, null, 2)}</pre>

            <a href="/auth/logout">Logout</a>
        </>
    );
}
