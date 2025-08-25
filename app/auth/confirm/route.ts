import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/dashboard"

  if (token_hash && type) {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error && data.user) {
      // Create sample binder for new user
      const { error: sampleError } = await supabase.rpc("create_sample_binder_for_user", {
        user_id: data.user.id,
      })

      if (sampleError) {
        console.error("Error creating sample binder:", sampleError)
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
}
