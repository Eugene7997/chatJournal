import { auth0 } from "@/lib/auth/auth0";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
    const session = await auth0.getSession();

    return (
        <NavbarClient
            isLoggedIn={!!session}
            picture={session?.user?.picture}
        />
    );
}
