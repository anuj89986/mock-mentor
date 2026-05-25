import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // const pathname = request.nextUrl.pathname;
  // const publicRoutes = [
  //   '/',
  //   '/auth/signin',
  //   '/auth/register'
  // ];
  // if(publicRoutes.includes(pathname)){
  //   return NextResponse.next();
  // }
  // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // if (!token) {
  //   console.log(`Unauthorized access attempt to: ${pathname}`);
  //   const signInUrl = new URL('/auth/signin', request.url);
  //   return NextResponse.redirect(signInUrl);
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth/|_next/static|_next/image|favicon.ico).*)"],
};
