import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

function AuthLoadingFallback() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/10 p-12 text-center backdrop-blur-sm">
      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <p className="mt-3 text-sm text-white/60">Loading…</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
