import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/custom/Login";
import Signup from "./components/custom/SignUp";
import { useAuth } from "./contexts/authContext";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Profile from "./pages/Profile";
import apiClient from "./utils/api";
import { getAuthToken, removeAuthToken } from "./utils/auth";
import Dashboard from "./pages/Dashboard";
import LauncherPage from "./pages/LauncherPage";
import BuyCreditsPage from "./pages/BuyCreditsPage";
import OrcaDetail from "./pages/OrcaDetail";
import { HashLoader } from "react-spinners";
import UpgradeToPro from "./pages/UpgradeToPro";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { authStatus, setauthStatus } = useAuth();
  useEffect(() => {
    setLoading(true);
    checkAuthStatus()
      .then((data) => {
        setauthStatus(true);
        // If authenticated and on a public route, redirect to dashboard
        const publicRoutes = ["/", "/login", "/signup", "/about", "/documentation", "/contact", "/terms", "/privacy"];
        if (publicRoutes.includes(window.location.pathname)) {
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        removeAuthToken();
        setauthStatus(false);
        // If not authenticated and on a protected route, redirect to landing page
        const publicRoutes = ["/", "/login", "/signup", "/about", "/documentation", "/contact", "/terms", "/privacy"];
        if (!publicRoutes.includes(window.location.pathname)) {
          navigate("/");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const checkAuthStatus = async () => {
    // Check if token exists first
    const token = getAuthToken();
    if (!token) {
      throw new Error("No token found");
    }
    
    // Verify token with backend
    const res = await apiClient.get("/users/verify");
    return res.data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
