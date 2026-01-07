"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ROLE } from "@/lib/prisma/enums";
import { updateUserSchema } from "@/validators/system/user";
import { updateUser } from "@/actions/system/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInitials } from "@/lib/utils";
import { validateAvatarFile } from "@/lib/avatar-validation";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  ImageIcon,
  TrashIcon,
  AlertCircleIcon,
} from "lucide-react";

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: ROLE;
  };
  availableRoles: ROLE[];
  currentUserRole: ROLE;
}

interface TreeifyErrorStructure {
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

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function UserEditForm({
  user,
  availableRoles,
  currentUserRole,
}: UserEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
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
    setValue,
    watch,
    setError,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      phone: user.phone || "",
      role: user.role,
    },
  });

  const selectedRole = watch("role");

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Store the compressed base64 for later use
        setCompressedAvatar(validation.compressedBase64);
        toast.success("Image compressed and ready to upload");
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setCompressedAvatar(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      // Use compressed avatar if available
      let avatarBase64: string | undefined = undefined;
      if (compressedAvatar) {
        avatarBase64 = compressedAvatar;
      } else if (removeAvatar) {
        avatarBase64 = ""; // Empty string signals removal
      }

      const result = await updateUser({
        ...data,
        avatar: avatarBase64,
      });

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof UpdateUserFormData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Failed to update user. Please try again.");
          toast.error("Failed to update user. Please try again.");
        }
        return;
      }

      toast.success(result.message || "User updated successfully!");
      router.push(`/system/administration/users/${user.id}`);
      router.refresh();
    } catch {
      setFormMessage("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if the user can change role
  // SYSTEM_OWNER can change any role
  // SYSTEM_ADMIN can change to SYSTEM_USER or USER
  // SYSTEM_USER can only keep USER
  const canChangeRole =
    availableRoles.includes(user.role) || currentUserRole === ROLE.SYSTEM_OWNER;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formMessage && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertDescription>{formMessage}</AlertDescription>
        </Alert>
      )}

      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="size-24 border-4 border-muted">
          <AvatarImage src={avatarPreview || undefined} />
          <AvatarFallback className="text-2xl border-2 border-dashed border-muted-foreground/50">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 size-4" />
            {avatarPreview ? "Change Image" : "Upload Image"}
          </Button>
          {avatarPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
            >
              <TrashIcon className="mr-2 size-4" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <p className="text-xs text-muted-foreground">
          300x300px, max 50KB. Auto-compressed for optimization.
        </p>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <UserIcon className="size-4" />
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field (disabled) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <MailIcon className="size-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <PhoneIcon className="size-4" />
          Phone
        </Label>
        <Input
          id="phone"
          placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
          {...register("phone")}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Role Field */}
      {canChangeRole && (
        <div className="space-y-2">
          <Label htmlFor="role" className="flex items-center gap-2">
            <ShieldIcon className="size-4" />
            Role <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue("role", value as ROLE)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {formatRole(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Changing role may affect user&apos;s access permissions
          </p>
        </div>
      )}

      {!canChangeRole && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ShieldIcon className="size-4" />
            Role
          </Label>
          <Input value={formatRole(user.role)} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            You cannot change this user&apos;s role
          </p>
        </div>
      )}

      {/* Hidden ID field */}
      <input type="hidden" {...register("id")} />

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isSubmitting}
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
