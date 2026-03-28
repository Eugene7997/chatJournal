import { auth0 } from "@/lib/auth/auth0";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Journal } from "@/lib/types/types";
import JournalsClient from "@/components/JournalsClient";

export default async function JournalsPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/login");
    }

    let journals: Journal[] = [];
    try {
        const cookieStore = await cookies();
        const response = await fetch(`${process.env.APP_BASE_URL}/api/journals`, {
            headers: { cookie: cookieStore.toString() },
        });
        if (response.ok) {
            const data = await response.json();
            journals = data.journals ?? [];
        }
    }
    catch (error) {
        console.error("Failed to fetch journals:", error);
    }

    return (
        <div className="max-w-5xl mx-auto w-full px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">My Journals</h1>
            <JournalsClient journals={journals} />
        </div>
    );
}
