import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/utils/api";
import { useState, useEffect } from "react";
import { CreditCard, Check, Sparkles } from "lucide-react";

const CREDIT_PACKAGES = [
  { id: 1, credits: 100, price: 9.99, bonus: 0, popular: false },
  { id: 2, credits: 250, price: 19.99, bonus: 25, popular: true },
  { id: 3, credits: 500, price: 34.99, bonus: 75, popular: false },
  { id: 4, credits: 1000, price: 59.99, bonus: 200, popular: false },
];

export default function BuyCredits() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const res = await apiClient.get("/users/verify");
      setUserCredits(res.data.data?.credits ?? 0);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const handlePurchase = async (packageId) => {
    const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const totalCredits = selectedPackage.credits + selectedPackage.bonus;
      const res = await apiClient.post("/users/buyCredits", {
        amount: totalCredits,
      });

      setUserCredits(res.data.data?.credits ?? 0);
      toast({
        title: "Success!",
        description: `You've received ${totalCredits} credits! ${selectedPackage.bonus > 0 ? `(${selectedPackage.bonus} bonus)` : ""}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to purchase credits",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Buy Orca Credits</h1>
          <p className="text-muted-foreground mt-2">
            Purchase credits to launch and manage your Orca instances
          </p>
        </div>
        <div className="flex items-center gap-2 p-4 border rounded-lg bg-secondary">
          <CreditCard className="w-5 h-5" />
          <div>
            <p className="text-sm text-muted-foreground">Current Credits</p>
            <p className="text-2xl font-bold">{userCredits}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CREDIT_PACKAGES.map((pkg) => {
          const totalCredits = pkg.credits + pkg.bonus;
          return (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? "border-primary shadow-lg" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {pkg.credits} Credits
                </CardTitle>
                <CardDescription>
                  {pkg.bonus > 0 && (
                    <span className="text-primary font-medium">
                      +{pkg.bonus} bonus credits
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold">${pkg.price}</p>
                  <p className="text-sm text-muted-foreground">
                    ${(pkg.price / totalCredits).toFixed(3)} per credit
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{pkg.credits} base credits</span>
                  </li>
                  {pkg.bonus > 0 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{pkg.bonus} bonus credits</span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Total: {totalCredits} credits</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading ? "Processing..." : "Purchase"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How Credits Work</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Credits are used to launch and maintain Orca instances</li>
          <li>• Each instance consumes credits based on its plan and runtime</li>
          <li>• Credits never expire - use them whenever you need</li>
          <li>• Bonus credits are included with select packages</li>
        </ul>
      </div>
    </div>
  );
}
