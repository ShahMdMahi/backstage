"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";

import { Navigation } from "./navigation";
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Session, User } from "@/lib/prisma/browser";

// This is sample data.
const data = {
  teams: [
    {
      name: "RoyalMotionIT",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Yamaha Music",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "NR IT",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function RootSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: (Session & { user: User | null }) | null;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={data.teams} />
      </SidebarHeader>
      <SidebarContent className="no-scrollbar">
        <Navigation session={session} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
