import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-muted">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
