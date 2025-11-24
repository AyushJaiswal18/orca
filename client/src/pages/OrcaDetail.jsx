import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HashLoader } from "react-spinners";
import apiClient from "@/utils/api";
import Sidebar from "@/components/custom/Sidebar";
import { useToast } from "@/components/ui/use-toast";
import {
  Cloud,
  Server,
  Globe,
  Clock,
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

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

export default function OrcaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [container, setContainer] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContainer();
  }, [id]);

  const fetchContainer = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/containers/getContainer/${id}`);
      setContainer(res.data.data);
    } catch (error) {
      console.error("Error fetching container:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load instance details",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      RUNNING: { variant: "default", className: "bg-green-500", icon: CheckCircle2 },
      STOPPED: { variant: "destructive", className: "", icon: XCircle },
      PROVISIONING: { variant: "secondary", className: "bg-yellow-500", icon: Loader2 },
      PENDING: { variant: "secondary", className: "bg-blue-500", icon: Loader2 },
      DEPROVISIONING: { variant: "secondary", className: "bg-orange-500", icon: Loader2 },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1.5`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Instance not found</p>
                <Button onClick={() => navigate("/dashboard")} className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const instanceUrl = container.url ? `http://${container.url}:6901` : null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{container.name}</h1>
                <p className="text-muted-foreground">
                  Instance Details
                </p>
              </div>
            </div>
            {getStatusBadge(container.status)}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Instance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Region</div>
                    <div className="font-medium">
                      {REGION_NAMES[container.region] || container.region}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {container.region}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Plan</div>
                    <div className="font-medium">{container.plan || "Free Plan"}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Service</div>
                    <div className="font-medium">
                      {container.service?.name || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Specs</div>
                    <div className="font-medium">{container.specs || "1 CPU / 1 GB RAM"}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Public IP</div>
                    {container.url ? (
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {container.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(container.url, "IP address")}
                        >
                          {copied ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">Not available</div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Created</div>
                    <div className="font-medium text-sm">
                      {formatDate(container.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Instance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Name</div>
                    <div className="font-medium">{container.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Task ARN</div>
                    <div className="font-mono text-xs break-all">
                      {container.taskArn || "N/A"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-2">Service Details</div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{container.service?.name || "Unknown Service"}</div>
                        {container.service?.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {container.service.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Access Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {instanceUrl ? (
                  <>
                    <div>
                      <div className="text-muted-foreground text-sm mb-2">Instance URL</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-muted px-3 py-2 rounded break-all">
                          {instanceUrl}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(instanceUrl, "Instance URL")}
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium mb-1">KasmWeb Credentials</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Username: <code className="bg-background px-1 rounded">kasm_user</code></div>
                        <div>Password: <code className="bg-background px-1 rounded">password</code></div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (instanceUrl) {
                          window.open(instanceUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      disabled={!instanceUrl || container.status !== "RUNNING"}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Instance
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground text-sm">
                      Instance URL will be available once the instance is running
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Created At</div>
                  <div className="font-medium">{formatDate(container.createdAt)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Last Updated</div>
                  <div className="font-medium">{formatDate(container.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
