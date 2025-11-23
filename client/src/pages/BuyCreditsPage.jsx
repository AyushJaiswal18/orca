import Sidebar from "@/components/custom/Sidebar";
import BuyCredits from "@/components/custom/BuyCredits";

export default function BuyCreditsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <BuyCredits />
        </main>
      </div>
    </div>
  );
}
