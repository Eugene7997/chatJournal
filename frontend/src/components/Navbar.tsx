import { auth0 } from "@/lib/auth/auth0";
import NavbarProfile from "@/components/NavbarProfile";

export default async function Navbar() {
    const session = await auth0.getSession();

    return (
        <header>
            <div className="flex items-center justify-between p-4">
                <img src="/logo.svg" alt="ChatJournal logo" className="h-12 w-12" />
                <div className="flex items-center gap-8">
                    <nav className="flex justify-center gap-8">
                        <a href="/" className="text-xl hover:underline">Home</a>
                        <a href="/about" className="text-xl hover:underline">About</a>
                        {!session && <a href="/login" className="text-xl hover:underline">Login or Sign up</a>}
                        {session && <a href="/chat" className="text-xl hover:underline">Chat</a>}
                        {session && <a href="/journals" className="text-xl hover:underline">Journals</a>}
                        {session && <a href="/account" className="text-xl hover:underline">Account</a>}
                    </nav>
                    {session?.user?.picture && <NavbarProfile src={session.user.picture} />}
                </div>
            </div>
        </header>
    );
}