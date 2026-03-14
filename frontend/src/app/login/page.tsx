"use client"

import { useState } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";


export default function LoginPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function loginWithGooglePopUp() {
    alert("HI");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold">Login / Sign up</h1>
      <img src="/login_img.png" alt="A warm welcoming picture" className="h-1/8 w-1/4" />
      <GoogleAuthButton onClick={loginWithGooglePopUp}/>
    </div>
  );
}