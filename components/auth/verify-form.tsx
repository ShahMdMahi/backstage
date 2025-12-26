"use client";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { verify } from "@/actions/auth/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field";
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

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setFormMessage(
        "Invalid token or token not found. Please check your verification link."
      );
      toast.error(
        "Invalid token or token not found. Please check your verification link."
      );
      setVerifying(false);
      return;
    }

    const submitVerification = async () => {
      try {
        const result = await verify({ token });

        if (!result.success) {
          const { fieldErrors: extractedFieldErrors } = extractServerErrors(
            result.errors
          );
          setFieldErrors(extractedFieldErrors);

          if (result.message) {
            setFormMessage(result.message);
            toast.error(result.message);
          } else {
            setFormMessage("Verification failed. Please try again.");
            toast.error("Verification failed. Please try again.");
          }
          return;
        }

        router.push("/auth/login");
        toast.success(result.message || "Email verified successfully!");
      } catch (error) {
        console.error("Verification error:", error);
        setFormMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setVerifying(false);
      }
    };

    submitVerification();
  }, [searchParams, router]);

  if (verifying) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-4 py-8">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground text-sm">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {formMessage && (
        <Alert variant="destructive">
          <AlertDescription>{formMessage}</AlertDescription>
        </Alert>
      )}
      {fieldErrors.token && (
        <FieldError
          errors={[{ message: fieldErrors.token }]}
          className="text-xs"
        />
      )}
    </div>
  );
}
