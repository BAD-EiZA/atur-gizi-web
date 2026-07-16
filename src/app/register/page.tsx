import Link from "next/link";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Card, PageTitle } from "@/components/ui";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo size={40} priority />
      </div>
      <PageTitle title="Daftar" subtitle="Buat akun melalui Kinde (email diverifikasi)." />
      <Card className="space-y-4">
        <RegisterLink
          postLoginRedirectURL="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Daftar sekarang
        </RegisterLink>
        <LoginLink
          postLoginRedirectURL="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900"
        >
          Sudah punya akun? Masuk
        </LoginLink>
        <Link href="/" className="block text-center text-sm text-emerald-700">
          Kembali
        </Link>
      </Card>
    </div>
  );
}
