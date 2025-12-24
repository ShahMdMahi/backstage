"use client";

import { updateMeSchema, type UpdateMeData } from "@/validators/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateMe } from "@/actions/user";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/prisma/client";

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

interface UpdateProfileFormProps {
  user: User;
}

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<UpdateMeData>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
    },
  });

  const onSubmit = async (data: UpdateMeData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await updateMe(data);

      if (result.success) {
        toast.success("Profile updated successfully");
        reset(data);
      } else {
        if (result.errors) {
          const extracted = extractServerErrors(result.errors);
          Object.entries(extracted.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof UpdateMeData, { message });
          });
        }
        setServerError(result.message);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setServerError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldGroup>
                <Input {...register("name")} placeholder="Enter your name" />
              </FieldGroup>
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Phone</FieldLabel>
              <FieldGroup>
                <Input {...register("phone")} placeholder="Enter your phone" />
              </FieldGroup>
              <FieldError>{errors.phone?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <FieldGroup>
                <Input type="file" accept="image/*" />
              </FieldGroup>
              <FieldError>{errors.avatar?.message}</FieldError>
            </Field>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Spinner /> : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
