import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InstanceTable from "@/components/custom/InstanceTable";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/custom/Sidebar";
import apiClient from "@/utils/api";
import { HashLoader } from "react-spinners";
import {
  Rocket,
  Search,
  RefreshCw,
  Plus,
  Server,
  CreditCard,
  Crown,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

// Region display names mapping
const REGION_NAMES = {
  "ap-south-1": "Mumbai",
  "us-east-1": "N Virginia",
  "us-east-2": "Ohio",
  "us-west-1": "N California",
  "ap-northeast-2": "Seoul",
  "ap-southeast-1": "Singapore",
  "ca-central-1": "Canada",
  "eu-west-2": "London",
  "eu-west-3": "Paris",
  "ap-northeast-3": "Osaka",
  "us-west-2": "Oregon",
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [instances, setInstances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    setLoading(true);
    getUser()
      .then((data) => {
        setUser(data.data || {});
        getInstances()
          .then((data) => {
            setInstances(data.data || []);
          })
          .catch((err) => {
            console.error("Error fetching instances:", err);
            setInstances([]);
          });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setUser({});
        setLoading(false);
      });
  }, []);

  const refreshContent = async () => {
    try {
      setRefreshing(true);
      const res = await getInstances();
      setInstances(res.data);
      // Also refresh user data to get updated credits
      const userRes = await getUser();
      setUser(userRes.data || {});
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const getUser = async () => {
    const res = await apiClient.get("/users/verify");
    return res.data;
  };

  const getInstances = async () => {
    const res = await apiClient.get("/containers/getContainers");
    return res.data;
  };

  // Filter instances based on search query
  const filteredInstances = useMemo(() => {
    if (!searchQuery.trim()) return instances;
    
    const query = searchQuery.toLowerCase();
    return instances.filter((instance) => {
      const serviceName = instance.service?.name?.toLowerCase() || "";
      const instanceName = instance.name?.toLowerCase() || "";
      const plan = instance.plan?.toLowerCase() || "";
      const status = instance.status?.toLowerCase() || "";
      const region = instance.region?.toLowerCase() || "";
      const regionName = REGION_NAMES[instance.region]?.toLowerCase() || "";
      
      return (
        serviceName.includes(query) ||
        instanceName.includes(query) ||
        plan.includes(query) ||
        status.includes(query) ||
        region.includes(query) ||
        regionName.includes(query)
      );
    });
  }, [instances, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const running = instances.filter((i) => i.status === "RUNNING").length;
    const stopped = instances.filter((i) => i.status === "STOPPED").length;
    const provisioning = instances.filter((i) => i.status === "PROVISIONING").length;
    
    return {
      total: instances.length,
      running,
      stopped,
      provisioning,
    };
  }, [instances]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, {user?.first_name || "User"}!
              </h1>
              <p className="text-muted-foreground">
                Manage your containerized services and instances
              </p>
            </div>
            <Button
              onClick={() => navigate("/launch-new-orca")}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Launch New Instance
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Instances
                </CardTitle>
                <Server className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.running} running
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Running
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.running}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active containers
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Credits
                </CardTitle>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.credits ?? 0}</div>
                <Link
                  to="/buy-credits"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  Buy more credits →
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Membership
                </CardTitle>
                <Crown className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {user?.isProMember ? (
                  <>
                    <Badge variant="default" className="bg-yellow-500 mb-2">
                      Pro Member
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      All features unlocked
                    </p>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="mb-2">Free Plan</Badge>
                    <Link
                      to="/upgrade"
                      className="text-xs text-primary hover:underline block"
                    >
                      Upgrade to Pro →
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts/Status Section */}
          {stats.provisioning > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {stats.provisioning} instance{stats.provisioning > 1 ? "s" : ""} {stats.provisioning > 1 ? "are" : "is"} provisioning
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your instances will be ready shortly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instances Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Your Instances</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredInstances.length === instances.length
                    ? `${instances.length} total instance${instances.length !== 1 ? "s" : ""}`
                    : `Showing ${filteredInstances.length} of ${instances.length} instances`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search instances..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={refreshContent}
                  variant="outline"
                  size="icon"
                  title="Refresh"
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {filteredInstances.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Server className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery.trim()
                      ? "No instances match your search"
                      : "No instances yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {searchQuery.trim()
                      ? "Try adjusting your search terms"
                      : "Get started by launching your first containerized service"}
                  </p>
                  {!searchQuery.trim() && (
                    <Button
                      onClick={() => navigate("/launch-new-orca")}
                      className="gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Launch Your First Instance
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border bg-card">
                <InstanceTable
                  instances={filteredInstances}
                  setInstances={setInstances}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
