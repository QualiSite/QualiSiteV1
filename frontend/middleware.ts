import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Le middleware laisse tout passer.
  // La protection est gérée côté client dans app/admin/layout.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};