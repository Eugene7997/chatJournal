import { auth0 } from "@/lib/auth/auth0";
import { redirect } from "next/navigation";
import Account from "@/components/Account";
import type { User } from "@/lib/types/types";

export default async function AccountPage() {
    const session = await auth0.getSession();
    if (!session) {
        redirect("/login");
    }

    const user: User = session.user;

    return (
        <Account user={user} />
    );
    
}
