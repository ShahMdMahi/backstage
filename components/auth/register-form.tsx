"use client";

import type React from "react";
import { registerSchema, type RegisterData } from "@/validators/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { register as registerUser } from "@/actions/auth/auth";
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

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterData) => {
    setSubmitting(true);
    setFormMessage(null);

    try {
      const result = await registerUser(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof RegisterData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Registration failed. Please try again.");
          toast.error("Registration failed. Please try again.");
        }
        return;
      }

      router.push("/auth/login");
      toast.success(
        result.message || "Registration successful! You can now log in."
      );
    } catch (error) {
      console.error("Registration error:", error);
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
        {/* Name Field */}
        <Field data-invalid={!!errors.name}>
          <FieldLabel
            htmlFor="name"
            className="text-foreground text-xs font-medium"
          >
            Full Name
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            {...register("name")}
            aria-invalid={!!errors.name}
            className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md transition-all duration-300"
            disabled={submitting}
          />
          {errors.name && (
            <FieldError
              errors={[{ message: errors.name.message || "Invalid name" }]}
              className="text-xs"
            />
          )}
        </Field>

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

        {/* Phone Field */}
        <Field data-invalid={!!errors.phone}>
          <FieldLabel
            htmlFor="phone"
            className="text-foreground text-xs font-medium"
          >
            Phone Number
          </FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="01xxxxxxxxx"
            autoComplete="tel"
            {...register("phone")}
            aria-invalid={!!errors.phone}
            className="border-border bg-background/50 dark:bg-background/10 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground h-10 rounded-md transition-all duration-300"
            disabled={submitting}
          />
          {errors.phone && (
            <FieldError
              errors={[
                { message: errors.phone.message || "Invalid phone number" },
              ]}
              className="text-xs"
            />
          )}
        </Field>

        {/* Password Field */}
        <Field data-invalid={!!errors.password}>
          <FieldLabel
            htmlFor="password"
            className="text-foreground text-xs font-medium"
          >
            Password
          </FieldLabel>
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

        {/* Confirm Password Field */}
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-foreground text-xs font-medium"
          >
            Confirm Password
          </FieldLabel>
          <div className="relative">
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
              disabled={submitting}
            />
          </div>
          {errors.confirmPassword && (
            <FieldError
              errors={[
                {
                  message:
                    errors.confirmPassword.message || "Passwords must match",
                },
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
            Creating Account...
          </>
        ) : (
          <>Create Account</>
        )}
      </Button>
    </form>
  );
}

function PasswordInput({
  disabled,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { disabled?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        autoComplete={
          id === "confirmPassword" ? "new-password" : "new-password"
        }
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
