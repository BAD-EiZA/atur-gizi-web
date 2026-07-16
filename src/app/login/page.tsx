import Link from "next/link";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Card, PageTitle } from "@/components/ui";
import { Logo } from "@/components/logo";

const DEV = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo size={40} priority />
      </div>
      <PageTitle
        title="Masuk"
        subtitle="Autentikasi aman melalui Kinde. Session tidak disimpan di localStorage."
      />
      <Card className="space-y-4">
        {DEV ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Mode dev aktif. Production memakai login Kinde.
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Masuk
          </LoginLink>
          <RegisterLink
            postLoginRedirectURL="/onboarding"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Daftar
          </RegisterLink>
        </div>
        {DEV ? (
          <Link href="/dashboard" className="block text-center text-sm text-slate-500">
            Lanjut tanpa login (dev only)
          </Link>
        ) : null}
        <Link href="/" className="block text-center text-sm text-emerald-700">
          Kembali ke beranda
        </Link>
      </Card>
    </div>
  );
}
