import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <AppSidebar />
      <main className="w-full">
        <Outlet />
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
