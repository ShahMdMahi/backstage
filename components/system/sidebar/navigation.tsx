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
  Copyright,
  Youtube,
  Facebook,
  UserRoundPlus,
  FileCheckCorner,
  BadgeCheck,
  LinkIcon,
  GlobeLock,
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
import { ROLE } from "@/lib/prisma/enums";
import { Session, User } from "@/lib/prisma/browser";

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
        session?.user?.role === (ROLE.SYSTEM_OWNER || ROLE.SYSTEM_ADMIN)
          ? [
              {
                title: "Home",
                url: "/",
                icon: House,
                isActive: !pathname.startsWith("/system"),
                isOpen: false,
                items: [],
              },
              {
                title: "System",
                url: "/system",
                icon: ShieldUser,
                isActive: pathname.startsWith("/system"),
                isOpen: false,
                items: [],
              },
            ]
          : session?.user?.role === ROLE.SYSTEM_USER
            ? [
                {
                  title: "System",
                  url: "/system",
                  icon: House,
                  isActive: pathname.startsWith("/system"),
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
    {
      title: "Services",
      items: [
        {
          title: "Rights Management",
          url: "/services/rights-management",
          icon: Copyright,
          isActive: pathname.startsWith("/services/rights-management"),
          isOpen: pathname.startsWith("/services/rights-management"),
          items: [
            {
              title: "YT Claim Release",
              url: "/services/rights-management/youtube-claim-release",
              icon: Youtube,
              isActive:
                pathname ===
                "/services/rights-management/youtube-claim-release",
            },
            {
              title: "FB Claim Release",
              url: "/services/rights-management/facebook-claim-release",
              icon: Facebook,
              isActive:
                pathname ===
                "/services/rights-management/facebook-claim-release",
            },
            {
              title: "Meta Whitelist",
              url: "/services/rights-management/meta-whitelist",
              icon: UserRoundPlus,
              isActive:
                pathname === "/services/rights-management/meta-whitelist",
            },
            {
              title: "Youtube Whitelist",
              url: "/services/rights-management/youtube-whitelist",
              icon: FileCheckCorner,
              isActive:
                pathname === "/services/rights-management/youtube-whitelist",
            },
            {
              title: "OAC Request",
              url: "/services/rights-management/oac-request",
              icon: BadgeCheck,
              isActive: pathname === "/services/rights-management/oac-request",
            },
            {
              title: "Meta Profile Linkup",
              url: "/services/rights-management/meta-profile-linkup",
              icon: LinkIcon,
              isActive:
                pathname === "/services/rights-management/meta-profile-linkup",
            },
            {
              title: "YT Manual Claim",
              url: "/services/rights-management/youtube-manual-claim",
              icon: GlobeLock,
              isActive:
                pathname === "/services/rights-management/youtube-manual-claim",
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
