import { SystemSidebar } from "@/components/system/sidebar/sidebar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AvatarWithDropdown } from "@/components/shared/avatar-with-dropdown";
import { getCurrentSession } from "@/actions/shared/session";

export const dynamic = "force-dynamic";

export default async function SystemLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (!session?.data?.user) redirect("/auth/login");
  return (
    <SidebarProvider>
      <SystemSidebar session={session?.data} />
      <SidebarInset
        className="flex max-h-screen min-h-screen flex-col overflow-hidden"
        role="main"
      >
        <header
          className="bg-background sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b shadow-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
          role="banner"
        >
          <div className="flex items-center gap-2 px-3 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4">
            <ThemeToggle />
            <AvatarWithDropdown session={session.data} />
          </div>
        </header>
        <main
          className="no-scrollbar m-1 mt-1 flex-1 overflow-hidden sm:m-2"
          role="main"
        >
          <ScrollArea className="h-full w-full p-2 sm:p-4">
            {children}
          </ScrollArea>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
