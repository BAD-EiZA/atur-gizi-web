"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, PageTitle } from "@/components/ui";

const DEV = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <PageTitle title="Masuk Atur Gizi" subtitle="Session dikelola Kinde (atau mode dev lokal)." />
      <Card className="space-y-4">
        {DEV ? (
          <>
            <p className="text-sm text-slate-600">
              Mode dev aktif: API memakai <code>AUTH_DEV_BYPASS</code>. Tidak perlu token.
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Lanjut sebagai Dev User
            </Button>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Konfigurasi Kinde di environment, lalu gunakan route{" "}
            <code>/api/auth/login</code>.
          </p>
        )}
        <Link href="/" className="block text-center text-sm text-emerald-700">
          Kembali ke beranda
        </Link>
      </Card>
    </div>
  );
}
