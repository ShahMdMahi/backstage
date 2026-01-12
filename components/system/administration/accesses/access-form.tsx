"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ShieldCheckIcon,
  UserIcon,
  SaveIcon,
  LockIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  SearchIcon,
  MailIcon,
  PhoneIcon,
  HashIcon,
  CalendarIcon,
} from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccessSchema,
  type CreateAccessData,
} from "@/validators/system/access";
import { User } from "@/lib/prisma/browser";
import {
  USER_SYSTEM_ACCESS_LEVEL,
  WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL,
  REPORTING_SYSTEM_ACCESS_LEVEL,
  RELEASE_SYSTEM_ACCESS_LEVEL,
  TRACK_SYSTEM_ACCESS_LEVEL,
  VIDEO_SYSTEM_ACCESS_LEVEL,
  RINGTONE_SYSTEM_ACCESS_LEVEL,
  ARTIST_SYSTEM_ACCESS_LEVEL,
  PERFORMER_SYSTEM_ACCESS_LEVEL,
  PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL,
  WRITER_SYSTEM_ACCESS_LEVEL,
  PUBLISHER_SYSTEM_ACCESS_LEVEL,
  LABEL_SYSTEM_ACCESS_LEVEL,
  TRANSACTION_SYSTEM_ACCESS_LEVEL,
  WITHDRAW_SYSTEM_ACCESS_LEVEL,
  CONSUMPTION_SYSTEM_ACCESS_LEVEL,
  ENGAGEMENT_SYSTEM_ACCESS_LEVEL,
  REVENUE_SYSTEM_ACCESS_LEVEL,
  GEO_SYSTEM_ACCESS_LEVEL,
  RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL,
} from "@/lib/prisma/enums";
import { createSystemAccess } from "@/actions/system/access";
import { useRouter } from "next/navigation";

interface Permission {
  id: string;
  key: string; // camelCase key for form data
  label: string;
}

interface AccessCategory {
  name: string;
  key: string; // camelCase key for form data (e.g., "userAccess")
  permissions: Permission[];
}

const accessCategories: AccessCategory[] = [
  {
    name: "User Access",
    key: "userAccess",
    permissions: [
      { id: USER_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: USER_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: USER_SYSTEM_ACCESS_LEVEL.SUSPEND,
        key: "suspend",
        label: "Suspend",
      },
      { id: USER_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: USER_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: USER_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Workspace Access",
    key: "workspaceAccess",
    permissions: [
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.VIEW,
        key: "view",
        label: "View",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.SUSPEND,
        key: "suspend",
        label: "Suspend",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.TERMINATE,
        key: "terminate",
        label: "Terminate",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Reporting Access",
    key: "reportingAccess",
    permissions: [
      { id: REPORTING_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: REPORTING_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: REPORTING_SYSTEM_ACCESS_LEVEL.PROCESS,
        key: "process",
        label: "Process",
      },
      {
        id: REPORTING_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Release Access",
    key: "releaseAccess",
    permissions: [
      { id: RELEASE_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: RELEASE_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: RELEASE_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: RELEASE_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: RELEASE_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: RELEASE_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Track Access",
    key: "trackAccess",
    permissions: [
      { id: TRACK_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      { id: TRACK_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: TRACK_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: TRACK_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Video Access",
    key: "videoAccess",
    permissions: [
      { id: VIDEO_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: VIDEO_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      { id: VIDEO_SYSTEM_ACCESS_LEVEL.STATUS, key: "status", label: "Status" },
      { id: VIDEO_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: VIDEO_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: VIDEO_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Ringtone Access",
    key: "ringtoneAccess",
    permissions: [
      { id: RINGTONE_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: RINGTONE_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: RINGTONE_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: RINGTONE_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: RINGTONE_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: RINGTONE_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Artist Access",
    key: "artistAccess",
    permissions: [
      { id: ARTIST_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: ARTIST_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      { id: ARTIST_SYSTEM_ACCESS_LEVEL.STATUS, key: "status", label: "Status" },
      { id: ARTIST_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: ARTIST_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: ARTIST_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Performer Access",
    key: "performerAccess",
    permissions: [
      { id: PERFORMER_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: PERFORMER_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: PERFORMER_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: PERFORMER_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Pro & Eng Access",
    key: "producerEngineerAccess",
    permissions: [
      {
        id: PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL.VIEW,
        key: "view",
        label: "View",
      },
      {
        id: PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Writer Access",
    key: "writerAccess",
    permissions: [
      { id: WRITER_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      { id: WRITER_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: WRITER_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: WRITER_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Publisher Access",
    key: "publisherAccess",
    permissions: [
      { id: PUBLISHER_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: PUBLISHER_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: PUBLISHER_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: PUBLISHER_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: PUBLISHER_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: PUBLISHER_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Label Access",
    key: "labelAccess",
    permissions: [
      { id: LABEL_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: LABEL_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      { id: LABEL_SYSTEM_ACCESS_LEVEL.STATUS, key: "status", label: "Status" },
      { id: LABEL_SYSTEM_ACCESS_LEVEL.CREATE, key: "create", label: "Create" },
      { id: LABEL_SYSTEM_ACCESS_LEVEL.UPDATE, key: "update", label: "Update" },
      { id: LABEL_SYSTEM_ACCESS_LEVEL.DELETE, key: "delete", label: "Delete" },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Transaction Access",
    key: "transactionAccess",
    permissions: [
      { id: TRANSACTION_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: TRANSACTION_SYSTEM_ACCESS_LEVEL.EXPORT,
        key: "export",
        label: "Export",
      },
      {
        id: TRANSACTION_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: TRANSACTION_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: TRANSACTION_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: TRANSACTION_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Withdraw Access",
    key: "withdrawAccess",
    permissions: [
      { id: WITHDRAW_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
      {
        id: WITHDRAW_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: WITHDRAW_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: WITHDRAW_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: WITHDRAW_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
  {
    name: "Consumption Access",
    key: "consumptionAccess",
    permissions: [
      { id: CONSUMPTION_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Engagement Access",
    key: "engagementAccess",
    permissions: [
      { id: ENGAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Revenue Access",
    key: "revenueAccess",
    permissions: [
      { id: REVENUE_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Geo Access",
    key: "geoAccess",
    permissions: [
      { id: GEO_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Rights Mng Access",
    key: "rightsManagementAccess",
    permissions: [
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW,
        key: "view",
        label: "View",
      },
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.APPROVE,
        key: "approve",
        label: "Approve",
      },
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.STATUS,
        key: "status",
        label: "Status",
      },
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.CREATE,
        key: "create",
        label: "Create",
      },
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.UPDATE,
        key: "update",
        label: "Update",
      },
      {
        id: RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.DELETE,
        key: "delete",
        label: "Delete",
      },
      { id: "admin", key: "admin", label: "Admin" },
    ],
  },
];

// Helper to format role display
function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

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

interface AccessFormProps {
  users: Partial<User>[];
}

export function AccessForm({ users }: AccessFormProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAccessData>({
    resolver: zodResolver(createAccessSchema),
    defaultValues: {
      userId: "",
      expiresAt: undefined,
      permissions: {},
    },
  });

  const handleExpiresAtChange = useCallback(
    (date: Date) => {
      setExpiresAt(date);
      setValue("expiresAt", date);
      setDatePickerOpen(false);
    },
    [setValue]
  );

  const handleUserChange = useCallback(
    (value: string) => {
      setSelectedUser(value);
      setValue("userId", value);
      setUserSelectOpen(false);
    },
    [setValue]
  );
  const selectedUserData = useMemo(
    () => users.find((u) => u.id === selectedUser),
    [selectedUser, users]
  );
  const userInitials = useMemo(
    () => (selectedUserData?.name ? getInitials(selectedUserData.name) : ""),
    [selectedUserData]
  );

  // Get non-admin permissions for a category
  const getNonAdminPermissions = useCallback((category: AccessCategory) => {
    return category.permissions.filter((p) => p.key !== "admin");
  }, []);

  // Check if a permission is enabled (can be clicked)
  const isPermissionEnabled = useCallback(
    (categoryKey: string, permissionKey: string) => {
      // Admin is always enabled
      if (permissionKey === "admin") return true;

      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return false;

      const nonAdminPerms = getNonAdminPermissions(categoryData);
      const currentIndex = nonAdminPerms.findIndex(
        (p) => p.key === permissionKey
      );

      // First permission (view) is always enabled
      if (currentIndex === 0) return true;

      // Check if previous permission is checked
      const previousPermission = nonAdminPerms[currentIndex - 1];
      return permissions[categoryKey]?.[previousPermission.key] === true;
    },
    [permissions, getNonAdminPermissions]
  );

  // Check if a permission can be unchecked
  const canUncheckPermission = useCallback(
    (categoryKey: string, permissionKey: string) => {
      // Admin can always be unchecked
      if (permissionKey === "admin") return true;

      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return true;

      const nonAdminPerms = getNonAdminPermissions(categoryData);
      const currentIndex = nonAdminPerms.findIndex(
        (p) => p.key === permissionKey
      );

      // If this is the last non-admin permission, it can always be unchecked
      if (currentIndex === nonAdminPerms.length - 1) return true;

      // Check if any subsequent permission is checked
      for (let i = currentIndex + 1; i < nonAdminPerms.length; i++) {
        if (permissions[categoryKey]?.[nonAdminPerms[i].key]) {
          return false;
        }
      }

      return true;
    },
    [permissions, getNonAdminPermissions]
  );

  // Get tooltip message for disabled permissions
  const getDisabledTooltip = useCallback(
    (
      categoryKey: string,
      permissionKey: string,
      isEnabled: boolean,
      canUncheck: boolean
    ) => {
      if (permissionKey === "admin") return null;

      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return null;

      if (!isEnabled) {
        const nonAdminPerms = getNonAdminPermissions(categoryData);
        const currentIndex = nonAdminPerms.findIndex(
          (p) => p.key === permissionKey
        );

        if (currentIndex > 0) {
          const previousPermission = nonAdminPerms[currentIndex - 1];
          return `Enable "${previousPermission.label}" first`;
        }
      }

      if (!canUncheck) {
        return "Uncheck higher permissions first";
      }

      return null;
    },
    [getNonAdminPermissions]
  );

  const handlePermissionChange = useCallback(
    (categoryKey: string, permissionKey: string, checked: boolean) => {
      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return;

      const newPermissions = { ...permissions };
      if (!newPermissions[categoryKey]) {
        newPermissions[categoryKey] = {};
      }

      // If clicking Admin (toggle all)
      if (permissionKey === "admin") {
        if (checked) {
          // Check all non-admin permissions (admin is UI-only)
          categoryData.permissions.forEach((p) => {
            if (p.key !== "admin") {
              newPermissions[categoryKey][p.key] = true;
            }
          });
        } else {
          // Uncheck all non-admin permissions
          categoryData.permissions.forEach((p) => {
            if (p.key !== "admin") {
              newPermissions[categoryKey][p.key] = false;
            }
          });
        }
      } else {
        // For non-admin permissions
        const nonAdminPerms = getNonAdminPermissions(categoryData);
        const currentIndex = nonAdminPerms.findIndex(
          (p) => p.key === permissionKey
        );

        if (checked) {
          // When checking, also check all previous permissions
          for (let i = 0; i <= currentIndex; i++) {
            newPermissions[categoryKey][nonAdminPerms[i].key] = true;
          }
        } else {
          // When unchecking, also uncheck all subsequent permissions
          for (let i = currentIndex; i < nonAdminPerms.length; i++) {
            newPermissions[categoryKey][nonAdminPerms[i].key] = false;
          }
        }
      }

      setPermissions(newPermissions);

      // Convert boolean state to arrays of enum IDs for form submission
      const formPermissions: Record<string, string[]> = {};
      for (const category of accessCategories) {
        const categoryPerms = newPermissions[category.key];
        if (categoryPerms) {
          const checkedIds: string[] = [];
          for (const perm of category.permissions) {
            if (perm.key !== "admin" && categoryPerms[perm.key]) {
              checkedIds.push(perm.id); // Use the enum ID
            }
          }
          if (checkedIds.length > 0) {
            formPermissions[category.key] = checkedIds;
          }
        }
      }

      setValue(
        "permissions",
        formPermissions as CreateAccessData["permissions"]
      );
    },
    [permissions, setValue, getNonAdminPermissions]
  );

  // Check if admin toggle should be checked (all non-admin permissions are checked)
  const isAdminChecked = useCallback(
    (categoryKey: string) => {
      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return false;

      const nonAdminPerms = getNonAdminPermissions(categoryData);
      return nonAdminPerms.every(
        (p) => permissions[categoryKey]?.[p.key] === true
      );
    },
    [permissions, getNonAdminPermissions]
  );

  const onSubmit = async (data: CreateAccessData) => {
    setFormMessage(null);
    try {
      const result = await createSystemAccess(data);
      if (result.success) {
        toast.success(result.message || "Access created successfully");
        setFormMessage("Access permissions have been created successfully.");
        reset();
        router.push(`/system/administration/accesses/${result.data?.id}`);
      } else {
        if (result.errors) {
          const extracted = extractServerErrors(result.errors);
          Object.entries(extracted.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateAccessData, { message });
          });
        }
        setFormMessage(result.message || "Failed to create access.");
        toast.error(result.message || "Failed to create access permissions");
      }
    } catch (error) {
      console.error("Error creating access:", error);
      toast.error("Failed to create access permissions");
      setFormMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheckIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              System Access Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure system user access permissions for system resources
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Select System User
              </CardTitle>
              <CardDescription>
                Choose the system user to assign access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!errors.userId}>
                  <FieldLabel
                    htmlFor="user"
                    className="text-foreground text-sm font-medium"
                  >
                    User <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover
                    open={userSelectOpen}
                    onOpenChange={setUserSelectOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userSelectOpen}
                        className="w-full justify-between h-auto min-h-10 py-2"
                      >
                        {selectedUserData ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={selectedUserData.avatar || undefined}
                                alt={selectedUserData.name || "User"}
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="font-medium text-sm">
                                {selectedUserData.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedUserData.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Search and select a user...
                          </span>
                        )}
                        <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full min-w-[400px] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search by ID, name, email, or phone..."
                          className="h-10"
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-6">
                              <SearchIcon className="size-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                No users found
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup heading="System Users">
                            {users.map((user) => {
                              const initials = user.name
                                ? getInitials(user.name)
                                : "?";
                              // Check if user is eligible for access assignment
                              const isVerified = !!user.verifiedAt;
                              const isApproved = !!user.approvedAt;
                              const isSuspended = !!user.suspendedAt;
                              const isEligible =
                                isVerified && isApproved && !isSuspended;

                              return (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.id} ${user.name} ${user.email} ${user.phone || ""}`}
                                  onSelect={() => {
                                    if (isEligible) {
                                      handleUserChange(user.id!);
                                    }
                                  }}
                                  className={cn(
                                    "cursor-pointer py-3",
                                    !isEligible &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                  disabled={!isEligible}
                                >
                                  <div className="flex items-start gap-3 w-full">
                                    {/* Avatar and Role Column */}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                      <Avatar className="size-10">
                                        <AvatarImage
                                          src={user.avatar || undefined}
                                          alt={user.name || "User"}
                                        />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                          {initials}
                                        </AvatarFallback>
                                      </Avatar>
                                      {user.role && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] flex flex-col leading-tight"
                                        >
                                          {user.role
                                            ?.split("_")
                                            .map((word, i) => (
                                              <span key={i}>
                                                {formatRole(word)}
                                              </span>
                                            ))}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* User Details Column */}
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <HashIcon className="size-3" />
                                        <span className="font-mono truncate">
                                          {user.id}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-sm truncate">
                                        {user.name || "Unnamed User"}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MailIcon className="size-3" />
                                        <span className="truncate">
                                          {user.email || "No email"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <PhoneIcon className="size-3" />
                                        <span>{user.phone || "No phone"}</span>
                                      </div>
                                      {!isEligible && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <Badge
                                            variant="destructive"
                                            className="text-[10px]"
                                          >
                                            {!isVerified
                                              ? "Not Verified"
                                              : !isApproved
                                                ? "Not Approved"
                                                : "Suspended"}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>

                                    {/* Check Icon */}
                                    <CheckIcon
                                      className={cn(
                                        "size-4 shrink-0 mt-3",
                                        selectedUser === user.id && isEligible
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.userId && (
                    <FieldError>{errors.userId.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              {selectedUserData && (
                <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <Avatar className="size-14">
                        <AvatarImage
                          src={selectedUserData.avatar || undefined}
                          alt={selectedUserData.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUserData.role && (
                        <Badge variant="outline">
                          {formatRole(selectedUserData.role)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <HashIcon className="size-3" />
                        <span className="font-mono">{selectedUserData.id}</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {selectedUserData.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="size-3.5" />
                        <span>{selectedUserData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PhoneIcon className="size-3.5" />
                        <span>
                          {selectedUserData.phone || "No phone number"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedUserData.verifiedAt && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        {selectedUserData.approvedAt && (
                          <Badge variant="default" className="text-xs">
                            Approved
                          </Badge>
                        )}
                        {selectedUserData.suspendedAt && (
                          <Badge variant="destructive" className="text-xs">
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Expiry Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5" />
                Access Expiry
              </CardTitle>
              <CardDescription>
                Set the expiration date for this access. The access will
                automatically be revoked after this date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!errors.expiresAt}>
                  <FieldLabel
                    htmlFor="expiresAt"
                    className="text-foreground text-sm font-medium"
                  >
                    Expiry Date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="expiresAt"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiresAt && "text-muted-foreground",
                          errors.expiresAt && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {expiresAt ? (
                          format(expiresAt, "PPP")
                        ) : (
                          <span>Select expiry date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        required
                        selected={expiresAt}
                        onSelect={handleExpiresAtChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expiresAt && (
                    <FieldError>Please select an expiry date</FieldError>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Access will automatically expire on this date
                  </p>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Access Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="size-5" />
                Access Permissions
              </CardTitle>
              <CardDescription>
                Configure granular access controls for different system
                resources. Permissions are cascading - enable previous
                permissions to unlock the next ones. Click Admin to toggle all.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formMessage && (
                <Alert>
                  <AlertDescription>{formMessage}</AlertDescription>
                </Alert>
              )}

              <TooltipProvider delayDuration={200}>
                <div className="space-y-2">
                  {accessCategories.map((category) => (
                    <div
                      key={category.key}
                      className="group rounded-lg border bg-card hover:bg-accent/5 transition-colors duration-200 p-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="flex items-center justify-between gap-2 md:min-w-[180px] md:max-w-[180px]">
                          <Label className="text-sm font-semibold text-foreground">
                            {category.name}:
                          </Label>
                        </div>
                        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                          {category.permissions.map((permission) => {
                            // For admin, use computed check state
                            const isAdminPermission =
                              permission.key === "admin";
                            const isEnabled = isPermissionEnabled(
                              category.key,
                              permission.key
                            );
                            const canUncheck = canUncheckPermission(
                              category.key,
                              permission.key
                            );
                            const isChecked = isAdminPermission
                              ? isAdminChecked(category.key)
                              : permissions[category.key]?.[permission.key] ||
                                false;
                            const isDisabled =
                              isSubmitting ||
                              (!isEnabled && !isChecked) ||
                              (isChecked && !canUncheck);
                            const tooltipMessage = getDisabledTooltip(
                              category.key,
                              permission.key,
                              isEnabled,
                              canUncheck
                            );

                            const checkboxContent = (
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 transition-opacity",
                                  isDisabled &&
                                    !isAdminPermission &&
                                    "opacity-50"
                                )}
                              >
                                <Checkbox
                                  id={`${category.key}-${permission.key}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(
                                      category.key,
                                      permission.key,
                                      checked as boolean
                                    )
                                  }
                                  disabled={isDisabled}
                                  className={cn(
                                    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                                    isAdminPermission &&
                                      "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                                  )}
                                />
                                <Label
                                  htmlFor={`${category.key}-${permission.key}`}
                                  className={cn(
                                    "text-sm font-medium transition-colors",
                                    isDisabled
                                      ? "cursor-not-allowed text-muted-foreground"
                                      : "cursor-pointer text-muted-foreground hover:text-foreground",
                                    isAdminPermission && "font-bold"
                                  )}
                                >
                                  {permission.label}
                                </Label>
                                {isDisabled &&
                                  !isSubmitting &&
                                  !isAdminPermission && (
                                    <LockIcon className="size-3 text-muted-foreground" />
                                  )}
                              </div>
                            );

                            if (tooltipMessage && isDisabled) {
                              return (
                                <Tooltip key={permission.key}>
                                  <TooltipTrigger asChild>
                                    {checkboxContent}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{tooltipMessage}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }

                            return (
                              <div key={permission.key}>{checkboxContent}</div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedUser}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Creating Access...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  Create Access
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
