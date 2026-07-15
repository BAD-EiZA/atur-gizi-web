import { NextResponse } from "next/server";

/**
 * Kinde catch-all. When KINDE_ISSUER_URL is set, wire handleAuth in production.
 * Dev: NEXT_PUBLIC_DEV_AUTH=true + API AUTH_DEV_BYPASS — no Kinde needed.
 */
export async function GET() {
  if (!process.env.KINDE_ISSUER_URL) {
    return NextResponse.json(
      {
        message:
          "Kinde belum dikonfigurasi. Gunakan /login mode dev atau set KINDE_ISSUER_URL + KINDE_CLIENT_ID.",
      },
      { status: 503 },
    );
  }
  const { handleAuth } = await import("@kinde-oss/kinde-auth-nextjs/server");
  const handlers = handleAuth() as { GET?: () => Promise<Response> };
  if (handlers.GET) return handlers.GET();
  return NextResponse.json({ error: "Kinde GET handler missing" }, { status: 500 });
}
