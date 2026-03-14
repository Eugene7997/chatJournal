import { auth0 } from "@/lib/auth/auth0";
import NavbarProfile from "@/components/NavbarProfile";

export default async function Navbar() {
    const session = await auth0.getSession();

    return (
        <header>
            <div className="flex items-center justify-between p-4">
                <img src="/logo.svg" alt="ChatJournal logo" className="h-8 w-8" />
                <div className="flex items-center gap-8">
                    <nav className="flex justify-center gap-8">
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/login">Login or Sign up</a>
                        {session && <a href="/account">Account</a>}
                    </nav>
                    {session?.user?.picture && <NavbarProfile src={session.user.picture} />}
                </div>
            </div>
        </header>
    );
}