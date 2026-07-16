import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware() {
    // Auth handled by withAuth
  },
  {
    publicPaths: ["/", "/login", "/register", "/api/auth"],
    isReturnToCurrentPage: true,
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
