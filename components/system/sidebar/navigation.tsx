"use client";

import React from "react";
import {
  ChevronRight,
  House,
  ShieldUser,
  LockKeyhole,
  BriefcaseBusiness,
  FileChartColumnIncreasing,
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
  LucideIcon,
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

type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  isOpen: boolean;
  items: NavigationItem[];
};

type NavigationGroup = {
  title?: string;
  items: NavigationItem[];
};

export function Navigation({
  session,
}: {
  session: (Session & { user: User | null }) | null;
}) {
  const pathname = usePathname();

  const role = session?.user?.role || ROLE.USER;
  const owner = ROLE.SYSTEM_OWNER;
  const admin = ROLE.SYSTEM_ADMIN;
  const user = ROLE.SYSTEM_USER;

  const haveHomeAccess = role === owner || role === admin;
  const haveSystemAccess = role === owner || role === admin || role === user;
  const haveMainAccess = haveHomeAccess || haveSystemAccess;

  const haveAccessesAccess = role === owner || role === admin;
  const haveUsersAccess = role === owner || role === admin;
  const haveWorkspacesAccess = role === owner || role === admin;
  const haveReportingAccess = role === owner || role === admin;
  const haveAdministrationAccess =
    haveAccessesAccess ||
    haveUsersAccess ||
    haveWorkspacesAccess ||
    haveReportingAccess;

  const haveReleasesAccess = role === owner || role === admin;
  const haveTracksAccess = role === owner || role === admin;
  const haveVideosAccess = role === owner || role === admin;
  const haveRingtonesAccess = role === owner || role === admin;
  const haveAssetsAccess =
    haveReleasesAccess ||
    haveTracksAccess ||
    haveVideosAccess ||
    haveRingtonesAccess;
  const haveArtistsAccess = role === owner || role === admin;
  const havePerformersAccess = role === owner || role === admin;
  const haveProducersAndEngineersAccess = role === owner || role === admin;
  const haveWritersAccess = role === owner || role === admin;
  const havePublishersAccess = role === owner || role === admin;
  const haveLabelsAccess = role === owner || role === admin;
  const haveContributorsAccess =
    haveArtistsAccess ||
    havePerformersAccess ||
    haveProducersAndEngineersAccess ||
    haveWritersAccess ||
    havePublishersAccess ||
    haveLabelsAccess;
  const haveCatalogAccess = haveAssetsAccess || haveContributorsAccess;

  const haveTransactionsAccess = role === owner || role === admin;
  const haveWithdrawalsAccess = role === owner || role === admin;
  const haveRoyaltiesAccess = haveTransactionsAccess || haveWithdrawalsAccess;

  const haveConsumptionAccess = role === owner || role === admin;
  const haveEngagementAccess = role === owner || role === admin;
  const haveRevenueAccess = role === owner || role === admin;
  const haveGeoAccess = role === owner || role === admin;
  const haveAnalyticsAccess =
    haveConsumptionAccess ||
    haveEngagementAccess ||
    haveRevenueAccess ||
    haveGeoAccess;
  const haveReportsAccess = haveAnalyticsAccess;

  const haveRightsManagementAccess = role === owner || role === admin;
  const haveServicesAccess = haveRightsManagementAccess;

  const navigation = [
    haveMainAccess && {
      title: "Main",
      items: [
        haveHomeAccess && {
          title: "Home",
          url: "/",
          icon: House,
          isActive: !pathname.startsWith("/system"),
          isOpen: false,
          items: [],
        },
        haveSystemAccess && {
          title: "System",
          url: "/system",
          icon: ShieldUser,
          isActive: pathname.startsWith("/system"),
          isOpen: false,
          items: [],
        },
      ],
    },
    haveAdministrationAccess && {
      title: "Administration",
      items: [
        haveAccessesAccess && {
          title: "Accesses",
          url: "/system/administration/accesses",
          icon: LockKeyhole,
          isActive: pathname.startsWith("/system/administration/accesses"),
          isOpen: false,
          items: [],
        },
        haveUsersAccess && {
          title: "Users",
          url: "/system/administration/users",
          icon: Users,
          isActive: pathname.startsWith("/system/administration/users"),
          isOpen: false,
          items: [],
        },
        haveWorkspacesAccess && {
          title: "Workspaces",
          url: "/system/administration/workspaces",
          icon: BriefcaseBusiness,
          isActive: pathname.startsWith("/system/administration/workspaces"),
          isOpen: false,
          items: [],
        },
        haveReportingAccess && {
          title: "Reporting",
          url: "/system/administration/reporting",
          icon: FileChartColumnIncreasing,
          isActive: pathname.startsWith("/system/administration/reporting"),
          isOpen: false,
          items: [],
        },
      ],
    },
    haveCatalogAccess && {
      title: "Catalog",
      items: [
        haveAssetsAccess && {
          title: "Assets",
          url: "/system/catalog/assets",
          icon: FolderOpen,
          isActive: pathname.startsWith("/system/catalog/assets"),
          isOpen: pathname.startsWith("/system/catalog/assets"),
          items: [
            haveReleasesAccess && {
              title: "Releases",
              url: "/system/catalog/assets/releases",
              icon: ListMusic,
              isActive: pathname === "/system/catalog/assets/releases",
            },
            haveTracksAccess && {
              title: "Tracks",
              url: "/system/catalog/assets/tracks",
              icon: Music,
              isActive: pathname === "/system/catalog/assets/tracks",
            },
            haveVideosAccess && {
              title: "Videos",
              url: "/system/catalog/assets/videos",
              icon: SquarePlay,
              isActive: pathname === "/system/catalog/assets/videos",
            },
            haveRingtonesAccess && {
              title: "Ringtones",
              url: "/system/catalog/assets/ringtones",
              icon: BellRing,
              isActive: pathname === "/system/catalog/assets/ringtones",
            },
          ],
        },
        haveContributorsAccess && {
          title: "Contributors",
          url: "/system/catalog/contributors",
          icon: Users,
          isActive: pathname.startsWith("/system/catalog/contributors"),
          isOpen: pathname.startsWith("/system/catalog/contributors"),
          items: [
            haveArtistsAccess && {
              title: "Artists",
              url: "/system/catalog/contributors/artists",
              icon: UserStar,
              isActive: pathname === "/system/catalog/contributors/artists",
            },
            havePerformersAccess && {
              title: "Performers",
              url: "/system/catalog/contributors/performers",
              icon: UserRound,
              isActive: pathname === "/system/catalog/contributors/performers",
            },
            haveProducersAndEngineersAccess && {
              title: "Producers & Engineers",
              url: "/system/catalog/contributors/producers-and-engineers",
              icon: UserRound,
              isActive:
                pathname ===
                "/system/catalog/contributors/producers-and-engineers",
            },
            haveWritersAccess && {
              title: "Writers",
              url: "/system/catalog/contributors/writers",
              icon: UserRound,
              isActive: pathname === "/system/catalog/contributors/writers",
            },
            havePublishersAccess && {
              title: "Publishers",
              url: "/system/catalog/contributors/publishers",
              icon: BookUser,
              isActive: pathname === "/system/catalog/contributors/publishers",
            },
            haveLabelsAccess && {
              title: "Labels",
              url: "/system/catalog/contributors/labels",
              icon: Disc,
              isActive: pathname === "/system/catalog/contributors/labels",
            },
          ],
        },
      ],
    },
    haveRoyaltiesAccess && {
      title: "Royalties",
      items: [
        haveTransactionsAccess && {
          title: "Transactions",
          url: "/system/royalties/transactions",
          icon: Wallet,
          isActive: pathname.startsWith("/system/royalties/transactions"),
          isOpen: pathname.startsWith("/system/royalties/transactions"),
          items: [],
        },
        haveWithdrawalsAccess && {
          title: "Withdraws",
          url: "/system/royalties/withdraws",
          icon: BanknoteArrowDown,
          isActive: pathname.startsWith("/system/royalties/withdraws"),
          isOpen: pathname.startsWith("/system/royalties/withdraws"),
          items: [],
        },
      ],
    },
    haveReportsAccess && {
      title: "Reports",
      items: [
        haveAnalyticsAccess && {
          title: "Analytics",
          url: "/system/reports/analytics",
          icon: Activity,
          isActive: pathname.startsWith("/system/reports/analytics"),
          isOpen: pathname.startsWith("/system/reports/analytics"),
          items: [
            haveConsumptionAccess && {
              title: "Consumption",
              url: "/system/reports/analytics/consumption",
              icon: ChartArea,
              isActive: pathname === "/system/reports/analytics/consumption",
            },
            haveEngagementAccess && {
              title: "Engagement",
              url: "/system/reports/analytics/engagement",
              icon: SquareMousePointer,
              isActive: pathname === "/system/reports/analytics/engagement",
            },
            haveRevenueAccess && {
              title: "Revenue",
              url: "/system/reports/analytics/revenue",
              icon: BanknoteArrowUp,
              isActive: pathname === "/system/reports/analytics/revenue",
            },
            haveGeoAccess && {
              title: "Geo",
              url: "/system/reports/analytics/geo",
              icon: Earth,
              isActive: pathname === "/system/reports/analytics/geo",
            },
          ],
        },
      ],
    },
    haveServicesAccess && {
      title: "Services",
      items: [
        haveRightsManagementAccess && {
          title: "Rights Management",
          url: "/system/services/rights-management",
          icon: Copyright,
          isActive: pathname.startsWith("/system/services/rights-management"),
          isOpen: pathname.startsWith("/system/services/rights-management"),
          items: [
            {
              title: "YT Claim Release",
              url: "/system/services/rights-management/youtube-claim-release",
              icon: Youtube,
              isActive:
                pathname ===
                "/system/services/rights-management/youtube-claim-release",
            },
            {
              title: "FB Claim Release",
              url: "/system/services/rights-management/facebook-claim-release",
              icon: Facebook,
              isActive:
                pathname ===
                "/system/services/rights-management/facebook-claim-release",
            },
            {
              title: "Meta Whitelist",
              url: "/system/services/rights-management/meta-whitelist",
              icon: UserRoundPlus,
              isActive:
                pathname ===
                "/system/services/rights-management/meta-whitelist",
            },
            {
              title: "Youtube Whitelist",
              url: "/system/services/rights-management/youtube-whitelist",
              icon: FileCheckCorner,
              isActive:
                pathname ===
                "/system/services/rights-management/youtube-whitelist",
            },
            {
              title: "OAC Request",
              url: "/system/services/rights-management/oac-request",
              icon: BadgeCheck,
              isActive:
                pathname === "/system/services/rights-management/oac-request",
            },
            {
              title: "Meta Profile Linkup",
              url: "/system/services/rights-management/meta-profile-linkup",
              icon: LinkIcon,
              isActive:
                pathname ===
                "/system/services/rights-management/meta-profile-linkup",
            },
            {
              title: "YT Manual Claim",
              url: "/system/services/rights-management/youtube-manual-claim",
              icon: GlobeLock,
              isActive:
                pathname ===
                "/system/services/rights-management/youtube-manual-claim",
            },
          ],
        },
      ],
    },
  ];

  const filteredNavigation = navigation.filter(Boolean) as NavigationGroup[];

  return filteredNavigation.map((group, index) => (
    <SidebarGroup key={index}>
      {group?.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
      <SidebarMenu key={index}>
        {(group.items.filter(Boolean) as NavigationItem[]).map((item) => (
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
                      {(item.items.filter(Boolean) as NavigationItem[]).map(
                        (subItem) => (
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
                        )
                      )}
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
