"use client";
import React from "react";
import {
  ChevronRight,
  House,
  ListMusic,
  Users,
  BadgeDollarSign,
  BanknoteArrowDown,
  Wallet,
  BanknoteArrowUp,
  ChartLine,
  Earth,
  Music,
  SquarePlay,
  BellRing,
  User as UserIcon,
  BookUser,
  Disc,
  ClipboardList,
  ChartNoAxesCombined,
  Shield,
  ShieldUser,
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
                isActive:
                  !pathname.startsWith("/system-admin") &&
                  !pathname.startsWith("/admin"),
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
              {
                title: "Admin",
                url: "/admin",
                icon: Shield,
                isActive: pathname.startsWith("/admin"),
                isOpen: false,
                items: [],
              },
            ]
          : session?.user?.role === ROLE.DEVELOPER
            ? [
                {
                  title: "Home",
                  url: "/",
                  icon: House,
                  isActive: pathname === "/",
                  isOpen: false,
                  items: [],
                },
                {
                  title: "Admin",
                  url: "/admin",
                  icon: Shield,
                  isActive: pathname.startsWith("/admin"),
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
          icon: ListMusic,
          isActive: pathname.startsWith("/catalog/assets"),
          isOpen: pathname.startsWith("/catalog/assets"),
          items: [
            {
              title: "Releases",
              url: "/catalog/assets/releases",
              icon: Music,
              isActive: pathname === "/catalog/assets/releases",
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
              icon: UserIcon,
              isActive: pathname === "/catalog/contributors/artists",
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
          title: "Finance",
          url: "/royalties/finance",
          icon: BadgeDollarSign,
          isActive: pathname.startsWith("/royalties/finance"),
          isOpen: pathname.startsWith("/royalties/finance"),
          items: [
            {
              title: "Transactions",
              url: "/royalties/finance/transactions",
              icon: ClipboardList,
              isActive: pathname === "/royalties/finance/transactions",
            },
            {
              title: "Payout Account",
              url: "/royalties/finance/payout-account",
              icon: Wallet,
              isActive: pathname === "/royalties/finance/payout-account",
            },
            {
              title: "Withdraw",
              url: "/royalties/finance/withdraw",
              icon: BanknoteArrowDown,
              isActive: pathname === "/royalties/finance/withdraw",
            },
          ],
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          title: "Analytics",
          url: "/analytics/consumption",
          icon: ChartNoAxesCombined,
          isActive: pathname.startsWith("/analytics/consumption"),
          isOpen: pathname.startsWith("/analytics/consumption"),
          items: [
            {
              title: "Consumption",
              url: "/reports/analytics/consumption",
              icon: ChartLine,
              isActive: pathname === "/reports/analytics/consumption",
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
              items: [],
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
