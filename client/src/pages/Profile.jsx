import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../contexts/authContext";
import apiClient from "@/utils/api";
import { removeAuthToken } from "@/utils/auth";
import Sidebar from "@/components/custom/Sidebar";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { HashLoader } from "react-spinners";
import { User, Mail, CreditCard, Crown } from "lucide-react";

export default function Profile() {
  const { authStatus, setauthStatus } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users/verify");
      setUser(res.data.data || {});
      setFormData({
        first_name: res.data.data?.first_name || "",
        last_name: res.data.data?.last_name || "",
        email: res.data.data?.email || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await apiClient.put("/users/updateProfile", formData);
      setUser(res.data.data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.get("/users/logout");
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      removeAuthToken();
      setauthStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: user.first_name || "",
                            last_name: user.last_name || "",
                            email: user.email || "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Account Status
                </CardTitle>
                <CardDescription>
                  View your account details and membership status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Credits</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{user.credits ?? 0}</p>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => (window.location.href = "/buy-credits")}
                    >
                      Buy More
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Membership</span>
                  </div>
                  <div className="text-right">
                    {user.isProMember ? (
                      <Badge variant="default" className="bg-yellow-500">
                        Pro Member
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="secondary">Free Plan</Badge>
                        <Button
                          variant="link"
                          className="h-auto p-0 block mt-1"
                          onClick={() => (window.location.href = "/upgrade")}
                        >
                          Upgrade to Pro
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Account Created</p>
                  <p className="text-sm font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
