import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is a passthrough — all auth is handled client-side via mockAuth.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
