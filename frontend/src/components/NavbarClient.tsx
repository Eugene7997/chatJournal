"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdMenu, MdClose } from "react-icons/md";
import NavbarProfile from "@/components/NavbarProfile";

export default function NavbarClient({ isLoggedIn, picture }: { isLoggedIn: boolean; picture?: string }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        ...(!isLoggedIn ? [{ href: "/login", label: "Login / Sign up" }] : []),
        ...(isLoggedIn ? [
            { href: "/chat", label: "Chat" },
            { href: "/journals", label: "Journals" },
            { href: "/account", label: "Account" },
        ] : []),
    ];

    return (
        <header>
            <div className="flex items-center justify-between p-3 sm:p-4">
                <Image width={100} height={100} src="/logo.svg" alt="ChatJournal logo" className="h-9 w-9 sm:h-12 sm:w-12 flex-none" />

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex gap-6">
                        {links.map(link => (
                            <Link key={link.href} href={link.href} className="text-xl hover:underline whitespace-nowrap">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    {picture && <NavbarProfile src={picture} />}
                </div>

                {/* Mobile: profile avatar + hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    {picture && <NavbarProfile src={picture} />}
                    <button
                        onClick={() => setMenuOpen(prev => !prev)}
                        className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <nav className="md:hidden border-t border-current/10 flex flex-col px-4 py-1">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="py-3 text-base border-b border-current/5 last:border-0 hover:opacity-60 transition-opacity"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
