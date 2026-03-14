import AuthBox from "@/components/AuthBox";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold">Login / Sign up</h1>
      <img src="/login_img.png" alt="A warm welcoming picture" className="h-1/8 w-1/4" />
      <AuthBox />
    </div>
  );
}