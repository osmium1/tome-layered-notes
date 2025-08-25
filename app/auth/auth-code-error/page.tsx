import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tome</h1>
          <p className="text-muted-foreground">The Art of Layered Learning</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Authentication Error</CardTitle>
            <CardDescription>
              There was an issue confirming your account. The link may have expired or been used already.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please try signing up again or contact support if the issue persists.
              </p>
              <Link href="/signup">
                <Button className="w-full">Back to Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
