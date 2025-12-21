"use client";

import React from "react";
import {
  ChevronRight,
  House,
  ShieldUser,
  FolderOpen,
  ListMusic,
  Music,
  SquarePlay,
  BellRing,
  Users,
  UserStar,
  UserRound,
  BookUser,
  Disc,
  Wallet,
  BanknoteArrowDown,
  Activity,
  ChartArea,
  SquareMousePointer,
  BanknoteArrowUp,
  Earth,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ROLE, Session, User } from "@/lib/prisma/browser";

export function Navigation({
  session,
}: {
  session: (Session & { user: User | null }) | null;
}) {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Main",
      items:
        session?.user?.role === ROLE.SYSTEM_ADMIN
          ? [
              {
                title: "Home",
                url: "/",
                icon: House,
                isActive: !pathname.startsWith("/system-admin"),
                isOpen: false,
                items: [],
              },
              {
                title: "System Admin",
                url: "/system-admin",
                icon: ShieldUser,
                isActive: pathname.startsWith("/system-admin"),
                isOpen: false,
                items: [],
              },
            ]
          : [
              {
                title: "Home",
                url: "/",
                icon: House,
                isActive: pathname === "/",
                isOpen: false,
                items: [],
              },
            ],
    },
    {
      title: "Catalog",
      items: [
        {
          title: "Assets",
          url: "/catalog/assets",
          icon: FolderOpen,
          isActive: pathname.startsWith("/catalog/assets"),
          isOpen: pathname.startsWith("/catalog/assets"),
          items: [
            {
              title: "Releases",
              url: "/catalog/assets/releases",
              icon: ListMusic,
              isActive: pathname === "/catalog/assets/releases",
            },
            {
              title: "Tracks",
              url: "/catalog/assets/tracks",
              icon: Music,
              isActive: pathname === "/catalog/assets/tracks",
            },
            {
              title: "Videos",
              url: "/catalog/assets/videos",
              icon: SquarePlay,
              isActive: pathname === "/catalog/assets/videos",
            },
            {
              title: "Ringtones",
              url: "/catalog/assets/ringtones",
              icon: BellRing,
              isActive: pathname === "/catalog/assets/ringtones",
            },
          ],
        },
        {
          title: "Contributors",
          url: "/catalog/contributors",
          icon: Users,
          isActive: pathname.startsWith("/catalog/contributors"),
          isOpen: pathname.startsWith("/catalog/contributors"),
          items: [
            {
              title: "Artists",
              url: "/catalog/contributors/artists",
              icon: UserStar,
              isActive: pathname === "/catalog/contributors/artists",
            },
            {
              title: "Performers",
              url: "/catalog/contributors/performers",
              icon: UserRound,
              isActive: pathname === "/catalog/contributors/performers",
            },
            {
              title: "Producers & Engineers",
              url: "/catalog/contributors/producers-and-engineers",
              icon: UserRound,
              isActive:
                pathname === "/catalog/contributors/producers-and-engineers",
            },
            {
              title: "Writers",
              url: "/catalog/contributors/writers",
              icon: UserRound,
              isActive: pathname === "/catalog/contributors/writers",
            },
            {
              title: "Publishers",
              url: "/catalog/contributors/publishers",
              icon: BookUser,
              isActive: pathname === "/catalog/contributors/publishers",
            },
            {
              title: "Labels",
              url: "/catalog/contributors/labels",
              icon: Disc,
              isActive: pathname === "/catalog/contributors/labels",
            },
          ],
        },
      ],
    },
    {
      title: "Royalties",
      items: [
        {
          title: "Transactions",
          url: "/royalties/transactions",
          icon: Wallet,
          isActive: pathname.startsWith("/royalties/transactions"),
          isOpen: pathname.startsWith("/royalties/transactions"),
          items: [],
        },
        {
          title: "Withdraw",
          url: "/royalties/withdraw",
          icon: BanknoteArrowDown,
          isActive: pathname.startsWith("/royalties/withdraw"),
          isOpen: pathname.startsWith("/royalties/withdraw"),
          items: [],
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          title: "Analytics",
          url: "/reports/analytics",
          icon: Activity,
          isActive: pathname.startsWith("/reports/analytics"),
          isOpen: pathname.startsWith("/reports/analytics"),
          items: [
            {
              title: "Consumption",
              url: "/reports/analytics/consumption",
              icon: ChartArea,
              isActive: pathname === "/reports/analytics/consumption",
            },
            {
              title: "Engagement",
              url: "/reports/analytics/engagement",
              icon: SquareMousePointer,
              isActive: pathname === "/reports/analytics/engagement",
            },
            {
              title: "Revenue",
              url: "/reports/analytics/revenue",
              icon: BanknoteArrowUp,
              isActive: pathname === "/reports/analytics/revenue",
            },
            {
              title: "Geo",
              url: "/reports/analytics/geo",
              icon: Earth,
              isActive: pathname === "/reports/analytics/geo",
            },
          ],
        },
      ],
    },
  ];

  return navigation.map((group, index) => (
    <SidebarGroup key={index}>
      {group?.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
      <SidebarMenu key={index}>
        {group.items.map((item) => (
          <React.Fragment key={item.title}>
            {item.items.length === 0 && (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {item.items.length !== 0 && (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={subItem.isActive}
                            asChild
                          >
                            <Link
                              href={subItem.url}
                              className="flex items-center gap-2"
                            >
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}
          </React.Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ));
}
