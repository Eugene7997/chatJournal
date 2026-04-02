"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types/types";

export default function Account({ user }: { user: User }) {
    const router = useRouter();

    async function handleDeleteAccount() {
        try {
            const response = await fetch("/api/auth/delete", {
                method: "DELETE",
            });

            const data = await response.json();
            
            if (data) {
                router.push("/auth/logout");
            }
        }
        catch (err) {
            console.log(err);
        }
    }


    return (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white border border-gray-200 p-10 rounded-xl shadow-sm">
                <div className="flex flex-col items-center space-y-4">
                    {user.picture ? (
                        <Image
                            src={user.picture}
                            alt="Profile picture"
                            width={100}
                            height={100}
                            className="rounded-full shadow-sm border-2 border-gray-100"
                        />
                    ) : (
                        <div className="w-25 h-25 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-3xl font-semibold border-2 border-gray-200">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {user.name || "Your Account"}
                    </h2>
                    <p className="text-center text-sm text-gray-500">
                        {user.email}
                    </p>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <dl className="divide-y divide-gray-100">
                        <div className="py-3 flex justify-between text-sm font-medium">
                            <dt className="text-gray-500">Nickname</dt>
                            <dd className="text-gray-900">{user.nickname || "N/A"}</dd>
                        </div>
                        <div className="py-3 flex justify-between text-sm font-medium">
                            <dt className="text-gray-500">Auth ID</dt>
                            <dd className="text-gray-900 break-all ml-4 text-right overflow-hidden text-ellipsis">{user.sub?.split('|')[1] || user.sub}</dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-6 flex gap-6">
                    <a
                        href="/auth/logout"
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-300 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-sm"
                    >
                        Sign out
                    </a>
                    <button
                        className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                        onClick={handleDeleteAccount}
                    >
                        Delete account
                    </button>
                </div>
            </div>
        </div>
    );
}