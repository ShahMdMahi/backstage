"use client";
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from "@/validators/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { forgotPassword } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export function ForgotPasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setSubmitting(true);
    setFormMessage(null);

    try {
      const result = await forgotPassword(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ForgotPasswordData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Failed to send reset link. Please try again.");
          toast.error("Failed to send reset link. Please try again.");
        }
        return;
      }

      toast.success(result.message || "Password reset link sent successfully!");
      router.push("/auth/login");
    } catch (error) {
      console.error("Forgot password error:", error);
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
        <Alert
          variant={
            formMessage.includes("successful") || formMessage.includes("sent")
              ? "default"
              : "destructive"
          }
        >
          <AlertDescription>{formMessage}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        {/* Email Field */}
        <Field data-invalid={!!errors.email}>
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="email"
              className="text-foreground text-xs font-medium"
            >
              Email
            </FieldLabel>
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-primary focus-visible:ring-ring text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Back to login
            </Link>
          </div>
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
            Sending...
          </>
        ) : (
          <>Send Reset Link</>
        )}
      </Button>
    </form>
  );
}
