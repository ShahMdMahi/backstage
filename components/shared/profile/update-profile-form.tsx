"use client";

import { updateMeSchema, type UpdateMeData } from "@/validators/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useCallback } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateMe } from "@/actions/shared/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/lib/prisma/browser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ImageIcon, XIcon } from "lucide-react";
import { validateAvatarFile } from "@/lib/avatar-validation";

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [compressedAvatar, setCompressedAvatar] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm<UpdateMeData>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
    },
  });

  const watchedName = watch("name");

  // Handle avatar file selection
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate and compress file
        const validation = await validateAvatarFile(file);
        if (!validation.success) {
          toast.error(validation.error || "Invalid image");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        // Use the compressed image from validation
        if (validation.compressedBase64) {
          setRemoveAvatar(false);
          setAvatarPreview(validation.compressedBase64);
          setCompressedAvatar(validation.compressedBase64);
          toast.success("Image compressed and ready to upload");
        }
      }
    },
    []
  );

  // Handle avatar removal
  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setCompressedAvatar(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onSubmit = async (data: UpdateMeData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Use compressed avatar if available
      let avatarBase64: string | undefined = undefined;
      if (compressedAvatar) {
        avatarBase64 = compressedAvatar;
      } else if (removeAvatar) {
        avatarBase64 = ""; // Empty string signals removal
      }

      const result = await updateMe({
        ...data,
        avatar: avatarBase64,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        reset({
          name: data.name,
          phone: data.phone,
          avatar: avatarBase64,
        });
        setCompressedAvatar(null);
        setRemoveAvatar(false);
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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <Avatar className="size-24 border-2 border-muted">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-2xl border-2 border-dashed border-muted-foreground/50">
                {getInitials(watchedName || user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="profile-avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <ImageIcon className="mr-2 size-4" />
                Upload Image
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive"
                >
                  <XIcon className="mr-2 size-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              300x300px, max 50KB. Auto-compressed for optimization.
            </p>
          </div>

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
