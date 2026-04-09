import { auth0 } from "@/lib/auth/auth0";
import { LoginClient, AlreadyLoggedIn } from "@/components/LoginClient";

export default async function LoginPage() {
  const session = await auth0.getSession();

  if (!session) {
    return <LoginClient />;
  }

  return <AlreadyLoggedIn />;
}
