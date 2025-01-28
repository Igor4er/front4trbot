import { useEffect, useState } from "react";
import { fetchConfigs, Bot } from "@/services/api";
import { useAuth } from "../../context/AuthContext";
import { CableIcon, Repeat, SearchX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { CollapsibleConfigSection } from "./CollapsibleConfigSection";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { eventService } from "@/services/events";

export function ConfigsGroup() {
  const { username } = useAuth();
  const [activeConfigs, setActiveConfigs] = useState<Bot[]>([]);
  const [stoppedConfigs, setStoppedConfigs] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const config = await fetchConfigs(username ? username : "");
      const bots = config.bots;
      setActiveConfigs(bots.filter((config) => config.running));
      setStoppedConfigs(bots.filter((config) => !config.running));
      setError(false);
    } catch (error) {
      console.error("Error loading configs:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();

    // Subscribe to config updates
    const unsubscribe = eventService.subscribe("configsUpdated", loadConfigs);

    // Cleanup subscription
    return () => unsubscribe();
  }, [username]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Configs</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {error && (
            <Alert variant="destructive">
              <CableIcon />
              <AlertDescription>
                Failed to fetch configs. Check console
              </AlertDescription>
            </Alert>
          )}
          <SidebarMenuButton asChild className="font-bold">
            <Link to="/config/add">
              <PlusIcon className="" />
              Add Config
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton onClick={loadConfigs}>
            <Repeat className="" />
            Reload Configs
          </SidebarMenuButton>
          <SidebarSeparator />
          {/* Only show sections if there are configs */}
          {(activeConfigs.length > 0 || stoppedConfigs.length > 0) && (
            <>
              <CollapsibleConfigSection
                title="Active"
                defaultOpen={true}
                configs={activeConfigs}
                isLoading={isLoading}
              />
              <CollapsibleConfigSection
                title="Stopped"
                defaultOpen={true}
                configs={stoppedConfigs}
                isLoading={isLoading}
              />
              <CollapsibleConfigSection
                title="All"
                defaultOpen={false}
                configs={[...activeConfigs, ...stoppedConfigs]}
                isLoading={isLoading}
              />
            </>
          )}
          {!error &&
            !isLoading &&
            activeConfigs.length === 0 &&
            stoppedConfigs.length === 0 && (
              <Alert className="mt-1" variant="destructive">
                <SearchX />
                <AlertDescription className="ml-2">
                  No configs found. Try creating one
                </AlertDescription>
              </Alert>
            )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
