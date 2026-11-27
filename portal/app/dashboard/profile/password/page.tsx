import { Suspense } from "react";
import PasswordForm from "@/components/PasswordForm";

export default function PasswordPage() {
  return (
    <Suspense>
      <PasswordForm />
    </Suspense>
  );
}
