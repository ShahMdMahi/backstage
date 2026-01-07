"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ROLE } from "@/lib/prisma/enums";
import { updateUserSchema } from "@/validators/system/user";
import { updateUser } from "@/actions/system/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  ImageIcon,
  XIcon,
  AlertCircleIcon,
  SaveIcon,
  ArrowLeftIcon,
  BanIcon,
  PenIcon,
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
    suspendedAt: Date | null;
    systemAccess: { id: string } | null;
    assignedSystemAccesses: { id: string }[];
    ownWorkspaceAccount: { id: string } | null;
    sharedWorkspaceAccountAccess: { id: string } | null;
    assignedWorkspaceAccountAccesses: { id: string }[];
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
  const [isSuspended, setIsSuspended] = useState<boolean>(!!user.suspendedAt);
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
      isSuspended: !!user.suspendedAt,
    },
  });

  const selectedRole = watch("role");
  const watchedName = watch("name");

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

  // Handle suspend change
  const handleSuspendChange = (checked: boolean) => {
    setIsSuspended(checked);
    setValue("isSuspended", checked, { shouldValidate: true });
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
  // Cannot change role if:
  // - User is SYSTEM_USER with system access
  // - User is SYSTEM_OWNER or SYSTEM_ADMIN with assigned system accesses
  // - User has workspace associations (own, shared, or assigned)
  const hasSystemAccess = user.role === ROLE.SYSTEM_USER && !!user.systemAccess;
  const hasAssignedSystemAccesses =
    (user.role === ROLE.SYSTEM_OWNER || user.role === ROLE.SYSTEM_ADMIN) &&
    user.assignedSystemAccesses.length > 0;
  const hasWorkspaceAssociations =
    !!user.ownWorkspaceAccount ||
    !!user.sharedWorkspaceAccountAccess ||
    user.assignedWorkspaceAccountAccesses.length > 0;

  const roleChangeRestricted =
    hasSystemAccess || hasAssignedSystemAccesses || hasWorkspaceAssociations;

  const canChangeRole =
    !roleChangeRestricted &&
    (availableRoles.includes(user.role) ||
      currentUserRole === ROLE.SYSTEM_OWNER);

  // Get restriction message for role change
  const getRoleRestrictionMessage = () => {
    if (hasSystemAccess) {
      return "Cannot change role for system user with active system access";
    }
    if (hasAssignedSystemAccesses) {
      return "Cannot change role for owner or admin with assigned system accesses";
    }
    if (hasWorkspaceAssociations) {
      return "Cannot change role for user with workspace account associations";
    }
    if (!canChangeRole) {
      return "You cannot change this user's role";
    }
    return null;
  };

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <PenIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
              <p className="text-muted-foreground mt-1">
                Update information for {user.name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{formMessage}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Update the user&apos;s profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="size-24 border-2 border-muted">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl border-2 border-dashed border-muted-foreground/50">
                    {getInitials(watchedName || user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <ImageIcon className="mr-2 size-4" />
                    {avatarPreview ? "Change Image" : "Upload Image"}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-destructive hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <XIcon className="mr-2 size-4" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    300x300px, max 50KB. Auto-compressed for optimization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the user&apos;s basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserIcon className="size-4" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <MailIcon className="size-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <PhoneIcon className="size-4" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                  {...register("phone")}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="size-5" />
                User Role
              </CardTitle>
              <CardDescription>
                Update the user&apos;s system role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canChangeRole ? (
                <div className="space-y-2">
                  <Label htmlFor="role">
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
                    <p className="text-sm text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Changing role may affect user&apos;s access permissions
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Input
                    value={formatRole(user.role)}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getRoleRestrictionMessage() ||
                      "You cannot change this user's role"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suspend Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BanIcon
                  className={cn("size-5", isSuspended && "text-destructive")}
                />
                Account Status
              </CardTitle>
              <CardDescription>
                Suspend this user to temporarily block their access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <Checkbox
                  id="suspend-user"
                  checked={isSuspended}
                  onCheckedChange={(checked) =>
                    handleSuspendChange(checked as boolean)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="suspend-user"
                    className={cn(
                      "font-semibold cursor-pointer",
                      isSuspended && "text-destructive"
                    )}
                  >
                    Suspend User
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When suspended, the user will not be able to log in or
                    access any system resources. This can be reversed at any
                    time.
                  </p>
                  {isSuspended && user.suspendedAt && (
                    <p className="text-xs text-destructive mt-2">
                      Originally suspended on:{" "}
                      {format(new Date(user.suspendedAt), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden ID field */}
          <input type="hidden" {...register("id")} />

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                router.push(`/system/administration/users/${user.id}`)
              }
            >
              <ArrowLeftIcon className="mr-2 size-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
