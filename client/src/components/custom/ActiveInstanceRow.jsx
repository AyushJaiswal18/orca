import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DialogBox from "./DialogBox";
import LaunchDialog from "./LaunchDialog";
import { Globe, Clock } from "lucide-react";
import { useMemo, useState } from "react";

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

// Get appropriate service icon based on service name
function getServiceIcon(serviceName) {
  const name = serviceName?.toLowerCase() || "";
  
  if (name.includes("chrome")) {
    return <ChromeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  }
  if (name.includes("vivaldi")) {
    return <VivaldiIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />;
  }
  if (name.includes("firefox")) {
    return <FirefoxIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />;
  }
  if (name.includes("browser") || name.includes("kasm")) {
    return <BrowserIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
  }
  
  // Default browser icon
  return <BrowserIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
}

// Format timestamp to readable format
function formatTimestamp(timestamp) {
  if (!timestamp) return <span className="text-sm text-muted-foreground">N/A</span>;
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time
    let relativeTime = "";
    if (diffMins < 1) {
      relativeTime = "Just now";
    } else if (diffMins < 60) {
      relativeTime = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays}d ago`;
    } else {
      relativeTime = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }

    return (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">{relativeTime}</span>
      </div>
    );
  } catch (error) {
    return <span className="text-sm text-muted-foreground">Invalid</span>;
  }
}

// Format region display
function formatRegion(region) {
  if (!region) return <span className="text-sm text-muted-foreground">N/A</span>;
  
  const regionName = REGION_NAMES[region] || region;
  return (
    <div className="flex items-center gap-1.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-sm">{regionName}</span>
    </div>
  );
}

export default function ActiveInstanceRow({ instance, setInstances }) {
  const serviceIcon = useMemo(() => getServiceIcon(instance.service?.name), [instance.service?.name]);
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          {serviceIcon}
          <span className="text-sm font-medium truncate">{instance.service?.name || "Unknown"}</span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <span className="text-sm truncate">{instance.name}</span>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{instance.plan}</span>
          <span className="text-xs text-muted-foreground">
            {instance.specs ? instance.specs : "2 CPU / 1 GB RAM"}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant="success" className="text-xs">{instance.status}</Badge>
      </TableCell>
      <TableCell className="py-3">
        {formatRegion(instance.region)}
      </TableCell>
      <TableCell className="py-3">
        {formatTimestamp(instance.createdAt)}
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {instance.status === "RUNNING" && instance.url && (
            <>
              <Button
                onClick={() => setLaunchDialogOpen(true)}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Launch
              </Button>
              <LaunchDialog
                instance={instance}
                open={launchDialogOpen}
                onOpenChange={setLaunchDialogOpen}
              />
            </>
          )}
          {instance.status != "PROVISIONING" ? (
            <DialogBox
              setInstances={setInstances}
              disabled={false}
              instance={instance}
            />
          ) : (
            <DialogBox
              setInstances={setInstances}
              disabled={true}
              instance={instance}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// Browser-specific icons
function ChromeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.627 5.373 12 12 12 4.41 0 8.21-2.381 10.269-5.919l-5.111-8.86A5.45 5.45 0 0 1 12 17.455H1.931z" />
    </svg>
  );
}

function VivaldiIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894c-1.789 1.789-4.105 2.894-6.894 2.894s-5.105-1.105-6.894-2.894C2.105 15.105 1 12.789 1 10s1.105-5.105 2.894-6.894C5.683 1.316 7.999.211 10.788.211c2.789 0 5.105 1.105 6.894 2.894C19.473 4.895 20.577 7.211 20.577 10s-1.104 5.105-2.683 6.894z" />
    </svg>
  );
}

function FirefoxIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.315.063-.441.188l-1.701 1.701c-.125.126-.272.189-.441.189-.169 0-.315-.063-.441-.189l-1.701-1.701c-.126-.125-.272-.188-.441-.188s-.315.063-.441.188l-1.701 1.701c-.126.126-.272.189-.441.189-.169 0-.315-.063-.441-.189L6.873 8.348c-.126-.125-.272-.188-.441-.188s-.315.063-.441.188c-.125.126-.188.272-.188.441s.063.315.188.441l1.701 1.701c.126.126.272.189.441.189.169 0 .315-.063.441-.189l1.701-1.701c.126-.125.272-.188.441-.188s.315.063.441.188l1.701 1.701c.126.126.272.189.441.189.169 0 .315-.063.441-.189l1.701-1.701c.126-.125.272-.188.441-.188s.315.063.441.188c.125.126.188.272.188.441s-.063.315-.188.441l-1.701 1.701c-.126.126-.272.189-.441.189-.169 0-.315-.063-.441-.189l-1.701-1.701c-.126-.125-.272-.188-.441-.188z" />
    </svg>
  );
}

function BrowserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <path d="M6 6h.01M10 6h.01" />
    </svg>
  );
}
