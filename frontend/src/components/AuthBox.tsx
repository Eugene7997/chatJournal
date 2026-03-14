import Link from "next/link";

export default function AuthBox() {
    return (
        <div className="flex gap-4">
            <Link
                className="bg-white text-black px-4 py-2 mt-2 border border-[#A9A9A9] rounded-lg text-base font-normal cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[#EEF5FE] hover:border-[#CBE0FA]"
                href="/auth/login?screen_hint=signup"
            >
                Signup
            </Link>
            <Link
                className="bg-white text-black px-4 py-2 mt-2 border border-[#A9A9A9] rounded-lg text-base font-normal cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[#EEF5FE] hover:border-[#CBE0FA]"
                href="/auth/login"
            >
                Login
            </Link>
        </div>
    );
}