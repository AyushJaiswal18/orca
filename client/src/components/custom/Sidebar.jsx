import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { LayoutDashboard, Rocket, CreditCard, User, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/utils/api";
import OrcaLogo from "./OrcaLogo";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/users/verify");
      setUser(res.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/launch-new-orca",
      label: "Orca Services",
      icon: Rocket,
    },
    {
      to: "/buy-credits",
      label: "Buy Credits",
      icon: CreditCard,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-64 p-4 border-r bg-secondary h-screen flex flex-col justify-between sticky top-0">
      <div>
        <div className="flex justify-between items-center px-4 mb-4">
          <h1 className="text-xl font-extrabold">Orca Console</h1>
          <OrcaLogo className="w-8 h-8" width={32} height={21.33} />
        </div>
        <hr className="my-3 border-border" />
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 text-base font-medium rounded-md transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto">
        {user?.isProMember ? (
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Pro Member</CardTitle>
              </div>
              <CardDescription className="text-xs">
                You're enjoying all Pro features
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="mb-2 text-base">Upgrade to Pro</CardTitle>
              <CardDescription className="text-xs">
                Unlock all features and get unlimited access to our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  navigate("/upgrade");
                }}
                size="sm"
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
}

