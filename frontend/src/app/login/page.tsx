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
    <div>
      <GoogleAuthButton onClick={loginWithGooglePopUp}/>
    </div>
  );
}