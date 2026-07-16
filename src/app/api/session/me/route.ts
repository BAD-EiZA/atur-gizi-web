import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    const name =
      [user.given_name, user.family_name].filter(Boolean).join(" ") ||
      user.email ||
      "Pengguna";
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name,
        email: user.email ?? null,
        picture: user.picture ?? null,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
