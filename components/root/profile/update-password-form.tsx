"use client";

import type React from "react";
import {
  updateMyPasswordSchema,
  type UpdateMyPasswordData,
} from "@/validators/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateMyPassword } from "@/actions/root/user";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      if (value.errors && value.errors.length > 0) {
        fieldErrors[key] = value.errors[0];
      }
    }
  }

  return { fieldErrors };
}

export function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm<UpdateMyPasswordData>({
    resolver: zodResolver(updateMyPasswordSchema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword");
  const confirmNewPassword = watch("confirmNewPassword");

  const onSubmit = async (data: UpdateMyPasswordData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await updateMyPassword(data);

      if (result.success) {
        toast.success("Password updated successfully");
        reset();
      } else {
        if (result.errors) {
          const extracted = extractServerErrors(result.errors);
          Object.entries(extracted.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof UpdateMyPasswordData, { message });
          });
        }
        setServerError(result.message);
      }
    } catch (error) {
      console.error("Update password error:", error);
      setServerError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Current Password</FieldLabel>
            <div className="relative">
              <Input
                {...register("currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30 absolute top-0 right-0 h-10 w-8 px-0"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                <span className="sr-only">
                  {showCurrentPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <FieldError>{errors.currentPassword?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>New Password</FieldLabel>
            <div className="relative">
              <Input
                {...register("newPassword", {
                  validate: (value) =>
                    !confirmNewPassword ||
                    value === confirmNewPassword ||
                    "New Passwords do not match",
                })}
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30 absolute top-0 right-0 h-10 w-8 px-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                <span className="sr-only">
                  {showNewPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <FieldError>{errors.newPassword?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Confirm New Password</FieldLabel>
            <div className="relative">
              <Input
                {...register("confirmNewPassword", {
                  validate: (value) =>
                    !value ||
                    value === newPassword ||
                    "New Passwords do not match",
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/30 absolute top-0 right-0 h-10 w-8 px-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <FieldError>{errors.confirmNewPassword?.message}</FieldError>
          </Field>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Spinner /> : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
