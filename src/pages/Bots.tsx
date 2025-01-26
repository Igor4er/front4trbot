import CenterLayout from "@/components/CenterLayout";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Bots() {
  useEffect(() => {
    document.title = "Bots | Trading bot";
  }, []);

  return <Navigate to="/" replace />;

  return (
    <CenterLayout showBackButton={false}>
      <div className="flec-col">
        <div className="text-4xl font-bold">Trading bot</div>
        <div className="text-2xl text-muted-foreground">
          Will be a bot list in a future
        </div>
      </div>
    </CenterLayout>
  );
}
