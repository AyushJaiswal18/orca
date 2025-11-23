import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/custom/Login";
import Signup from "./components/custom/SignUp";
import { useAuth } from "./contexts/authContext";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Profile from "./pages/Profile";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import LauncherPage from "./pages/LauncherPage";
import BuyCreditsPage from "./pages/BuyCreditsPage";
import OrcaDetail from "./pages/OrcaDetail";
import { HashLoader } from "react-spinners";
import UpgradeToPro from "./pages/UpgradeToPro";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { authStatus, setauthStatus } = useAuth();
  useEffect(() => {
    setLoading(true);
    checkAuthStatus()
      .then((data) => {
        setauthStatus(true);
        navigate("/dashboard");
      })
      .catch((err) => {
        setauthStatus(false);
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const checkAuthStatus = async () => {
    const res = await axios.get("/users/cookieChecker");
    return res.data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />;
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buy-credits" element={<BuyCreditsPage />} />
        <Route path="/launch-new-orca" element={<LauncherPage />} />
        <Route path="/orca-details/:id" element={<OrcaDetail />} />
        <Route path="/upgrade" element={<UpgradeToPro />} />
      </Route>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
