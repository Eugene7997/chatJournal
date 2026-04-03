import Image from "next/image";
import { auth0 } from "@/lib/auth/auth0";
import AuthBox from "@/components/AuthBox";

export default async function LoginPage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-lg font-bold">Login / Sign up</h1>
        <Image src="/login_img.png" alt="A warm welcoming picture" width={100} height={100} className="w-1/2 sm:w-1/4 max-w-xs h-auto my-4" />
        <AuthBox />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <p>You are logged in already</p>
    </div>
  );
}