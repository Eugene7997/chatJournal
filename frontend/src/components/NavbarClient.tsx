"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import NavbarProfile from "@/components/NavbarProfile";

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 hover:text-brand transition-colors opacity-60 hover:opacity-100"
            aria-label="Toggle theme"
        >
            <Sun size={16} className="hidden dark:block" />
            <Moon size={16} className="dark:hidden" />
        </button>
    );
}

export default function NavbarClient({ isLoggedIn, picture }: { isLoggedIn: boolean; picture?: string }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    function isActive(href: string) {
        return href === "/" ? pathname === "/" : pathname.startsWith(href);
    }

    const links = [
        { href: "/", label: "HOME" },
        { href: "/about", label: "ABOUT" },
        ...(!isLoggedIn ? [{ href: "/login", label: "LOGIN / SIGN UP" }] : []),
        ...(isLoggedIn ? [
            { href: "/chat", label: "CHAT" },
            { href: "/journals", label: "JOURNALS" },
            { href: "/account", label: "ACCOUNT" },
        ] : []),
    ];

    return (
        <header className="border-b border-current/10">
            <div className="flex items-center justify-between px-4 sm:px-6 h-16">
                <Link href="/" className="flex items-center gap-2 flex-none">
                    <Image width={32} height={32} src="/logo.svg" alt="ChatJournal logo" className="h-8 w-8" />
                    <span className="font-mono font-bold text-base hidden sm:inline">ChatJournal</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex gap-8">
                        {links.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-mono text-sm transition-colors ${isActive(link.href) ? "text-brand" : "text-foreground hover:text-brand"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    {picture && <NavbarProfile src={picture} />}
                    <ThemeToggle />
                </div>

                {/* Mobile: profile + theme toggle + hamburger */}
                <div className="flex md:hidden items-center gap-1">
                    {picture && <NavbarProfile src={picture} />}
                    <ThemeToggle />
                    <button
                        onClick={() => setMenuOpen(prev => !prev)}
                        className="p-2 hover:text-brand transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <nav className="md:hidden border-t border-current/10 flex flex-col px-4 py-2">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`font-mono text-sm py-3 border-b border-current/5 last:border-0 transition-colors ${isActive(link.href) ? "text-brand" : "hover:text-brand"}`}
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
