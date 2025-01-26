import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserControls from "./UserContrlos";
import { ConfigsGroup } from "./sidebar/ConfigsGroup";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <UserControls />
          </SidebarGroupContent>
        </SidebarGroup>
        <ConfigsGroup />
      </SidebarContent>
      <SidebarFooter>
        <Alert>
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertDescription>
            You are using beta version of trading bot. Expect bugs.
          </AlertDescription>
        </Alert>
      </SidebarFooter>
    </Sidebar>
  );
}
