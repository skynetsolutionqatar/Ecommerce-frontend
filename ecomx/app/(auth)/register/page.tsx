import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

function AuthLoadingFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-border/40" />
      <div className="h-4 w-64 rounded bg-border/30" />
      <div className="space-y-4 pt-2">
        <div className="h-12 rounded-xl bg-border/30" />
        <div className="h-12 rounded-xl bg-border/30" />
        <div className="h-12 rounded-xl bg-border/30" />
        <div className="h-12 rounded-xl bg-[#0a255d]/20" />
      </div>
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
