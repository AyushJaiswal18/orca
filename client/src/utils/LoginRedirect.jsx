import { useAuth } from "@/contexts/authContext";
import { Outlet, Navigate } from "react-router-dom";

export default function LoginRedirect() {
  const { authStatus } = useAuth;
  return authStatus ? <Navigate to="/profile" /> : <Outlet />;
}
