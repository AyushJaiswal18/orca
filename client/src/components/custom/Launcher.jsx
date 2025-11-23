import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import ServiceCard from "@/components/custom/ServiceCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HashLoader } from "react-spinners";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Launcher() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");
  const [services, setServices] = useState([]);
  const [instanceName, setInstanceName] = useState("");
  const { toast } = useToast();
  const [region, setRegion] = useState("ap-south-1");

  useEffect(() => {
    setLoading(true);
    getServices()
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getServices = async () => {
    try {
      const ser = await axios.get("/services/getServices");
      return ser.data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Error Fetching Services",
        description: error.response.data.message,
      });
      navigate("/dashboard");
    }
  };

  const startInstance = async () => {
    setLoading(true);
    try {
      console.log(instanceName, selectedService, region);
      const res = await axios.post("/containers/startNew", {
        instanceName,
        selectedService,
        region,
      });
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Some error occured.",
        description: error.response.data.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />;
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold">Start a new Orca Instance</h1>
        <Button
          onClick={async () => {
            await startInstance();
          }}
        >
          Start Now
        </Button>
      </div>
      <header className="mb-6">
        <p>Select a service and start the instance now</p>
      </header>
      <main>
        <div className="flex items-center gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Service Name</h2>
            <div className="space-y-2 mb-4">
              <Input
                onChange={(e) => setInstanceName(e.target.value)}
                value={instanceName}
                placeholder="Enter service instance name"
                className="w-[300px]"
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Region</h2>
            <div className="space-y-2 mb-4">
              <Select
                value={region}
                onValueChange={(e) => {
                  setRegion(e);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ap-south-1">Mumbai</SelectItem>
                  <SelectItem value="us-east-1">N Virginia</SelectItem>
                  <SelectItem value="us-east-2">Ohio</SelectItem>
                  <SelectItem value="us-west-1">N California</SelectItem>
                  <SelectItem value="ap-northeast-2">Seoul</SelectItem>
                  <SelectItem value="ap-southeast-1">Singapore</SelectItem>
                  <SelectItem value="ca-central-1">Canada</SelectItem>
                  <SelectItem value="eu-west-2">London</SelectItem>
                  <SelectItem value="eu-west-3">Paris</SelectItem>
                  <SelectItem value="ap-northeast-3">Osaka</SelectItem>
                  <SelectItem value="us-west-2">Oregon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Select service</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              setSelectedService={setSelectedService}
              selectedService={selectedService}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
