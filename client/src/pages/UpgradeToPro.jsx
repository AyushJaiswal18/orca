import Sidebar from "@/components/custom/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/utils/api";
import { useState, useEffect } from "react";
import { Crown, Check, Zap, Shield, Globe, Sparkles, ArrowRight } from "lucide-react";

const PRO_FEATURES = [
  {
    icon: Zap,
    title: "Faster Instance Launch",
    description: "Priority queue for faster container provisioning",
  },
  {
    icon: Shield,
    title: "Enhanced Security",
    description: "Advanced security features and encrypted connections",
  },
  {
    icon: Globe,
    title: "More Regions",
    description: "Access to premium regions with lower latency",
  },
  {
    icon: Sparkles,
    title: "Priority Support",
    description: "24/7 priority customer support and faster response times",
  },
  {
    icon: Crown,
    title: "Pro Badge",
    description: "Show your Pro status with an exclusive badge",
  },
  {
    icon: Check,
    title: "No Instance Limits",
    description: "Launch unlimited instances simultaneously",
  },
];

export default function UpgradeToPro() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post("/users/upgradeToPro");
      setUser(res.data.data);
      toast({
        title: "Congratulations!",
        description: "You've successfully upgraded to Orca Pro!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to upgrade to Pro",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.isProMember) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">You're a Pro Member!</CardTitle>
                <CardDescription>
                  Thank you for being a Pro member. Enjoy all the premium features!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="default" className="bg-yellow-500 text-lg px-4 py-2">
                  Pro Member
                </Badge>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Upgrade to Orca Pro</h1>
              <p className="text-xl text-muted-foreground">
                Unlock premium features and take your Orca experience to the next level
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Current plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">$0</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        Basic instance launch
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        Standard support
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        Limited regions
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-primary shadow-lg relative">
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-primary">Recommended</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Pro Plan
                  </CardTitle>
                  <CardDescription>Unlock all premium features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">$29.99</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Everything in Free
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Priority instance launch
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Premium support
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        All regions access
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Unlimited instances
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? "Processing..." : "Upgrade to Pro"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Pro Features</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRO_FEATURES.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* FAQ or Additional Info */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle>Why Upgrade to Pro?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Orca Pro gives you access to premium features that help you work faster and more
                  efficiently. With priority support, faster instance launches, and access to all
                  regions, you'll have everything you need to get the most out of Orca.
                </p>
                <Button
                  variant="outline"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? "Processing..." : "Upgrade Now"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
