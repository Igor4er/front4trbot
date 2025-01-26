import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Bot } from "@/services/api";
import { Circle } from "lucide-react"; // Import Circle from lucide-react
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CollapsibleConfigSectionProps {
  title: string;
  defaultOpen: boolean;
  configs: Bot[];
  isLoading: boolean;
}

export function CollapsibleConfigSection({
  title,
  defaultOpen,
  configs,
  isLoading,
}: CollapsibleConfigSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {title} {isLoading ? "(Loading...)" : `(${configs.length})`}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {configs.map((config) => (
              <SidebarMenuSubButton key={config.id} asChild>
                <Link
                  to={`/bots/${config.id}`}
                  className="flex items-center gap-2"
                >
                  <Circle
                    className={cn(
                      "!h-3 !w-3 fill-current",
                      config.running ? "!text-green-500" : "!text-red-500",
                    )}
                  />
                  {config.pair} {config.timeframe}
                </Link>
              </SidebarMenuSubButton>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
