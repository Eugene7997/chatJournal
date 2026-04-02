import Image from "next/image";
import Link from "next/link";
import { auth0 } from "@/lib/auth/auth0";
import NavbarProfile from "@/components/NavbarProfile";

export default async function Navbar() {
    const session = await auth0.getSession();

    return (
        <header>
            <div className="flex items-center justify-between p-4">
                <Image width={100} height={100} src="/logo.svg" alt="ChatJournal logo" className="h-12 w-12" />
                <div className="flex items-center gap-8">
                    <nav className="flex justify-center gap-8">
                        <Link href="/" className="text-xl hover:underline">Home</Link>
                        <Link href="/about" className="text-xl hover:underline">About</Link>
                        {!session && <Link href="/login" className="text-xl hover:underline">Login or Sign up</Link>}
                        {session && <Link href="/chat" className="text-xl hover:underline">Chat</Link>}
                        {session && <Link href="/journals" className="text-xl hover:underline">Journals</Link>}
                        {session && <Link href="/account" className="text-xl hover:underline">Account</Link>}
                    </nav>
                    {session?.user?.picture && <NavbarProfile src={session.user.picture} />}
                </div>
            </div>
        </header>
    );
}