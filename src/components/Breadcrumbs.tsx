import { useLocation } from "react-router-dom";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  // Create breadcrumb items from the current path
  const createBreadcrumbItems = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = [];

    // Always add Home as the first item
    breadcrumbItems.push(
      <BreadcrumbItem key="home">
        <Link to="/">
          <BreadcrumbLink>Home</BreadcrumbLink>
        </Link>
      </BreadcrumbItem>,
    );

    // Add separator after Home if there are more segments
    if (pathSegments.length > 0) {
      breadcrumbItems.push(
        <BreadcrumbSeparator key="home-separator">
          <Slash className="h-4 w-4" />
        </BreadcrumbSeparator>,
      );
    }

    // Add remaining path segments
    pathSegments.forEach((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const formattedSegment =
        segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbItems.push(
        <BreadcrumbItem key={path}>
          <Link to={path}>
            <BreadcrumbLink>{formattedSegment}</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>,
      );

      // Add separator if not the last item
      if (index < pathSegments.length - 1) {
        breadcrumbItems.push(
          <BreadcrumbSeparator key={`separator-${index}`}>
            <Slash className="h-4 w-4" />
          </BreadcrumbSeparator>,
        );
      }
    });

    return breadcrumbItems;
  };

  return (
    <div className="sticky p-4">
      <Breadcrumb>
        <BreadcrumbList>{createBreadcrumbItems()}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
