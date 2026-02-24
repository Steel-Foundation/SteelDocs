"use client"

import { useState } from "react"
import { GalleryVerticalEnd, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const BASE = "/SteelDocs"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGithubSignup = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${import.meta.env.PUBLIC_SITE_URL ?? "http://localhost:4321"}${BASE}/tracker`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <a
          href={`${BASE}/tracker`}
          className="flex flex-col items-center gap-2 font-medium"
        >
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Steel Tracker</span>
        </a>
        <h1 className="text-xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Sign up with your GitHub account to get started
        </p>
      </div>

      <Button
        variant="outline"
        onClick={handleGithubSignup}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
              fill="currentColor"
            />
          </svg>
        )}
        Continue with GitHub
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href={`${BASE}/tracker/login`} className="underline underline-offset-4">
          Sign in
        </a>
      </p>
    </div>
  )
}
