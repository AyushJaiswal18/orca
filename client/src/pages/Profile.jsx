import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/authContext";
import apiClient from "@/utils/api";
import { removeAuthToken } from "@/utils/auth";
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
                  await apiClient.get("/users/logout");
                } catch (error) {
                  // Continue with logout even if API call fails
                } finally {
                  removeAuthToken();
                  setauthStatus(false);
                }
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
