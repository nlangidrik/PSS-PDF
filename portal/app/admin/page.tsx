import { Suspense } from "react"
import AdminLoginPage from "./admin-login"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPage />
    </Suspense>
  )
}
