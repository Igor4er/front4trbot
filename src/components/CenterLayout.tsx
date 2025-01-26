import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface CenterLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showMainPageButton?: boolean;
}

const CenterLayout: React.FC<CenterLayoutProps> = ({
  children,
  showBackButton = true,
  showMainPageButton = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {showBackButton && (
        <div className="sticky top-0 left-0 p-4 bg-background z-10">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft /> Go back
          </Button>
        </div>
      )}
      {showMainPageButton && (
        <div className="sticky top-0 left-0 p-4 bg-background z-10">
          <Button onClick={() => navigate("/")} variant="outline">
            <Home /> Main page
          </Button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 md:p-10 w-full text-center">
        {children}
      </div>
    </div>
  );
};

export default CenterLayout;
