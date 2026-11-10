
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { signUp } from "@/lib/auth-client"
import { SocialSignInButtons } from "@/components/auth/SocialSignInButtons"
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

type UserRole = "jobSeeker" | "employer"
type SignUpRole = UserRole | ""

type SignUpValues = {
  name: string
  image: string
  email: string
  password: string
  confirmPassword: string
  role: SignUpRole
}

type SignUpErrors = Partial<Record<keyof SignUpValues, string>>

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

const initialValues: SignUpValues = {
  name: "",
  image: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
}


function validateName(name: string) {
  if (!name.trim()) return "Name is required"
  if (name.trim().length < 3) return "Name must be at least 3 characters"
  return undefined
}

function validateImage(image: string) {
  const trimmed = image.trim()
  if (!trimmed) return undefined // optional
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return "Please enter a valid URL (https://...)"
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "URL must start with http:// or https://"
  }
  return undefined
}

function validateEmail(email: string) {
  if (!email.trim()) return "Email is required"
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Please enter a valid email address"
  }
  return undefined
}

function validatePassword(password: string) {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter"
  if (!/[0-9]/.test(password)) return "Add at least one number"
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Add at least one special character"
  }
  return undefined
}

function validateConfirmPassword(confirmPassword: string, password: string) {
  if (!confirmPassword) return "Please confirm your password"
  if (confirmPassword !== password) return "Passwords do not match"
  return undefined
}

const SignUpPage = () => {
  const router = useRouter()

  const [values, setValues] = useState<SignUpValues>(initialValues)
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  //collect form data & update the SignUpValues
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value })) //[name] = "name" , value = "Raju"
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }


  //Submit form
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    //part-1 :Submission Guard -Prevents another submission if one is already in progress
    if (isSubmitting) { return }

    //part-2 :Form Validation
    const nextErrors: SignUpErrors = {
      name: validateName(values.name),
      image: validateImage(values.image),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(
        values.confirmPassword,
        values.password
      ),
      role: values.role ? undefined : "Please select your role",
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) { return }

      //part-3 :Form Submission
      setIsSubmitting(true) //means the form submission is currently running.

    try {

      // Send data to MongoDB through Better Auth
      const { error } = await signUp.email({
        name: values.name.trim(),
        role: values.role as UserRole,
        image: values.image.trim() || undefined,
        email: values.email.trim(),
        password: values.password,
      })

      if (error) {
        console.error("Sign-up error:", error)
        toast.error(error.message || "Could not sign up. Please try again.")
        return
      }

      toast.success("Account created! Please sign in to continue.")
      router.push("/sign-in")
    } catch (error) {
      console.error("Unexpected sign-up error:", error)
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
            Create your account
          </CardTitle>
          <CardDescription>
            Sign up to see detailed Pages.
          </CardDescription>
        </CardHeader>


        <CardContent>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FieldGroup>
              
              {/* Name */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  className="bg-white dark:bg-white"
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={values.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              {/* Role */}
              <Field data-invalid={!!errors.role}>
                <FieldLabel htmlFor="role">I want to join as</FieldLabel>

                <Select
                  value={values.role}
                  onValueChange={(value) => {
                    setValues((prev) => ({
                      ...prev,
                      role: value as UserRole,
                    }))
                    setErrors((prev) => ({ ...prev, role: undefined }))
                  }}
                >
                  <SelectTrigger
                    id="role"
                    className="w-full bg-white dark:bg-white"
                    aria-invalid={!!errors.role}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="jobSeeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                  </SelectContent>
                </Select>

                <FieldError>{errors.role}</FieldError>
              </Field>

              {/* Image URL (optional) */}
              <Field data-invalid={!!errors.image}>
                <FieldLabel htmlFor="image">Image url (optional)</FieldLabel>
                <Input
                  className="bg-white dark:bg-white"
                  id="image"
                  name="image"
                  type="url"
                  autoComplete="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={values.image}
                  onChange={handleChange}
                  aria-invalid={!!errors.image}
                />
                {/* <FieldDescription>
                   Optional — a link to your profile picture.
                </FieldDescription> */}

                <FieldError>{errors.image}</FieldError>
              </Field>

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
                  value={values.email}
                  onChange={handleChange}
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
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={values.password}
                    onChange={handleChange}
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
                <FieldDescription>
                  At least 8 characters, one uppercase letter, one number and
                  one special character.
                </FieldDescription>
                <FieldError>{errors.password}</FieldError>
              </Field>

              {/* Confirm password */}
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm password
                </FieldLabel>
                <InputGroup className="bg-white dark:bg-white">
                  <InputGroupInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        isConfirmPasswordVisible
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() =>
                        setIsConfirmPasswordVisible((prev) => !prev)
                      }
                    >
                      {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError>{errors.confirmPassword}</FieldError>
              </Field>
            </FieldGroup>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#068a3f] font-semibold text-white hover:bg-[#057536]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
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
            <SocialSignInButtons /> {/* see in component*/}

            {/* Sign-in link */}
            <p className="flex flex-wrap justify-center gap-1 text-sm">
              <span className="text-muted-foreground">
                Already have an account?
              </span>
              <Link
                href="/sign-in"
                className="font-medium text-[#068a3f] hover:underline"
              >
                Sign in
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

export default SignUpPage
