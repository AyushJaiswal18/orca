import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/authContext";
import axios from "axios";
import { Link } from "react-router-dom";

import Sidebar from "@/components/custom/Sidebar";

export default function Profile() {
  const { authStatus, setauthStatus } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <Button
              onClick={async () => {
                try {
                  const res = await axios.get("/users/logout");
                  setauthStatus(false);
                } catch (error) {}
              }}
            >
              Logout
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
