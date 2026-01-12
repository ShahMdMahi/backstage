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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ShieldCheckIcon,
  UserIcon,
  SaveIcon,
  LockIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  HashIcon,
  PenIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateAccessSchema,
  type UpdateAccessData,
} from "@/validators/system/access";
import { User, SystemAccess } from "@/lib/prisma/browser";
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
import { updateSystemAccess } from "@/actions/system/access";
import { useRouter } from "next/navigation";

interface Permission {
  id: string;
  key: string;
  label: string;
}

interface AccessCategory {
  name: string;
  key: string;
  dbKey: string; // Database field key
  permissions: Permission[];
}

const accessCategories: AccessCategory[] = [
  {
    name: "User Access",
    key: "userAccess",
    dbKey: "usersAccessLevel",
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
    dbKey: "workspaceAccountsAccessLevel",
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
    dbKey: "reportingAccessLevel",
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
        id: REPORTING_SYSTEM_ACCESS_LEVEL.EXPORT,
        key: "export",
        label: "Export",
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
    dbKey: "releasesAccessLevel",
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
    dbKey: "tracksAccessLevel",
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
    dbKey: "videosAccessLevel",
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
    dbKey: "ringtonesAccessLevel",
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
    dbKey: "artistsAccessLevel",
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
    dbKey: "performersAccessLevel",
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
    name: "Producer & Engineer",
    key: "producerEngineerAccess",
    dbKey: "producersAndEngineersAccessLevel",
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
    dbKey: "writersAccessLevel",
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
    dbKey: "publishersAccessLevel",
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
    dbKey: "labelsAccessLevel",
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
    dbKey: "transactionsAccessLevel",
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
    dbKey: "withdrawsAccessLevel",
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
    dbKey: "consumptionAccessLevel",
    permissions: [
      { id: CONSUMPTION_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Engagement Access",
    key: "engagementAccess",
    dbKey: "engagementAccessLevel",
    permissions: [
      { id: ENGAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Revenue Access",
    key: "revenueAccess",
    dbKey: "revenueAccessLevel",
    permissions: [
      { id: REVENUE_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Geo Access",
    key: "geoAccess",
    dbKey: "geoAccessLevel",
    permissions: [
      { id: GEO_SYSTEM_ACCESS_LEVEL.VIEW, key: "view", label: "View" },
    ],
  },
  {
    name: "Rights Mng Access",
    key: "rightsManagementAccess",
    dbKey: "rightsManagementAccessLevel",
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

interface AccessEditFormProps {
  access: SystemAccess & { user: User; assigner: User };
}

export function AccessEditForm({ access }: AccessEditFormProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Initialize permissions from existing access data using useMemo
  const initialPermissionsData = useMemo(() => {
    const perms: Record<string, Record<string, boolean>> = {};
    const formPerms: Record<string, string[]> = {};

    for (const category of accessCategories) {
      const dbValue = access[category.dbKey as keyof SystemAccess] as
        | string[]
        | undefined;
      if (dbValue && Array.isArray(dbValue) && dbValue.length > 0) {
        perms[category.key] = {};
        formPerms[category.key] = dbValue;

        for (const perm of category.permissions) {
          if (perm.key !== "admin" && dbValue.includes(perm.id)) {
            perms[category.key][perm.key] = true;
          }
        }
      }
    }

    return { permissions: perms, formPermissions: formPerms };
  }, [access]);

  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >(initialPermissionsData.permissions);

  const [expiresAt, setExpiresAt] = useState<Date>(new Date(access.expiresAt));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(!!access.suspendedAt);

  const user = access.user;
  const userInitials = useMemo(() => getInitials(user.name), [user.name]);

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAccessData>({
    resolver: zodResolver(updateAccessSchema),
    defaultValues: {
      id: access.id,
      expiresAt: new Date(access.expiresAt),
      isSuspended: !!access.suspendedAt,
      permissions:
        initialPermissionsData.formPermissions as UpdateAccessData["permissions"],
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

  const handleSuspendChange = useCallback(
    (checked: boolean) => {
      setIsSuspended(checked);
      setValue("isSuspended", checked);
    },
    [setValue]
  );

  // Get non-admin permissions for a category
  const getNonAdminPermissions = useCallback((category: AccessCategory) => {
    return category.permissions.filter((p) => p.key !== "admin");
  }, []);

  // Check if a permission is enabled (can be clicked)
  const isPermissionEnabled = useCallback(
    (categoryKey: string, permissionKey: string) => {
      if (permissionKey === "admin") return true;

      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return false;

      const nonAdminPerms = getNonAdminPermissions(categoryData);
      const currentIndex = nonAdminPerms.findIndex(
        (p) => p.key === permissionKey
      );

      if (currentIndex === 0) return true;

      const previousPermission = nonAdminPerms[currentIndex - 1];
      return permissions[categoryKey]?.[previousPermission.key] === true;
    },
    [permissions, getNonAdminPermissions]
  );

  // Check if a permission can be unchecked
  const canUncheckPermission = useCallback(
    (categoryKey: string, permissionKey: string) => {
      if (permissionKey === "admin") return true;

      const categoryData = accessCategories.find((c) => c.key === categoryKey);
      if (!categoryData) return true;

      const nonAdminPerms = getNonAdminPermissions(categoryData);
      const currentIndex = nonAdminPerms.findIndex(
        (p) => p.key === permissionKey
      );

      if (currentIndex === nonAdminPerms.length - 1) return true;

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

      if (permissionKey === "admin") {
        if (checked) {
          categoryData.permissions.forEach((p) => {
            if (p.key !== "admin") {
              newPermissions[categoryKey][p.key] = true;
            }
          });
        } else {
          categoryData.permissions.forEach((p) => {
            if (p.key !== "admin") {
              newPermissions[categoryKey][p.key] = false;
            }
          });
        }
      } else {
        const nonAdminPerms = getNonAdminPermissions(categoryData);
        const currentIndex = nonAdminPerms.findIndex(
          (p) => p.key === permissionKey
        );

        if (checked) {
          for (let i = 0; i <= currentIndex; i++) {
            newPermissions[categoryKey][nonAdminPerms[i].key] = true;
          }
        } else {
          for (let i = currentIndex; i < nonAdminPerms.length; i++) {
            newPermissions[categoryKey][nonAdminPerms[i].key] = false;
          }
        }
      }

      setPermissions(newPermissions);

      const formPermissions: Record<string, string[]> = {};
      for (const category of accessCategories) {
        const categoryPerms = newPermissions[category.key];
        if (categoryPerms) {
          const checkedIds: string[] = [];
          for (const perm of category.permissions) {
            if (perm.key !== "admin" && categoryPerms[perm.key]) {
              checkedIds.push(perm.id);
            }
          }
          if (checkedIds.length > 0) {
            formPermissions[category.key] = checkedIds;
          }
        }
      }

      setValue(
        "permissions",
        formPermissions as UpdateAccessData["permissions"]
      );
    },
    [permissions, setValue, getNonAdminPermissions]
  );

  // Check if admin toggle should be checked
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

  const onSubmit = async (data: UpdateAccessData) => {
    setFormMessage(null);
    try {
      const result = await updateSystemAccess(data);
      if (result.success) {
        toast.success(result.message || "Access updated successfully");
        setFormMessage("Access permissions have been updated successfully.");
        router.push(`/system/administration/accesses/${access.id}`);
      } else {
        if (result.errors) {
          const extracted = extractServerErrors(result.errors);
          Object.entries(extracted.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof UpdateAccessData, { message });
          });
        }
        setFormMessage(result.message || "Failed to update access.");
        toast.error(result.message || "Failed to update access permissions");
      }
    } catch (error) {
      console.error("Error updating access:", error);
      toast.error("Failed to update access permissions");
      setFormMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <PenIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit System Access
            </h1>
            <p className="text-muted-foreground mt-1">
              Modify system user access permissions for system resources
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Info Card (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Assigned User
              </CardTitle>
              <CardDescription>
                The system user with this access (cannot be changed)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="size-16 border-2 border-border">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HashIcon className="size-3.5" />
                      <span className="font-mono text-xs break-all">
                        {user.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="size-3.5 text-muted-foreground" />
                      <span>{user.phone || "No phone number"}</span>
                    </div>
                  </div>
                </div>
              </div>
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
                Set when this access should expire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!errors.expiresAt}>
                  <FieldLabel
                    htmlFor="expiresAt"
                    className="text-foreground text-sm font-medium"
                  >
                    Expiration Date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={datePickerOpen}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !expiresAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {expiresAt ? (
                          format(expiresAt, "PPP")
                        ) : (
                          <span>Pick an expiration date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiresAt}
                        onSelect={(date) => date && handleExpiresAtChange(date)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        required
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expiresAt && (
                    <FieldError>{errors.expiresAt.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Suspend Access Card */}
          <Card
            className={cn(
              "transition-colors",
              isSuspended && "border-destructive/50 bg-destructive/5"
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon
                  className={cn("size-5", isSuspended && "text-destructive")}
                />
                Access Status
              </CardTitle>
              <CardDescription>
                Suspend this access to temporarily disable all permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <Checkbox
                  id="suspend-access"
                  checked={isSuspended}
                  onCheckedChange={(checked) =>
                    handleSuspendChange(checked as boolean)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="suspend-access"
                    className={cn(
                      "font-semibold cursor-pointer",
                      isSuspended && "text-destructive"
                    )}
                  >
                    Suspend Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When suspended, the user will not be able to access any
                    system resources regardless of their permissions. This can
                    be reversed at any time.
                  </p>
                  {isSuspended && access.suspendedAt && (
                    <p className="text-xs text-destructive mt-2">
                      Originally suspended on:{" "}
                      {format(new Date(access.suspendedAt), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              </div>
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
                Configure granular access permissions for each category.
                Permissions are hierarchical — enabling a permission
                automatically enables all lower ones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formMessage && (
                <Alert
                  variant={
                    formMessage.includes("success") ? "default" : "destructive"
                  }
                >
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
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Updating Access...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  Update Access
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
