import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

/** Short-lived access token for API Bearer auth. Not stored in localStorage. */
export async function GET() {
  const { isAuthenticated, getAccessTokenRaw } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const token = await getAccessTokenRaw();
  if (!token) {
    return NextResponse.json({ error: "no_token" }, { status: 401 });
  }
  return NextResponse.json({ access_token: token });
}
