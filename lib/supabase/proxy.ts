import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || supabaseUrl.includes("your_supabase") || !supabaseUrl.startsWith("http")) {
    console.error("❌ Invalid NEXT_PUBLIC_SUPABASE_URL")
    console.error("   Please set a valid Supabase URL in your .env.local file")
    console.error("   Get it from: https://supabase.com/dashboard/project/_/settings/api")
    console.error("   Format should be: https://xxxxx.supabase.co")
    throw new Error(
      "Invalid Supabase URL. Please update NEXT_PUBLIC_SUPABASE_URL in .env.local with your actual Supabase project URL from https://supabase.com/dashboard/project/_/settings/api"
    )
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes("your_supabase")) {
    console.error("❌ Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY")
    console.error("   Please set your Supabase anon key in .env.local")
    throw new Error(
      "Invalid Supabase anon key. Please update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with your actual key from https://supabase.com/dashboard/project/_/settings/api"
    )
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up")

  // Only call getUser if we're on a route that needs auth checking
  if (isProtectedRoute || isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect /dashboard routes
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Redirect to dashboard if already logged in
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
