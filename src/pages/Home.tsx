import CenterLayout from "@/components/CenterLayout";

export default function Home() {
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
