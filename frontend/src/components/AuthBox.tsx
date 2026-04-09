import Link from "next/link";
import { ArrowRight, UserPlus, LogIn } from "lucide-react";

export default function AuthBox() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
                href="/auth/login?screen_hint=signup"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 text-white font-mono font-semibold text-sm transition-colors"
            >
                <UserPlus className="h-4 w-4" />
                SIGN UP
                <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 px-8 py-3 border border-current font-mono font-semibold text-sm hover:text-brand hover:border-brand transition-colors"
            >
                <LogIn className="h-4 w-4" />
                LOG IN
            </Link>
        </div>
    );
}
