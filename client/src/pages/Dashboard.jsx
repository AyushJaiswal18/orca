import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InstanceTable from "@/components/custom/InstanceTable";
import { useEffect, useState } from "react";
import Sidebar from "@/components/custom/Sidebar";
import axios from "axios";
import { HashLoader } from "react-spinners";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    setLoading(true);
    getUser()
      .then((data) => {
        setUser(data.data);
        getInstances()
          .then((data) => {
            setInstances(data.data);
          })
          .catch((err) => {});
        setLoading(false);
      })
      .catch((err) => {});
  }, []);

  const refreshContent = async () => {
    setLoading(true);
    const res = await getInstances();
    setInstances(res.data);
    setLoading(false);
  };

  const getUser = async () => {
    const res = await axios.get("/users/cookieChecker");
    return res.data;
  };

  const getInstances = async () => {
    const res = await axios.get("/containers/getContainers");
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
                Hello, {user.first_name + " " + user.last_name}
              </h2>
              <div className="flex items-center space-x-2">
                <p className="mb-4 text-lg">
                  Start a new orca instance and get anonymous now !
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-md bg-secondary w-1/5 flex items-center justify-center">
              <h2 className="mb-2 text-2xl font-semibold">
                Credits Left : {user.credits}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <Input
                disabled
                type="search"
                placeholder="Search services by name, plan, and tags..."
                className="w-full max-w-lg"
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
            {instances.length === 0 ? (
              <h2 className="text-xl font-semibold text-center">
                No orca instances found
              </h2>
            ) : (
              <InstanceTable
                instances={instances}
                setInstances={setInstances}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
