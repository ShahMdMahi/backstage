"use client";

import {
  Home,
  ShieldUser,
  Sun,
  Moon,
  LogOut,
  Settings,
  UserIcon,
  BrickWallShield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { Session, User } from "@/lib/prisma/browser";
import { ROLE } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";
import { toast } from "sonner";

export function NavUser({
  session,
}: {
  session: (Session & { user: User | null }) | null;
}) {
  const user = session?.user;
  const initials = getInitials(user?.name ?? "User");
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard accessibility: handle Enter/Space for menu items
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    callback: () => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.avatar ?? undefined}
                  alt={user?.name ?? "User"}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.avatar ?? undefined}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {session?.user?.role === ROLE.SYSTEM_OWNER ||
            session?.user?.role === ROLE.SYSTEM_ADMIN ? (
              <DropdownMenuGroup>
                <DropdownMenuItem
                  tabIndex={0}
                  className="flex items-center gap-2"
                  aria-label="Go to Home"
                  onClick={() => router.push("/")}
                  onKeyDown={(e) => handleKeyDown(e, () => router.push("/"))}
                >
                  <Home className="mr-2 h-4 w-4" /> Home
                </DropdownMenuItem>
                <DropdownMenuItem
                  tabIndex={0}
                  className="flex items-center gap-2"
                  aria-label="Go to System"
                  onClick={() => router.push("/system")}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => router.push("/system"))
                  }
                >
                  <ShieldUser className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuGroup>
            ) : session?.user?.role === ROLE.SYSTEM_USER ? (
              <DropdownMenuGroup>
                <DropdownMenuItem
                  tabIndex={0}
                  className="flex items-center gap-2"
                  aria-label="Go to System"
                  onClick={() => router.push("/system")}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => router.push("/system"))
                  }
                >
                  <ShieldUser className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuGroup>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuItem
                  tabIndex={0}
                  className="flex items-center gap-2"
                  aria-label="Go to Home"
                  onClick={() => router.push("/")}
                  onKeyDown={(e) => handleKeyDown(e, () => router.push("/"))}
                >
                  <Home className="mr-2 h-4 w-4" /> Home
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tabIndex={0}
              className="flex items-center gap-2"
              aria-label="Switch theme"
              onClick={() => {
                if (!mounted) return;
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
              onKeyDown={(e) =>
                handleKeyDown(e, () => {
                  if (!mounted) return;
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                })
              }
            >
              {mounted && resolvedTheme === "dark" ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              Switch Theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                tabIndex={0}
                className="flex items-center gap-2"
                aria-label="Go to Profile"
                onClick={() => router.push("/system/profile")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => router.push("/system/profile"))
                }
              >
                <UserIcon className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                tabIndex={0}
                className="flex items-center gap-2"
                aria-label="Go to Sessions"
                onClick={() => router.push("/system/sessions")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => router.push("/system/sessions"))
                }
              >
                <BrickWallShield className="mr-2 h-4 w-4" /> Sessions
              </DropdownMenuItem>
              <DropdownMenuItem
                tabIndex={0}
                className="flex items-center gap-2"
                aria-label="Go to Settings"
                onClick={() => router.push("/system/settings")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => router.push("/system/settings"))
                }
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tabIndex={0}
              className="text-destructive focus:text-destructive flex items-center gap-2"
              aria-label="Log out"
              onClick={async () => {
                const result = await logout();
                if (result.success) {
                  toast.success(result.message || "Logged out successfully");
                  router.push("/auth/login");
                } else {
                  toast.error(result.message || "Failed to log out");
                }
              }}
              onKeyDown={(e) =>
                handleKeyDown(e, async () => {
                  const result = await logout();
                  if (result.success) {
                    toast.success(result.message || "Logged out successfully");
                    router.push("/auth/login");
                  } else {
                    toast.error(result.message || "Failed to log out");
                  }
                })
              }
            >
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
