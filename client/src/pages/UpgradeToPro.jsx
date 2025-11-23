import Sidebar from "@/components/custom/Sidebar";

export default function UpgradeToPro() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <h1 className="text-3xl font-bold">
            Upgrade to a Orca Pro is coming soon ...
          </h1>
        </main>
      </div>
    </div>
  );
}
