"use client";

import type React from "react";
import { loginSchema, type LoginData } from "@/validators/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface TreeifyErrorStructure {
  errors: string[];
  properties?: Record<
    string,
    {
      errors: string[];
    }
  >;
}

interface ExtractedErrors {
  fieldErrors: Record<string, string>;
}

function extractServerErrors(errors: unknown): ExtractedErrors {
  const fieldErrors: Record<string, string> = {};

  if (!errors || typeof errors !== "object") {
    return { fieldErrors };
  }

  const errorObj = errors as TreeifyErrorStructure;

  // Get first error for each field
  if (errorObj.properties && typeof errorObj.properties === "object") {
    for (const [key, value] of Object.entries(errorObj.properties)) {
      if (
        value &&
        typeof value === "object" &&
        "errors" in value &&
        Array.isArray(value.errors) &&
        value.errors.length > 0
      ) {
        fieldErrors[key] = value.errors[0];
      }
    }
  }

  return { fieldErrors };
}

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginData) => {
    setSubmitting(true);
    setFormMessage(null);

    try {
      const result = await login(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Login failed. Please try again.");
          toast.error("Login failed. Please try again.");
        }
        return;
      }

      toast.success(result.message || "Successfully logged in!");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-4"
      noValidate
    >
      {formMessage && (
        <Alert variant="destructive">
          <AlertDescription>{formMessage}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        {/* Email Field */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel
            htmlFor="email"
            className="text-foreground text-xs font-medium"
          >
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md transition-all duration-300"
            disabled={submitting}
          />
          {errors.email && (
            <FieldError
              errors={[{ message: errors.email.message || "Invalid email" }]}
              className="text-xs"
            />
          )}
        </Field>

        {/* Password Field */}
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="password"
              className="text-foreground text-xs font-medium"
            >
              Password
            </FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="text-muted-foreground hover:text-primary focus-visible:ring-ring text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <PasswordInput {...register("password")} disabled={submitting} />
          </div>
          {errors.password && (
            <FieldError
              errors={[
                { message: errors.password.message || "Invalid password" },
              ]}
              className="text-xs"
            />
          )}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="default"
        className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 h-10 w-full rounded-md font-semibold transition-all duration-300"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Spinner className="mr-2" />
            Signing In...
          </>
        ) : (
          <>Sign In</>
        )}
      </Button>
    </form>
  );
}

function PasswordInput({
  disabled,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { disabled?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        autoComplete="current-password"
        {...props}
        aria-invalid={props["aria-invalid"]}
        className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md pr-10 transition-all duration-300"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30 absolute top-0 right-0 h-10 w-8 px-0"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>
    </>
  );
}
