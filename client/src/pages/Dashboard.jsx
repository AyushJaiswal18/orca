import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InstanceTable from "@/components/custom/InstanceTable";
import { useEffect, useState } from "react";
import Sidebar from "@/components/custom/Sidebar";
import apiClient from "@/utils/api";
import { HashLoader } from "react-spinners";

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
    setLoading(true);
    const res = await getInstances();
    setInstances(res.data);
    setLoading(false);
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
  const filteredInstances = instances.filter((instance) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
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
            <h1 className="text-3xl font-bold">Services</h1>
            <Button
              onClick={() => {
                navigate("/launch-new-orca");
              }}
            >
              Start an Orca Instance
            </Button>
          </div>
          <div className="flex justify-between">
            <div className="mr-3 w-1/3">
              <h2 className="mb-4 text-3xl font-semibold">
                Hello, {user?.first_name || ""} {user?.last_name || ""}
              </h2>
              <div className="flex items-center space-x-2">
                <p className="mb-4 text-lg">
                  Start a new orca instance and get anonymous now !
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-md bg-secondary w-1/5 flex items-center justify-center">
              <h2 className="mb-2 text-2xl font-semibold">
                Credits Left : {user?.credits ?? 0}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Input
                type="search"
                placeholder="Search services by name, plan, region, status..."
                className="w-full max-w-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                onClick={refreshContent}
                variant="outline"
                className="ml-4"
              >
                Refresh
              </Button>
            </div>
            <div className="flex items-center mb-4">
              <Switch disabled checked id="alerts" />
              <Label htmlFor="alerts" className="ml-2 text-sm">
                Show only services with alerts
              </Label>
            </div>
            {filteredInstances.length === 0 ? (
              <h2 className="text-xl font-semibold text-center">
                {searchQuery.trim() 
                  ? "No instances match your search" 
                  : "No orca instances found"}
              </h2>
            ) : (
              <InstanceTable
                instances={filteredInstances}
                setInstances={setInstances}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
