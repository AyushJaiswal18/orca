import { useAuth } from "@/contexts/authContext";
import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoutes() {
  const { authStatus } = useAuth();
  return authStatus ? <Outlet /> : <Navigate to="/login" />;
}
