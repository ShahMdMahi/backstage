"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import {
  Home,
  Moon,
  Sun,
  UserIcon,
  BrickWallShield,
  Settings,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Session, User } from "@/lib/prisma/browser";
import { logout } from "@/actions/auth/auth";
import { toast } from "sonner";

export function AvatarWithDropdown({
  session,
}: {
  session: (Session & { user: User | null }) | null;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const user = session?.user;
  const initials = getInitials(user?.name ?? "User");
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className="h-8 w-8 cursor-pointer rounded-full"
          aria-label="User menu"
        >
          <AvatarImage
            src={user?.avatar ?? undefined}
            alt={user?.name ?? "User"}
          />
          <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
        aria-label="User dropdown menu"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user?.avatar ?? undefined}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.name ?? "User"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email ?? ""}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem
            tabIndex={0}
            className="flex items-center gap-2"
            aria-label="Go to Profile"
            onClick={() => router.push("/profile")}
            onKeyDown={(e) => handleKeyDown(e, () => router.push("/profile"))}
          >
            <UserIcon className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            tabIndex={0}
            className="flex items-center gap-2"
            aria-label="Go to Sessions"
            onClick={() => router.push("/sessions")}
            onKeyDown={(e) => handleKeyDown(e, () => router.push("/sessions"))}
          >
            <BrickWallShield className="mr-2 h-4 w-4" /> Sessions
          </DropdownMenuItem>
          <DropdownMenuItem
            tabIndex={0}
            className="flex items-center gap-2"
            aria-label="Go to Settings"
            onClick={() => router.push("/settings")}
            onKeyDown={(e) => handleKeyDown(e, () => router.push("/settings"))}
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
  );
}
