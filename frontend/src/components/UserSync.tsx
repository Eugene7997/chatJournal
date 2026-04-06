"use client";

import { useEffect } from "react";
import { syncUser } from "@/src/app/chat/actions";

export default function UserSync() {
    useEffect(() => {
        syncUser();
    }, []);

    return null;
}
