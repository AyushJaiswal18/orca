import Sidebar from "@/components/custom/Sidebar";
import Launcher from "../components/custom/Launcher";

export default function LauncherPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Launcher />
        </main>
      </div>
    </div>
  );
}
