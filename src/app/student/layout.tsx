import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent>
          <AppSidebar />
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if any */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
