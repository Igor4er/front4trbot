import CenterLayout from "@/components/CenterLayout";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Home | Trading bot";
  }, []);

  return (
    <CenterLayout showBackButton={false}>
      <div className="flec-col">
        <div className="text-4xl font-bold">Trading bot</div>
        <div className="text-2xl text-muted-foreground">
          Pick an option from the sidebar
        </div>
      </div>
    </CenterLayout>
  );
}
