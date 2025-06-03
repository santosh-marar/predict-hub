import { AppSidebar } from "@/app/dashboard/_components/ui/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@repo/ui/components/sidebar";
import DashboardHeader from "./_components/custom/dashboard-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="">
          <DashboardHeader />
          {children}

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
