"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserPlusIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  ShuffleIcon,
  ImageIcon,
  XIcon,
  SaveIcon,
  ArrowLeftIcon,
  ShieldIcon,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import {
  createUserSchema,
  type CreateUserData,
} from "@/validators/system/user";
import { createUser } from "@/actions/system/users";
import { ROLE } from "@/lib/prisma/enums";
import { Session, SystemAccess, User } from "@/lib/prisma/browser";
import Link from "next/link";
import { validateAvatarFile } from "@/lib/avatar-validation";

interface UserFormProps {
  session: Session & { user: User & { systemAccess: SystemAccess | null } };
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

function generatePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function UserForm({ session }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAssignRole =
    session.user.role === ROLE.SYSTEM_OWNER ||
    session.user.role === ROLE.SYSTEM_ADMIN;

  const availableRoles = (() => {
    if (session.user.role === ROLE.SYSTEM_OWNER) {
      return [ROLE.SYSTEM_ADMIN, ROLE.SYSTEM_USER, ROLE.USER];
    }
    if (session.user.role === ROLE.SYSTEM_ADMIN) {
      return [ROLE.SYSTEM_USER, ROLE.USER];
    }
    return [ROLE.USER];
  })();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      avatar: null,
      role: ROLE.USER,
    },
  });

  const watchedPassword = watch("password");
  const watchedName = watch("name");

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword(16);
    setValue("password", newPassword, { shouldValidate: true });
  }, [setValue]);

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
          setAvatarPreview(validation.compressedBase64);
          setValue("avatar", validation.compressedBase64, {
            shouldValidate: true,
          });
          toast.success("Image compressed and ready to upload");
        }
      }
    },
    [setValue]
  );

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setValue("avatar", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setValue]);

  const onSubmit = async (data: CreateUserData) => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const result = await createUser(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateUserData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Failed to create user. Please try again.");
          toast.error("Failed to create user. Please try again.");
        }
        return;
      }

      toast.success(result.message || "User created successfully!");
      router.push("/system/administration/users");
    } catch (err) {
      console.error("Error creating user:", err);
      setFormMessage("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UserPlusIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
              <p className="text-muted-foreground mt-1">
                Add a new user to the system
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/system/administration/users">
              <ArrowLeftIcon className="mr-2 size-4" />
              Back to Users
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formMessage && (
            <Alert variant="destructive">
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
                Upload an optional profile picture for the user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="size-24 border-2 border-muted">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl border-2 border-dashed border-muted-foreground/50">
                    {getInitials(watchedName || "New User")}
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
                      className="text-destructive hover:text-destructive"
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
                Enter the user&apos;s basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      className="pl-9"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      className="pl-9"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                      className="pl-9"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <FieldError>{errors.phone.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockIcon className="size-5" />
                Password
              </CardTitle>
              <CardDescription>
                Set the initial password for the user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LockIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="text"
                      placeholder="Enter or generate password"
                      className="pl-9 font-mono"
                      {...register("password")}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                  >
                    <ShuffleIcon className="mr-2 size-4" />
                    Generate
                  </Button>
                </div>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
                {watchedPassword && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This password will be sent to the user via email.
                  </p>
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Role Section */}
          {canAssignRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="size-5" />
                  User Role
                </CardTitle>
                <CardDescription>Assign a role to the new user</CardDescription>
              </CardHeader>
              <CardContent>
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Select
                    defaultValue={ROLE.USER}
                    onValueChange={(value) =>
                      setValue(
                        "role",
                        value as
                          | typeof ROLE.SYSTEM_ADMIN
                          | typeof ROLE.SYSTEM_USER
                          | typeof ROLE.USER,
                        {
                          shouldValidate: true,
                        }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <FieldError>{errors.role.message}</FieldError>
                  )}
                </Field>
              </CardContent>
            </Card>
          )}

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
                  <Spinner className="mr-2 size-4" />
                  Creating...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
