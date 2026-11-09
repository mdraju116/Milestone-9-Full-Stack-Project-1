"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { signIn } from "@/lib/auth-client"
import { SocialSignInButtons } from "@/components/auth/SocialSignInButtons"
import { useRouter, useSearchParams } from "next/navigation"

import { useState, useEffect } from "react";


type SignInErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

function validateEmail(email: string) {
  if (!email) return "Email is required"
  if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address"
  return undefined
}

function validatePassword(password: string) {
  if (!password) return "Password is required"
  return undefined
}

const SignInForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<SignInErrors>({})
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Show a hint when the user was redirected here from a protected page
  useEffect(() => {
    if (searchParams.get("message") === "login-required") {
      toast("Please sign in to view this information.", {
        id: "login-required",
        icon: "🔐",
      })
    }
  }, [searchParams])

  //submit form
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    //part-1 :Submission Guard -Prevents another submission if one is already in progress
    if (isSubmitting) { return }

    //part-2 :Form Validation
    const nextErrors: SignInErrors = {
      email: validateEmail(email.trim()),
      password: validatePassword(password),
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) return

    //part-3 :Form Submission
    setIsSubmitting(true)

    try {

      // Send email, pass & rememberMe to MongoDB and receive userData through Better Auth
      const { data, error } = await signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      })

      if (error) {
        console.error("Sign-in error:", error)
        toast.error(error.message || "Could not sign in. Please try again.")
        return
      }

      toast.success("Signed in successfully!")

      // role-based redirection
      const role = data.user.role

      if (role === "jobSeeker") {
        router.push("/job-seeker/dashboard")
      } else if (role === "employer") {
        router.push("/employer/dashboard")
      } else {
        toast.error("Invalid user role")
        return
      }
      router.refresh()

    } catch (error) {
      console.error("Sign-in error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12">
      <Card className="w-full rounded-3xl border border-[#b7dfc2] bg-linear-to-br from-[#f4fff7] via-[#e5f6e9] to-[#ccebd6] shadow-xl shadow-[#315b45]/15">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold sm:text-2xl">
            Sign in
          </CardTitle>
          <CardDescription>
            Log in to see detailed pages and view your profile.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FieldGroup>
              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  className="bg-white dark:bg-white"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}

                  // collect form data 
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  aria-invalid={!!errors.email}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              {/* Password */}
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup className="bg-white dark:bg-white">
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}

                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    aria-invalid={!!errors.password}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.password}</FieldError>
              </Field>
            </FieldGroup>

            {/* Remember me */}
            <label className="flex w-fit items-center gap-2 text-sm font-medium select-none">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              Remember me
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#068a3f] font-semibold text-white hover:bg-[#057536]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            {/* Social sign-in */}
            <SocialSignInButtons />

            {/* Sign-up link */}
            <p className="flex flex-wrap justify-center gap-1 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link
                href="/sign-up"
                className="font-medium text-[#068a3f] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-5 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
    </main>
  )
}

const SignInPage = () => {
  return (
    <React.Suspense fallback={<main className="w-full max-w-md px-4 py-12" />}>
      <SignInForm />
    </React.Suspense>
  )
}

export default SignInPage
