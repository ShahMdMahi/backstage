"use client";

import type React from "react";
import { resetPasswordSchema, type ResetPasswordData } from "@/validators/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { resetPassword } from "@/actions/auth/auth";
import { useRouter, useSearchParams } from "next/navigation";
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

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setTokenValid(false);
      setFormMessage(
        "Invalid token or token not found. Please check your password reset link."
      );
      toast.error(
        "Invalid token or token not found. Please check your password reset link."
      );
      return;
    }

    setValue("token", token);
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordData) => {
    setSubmitting(true);
    setFormMessage(null);

    try {
      const result = await resetPassword(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ResetPasswordData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Password reset failed. Please try again.");
          toast.error("Password reset failed. Please try again.");
        }
        return;
      }

      router.push("/auth/login");
      toast.success(
        result.message ||
          "Password has been reset successfully! You can now log in."
      );
    } catch (error) {
      console.error("Reset password error:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="w-full space-y-4">
        {formMessage && (
          <Alert variant="destructive">
            <AlertDescription>{formMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

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

      <input type="hidden" {...register("token")} />

      <FieldGroup>
        {/* Password Field */}
        <Field data-invalid={!!errors.password}>
          <FieldLabel
            htmlFor="password"
            className="text-foreground text-xs font-medium"
          >
            New Password
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
              {...register("confirmPassword")}
              disabled={submitting}
              placeholder="Confirm Password"
            />
          </div>
          {errors.confirmPassword && (
            <FieldError
              errors={[
                {
                  message:
                    errors.confirmPassword.message || "Passwords do not match",
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
            Resetting...
          </>
        ) : (
          <>Reset Password</>
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
        autoComplete="new-password"
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
