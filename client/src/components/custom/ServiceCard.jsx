import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function ServiceCard({
  service,
  selectedService,
  setSelectedService,
}) {
  // Get appropriate icon based on service name
  const serviceIcon = useMemo(() => {
    const name = service.name.toLowerCase();
    
    if (name.includes("chrome")) {
      return <ChromeIcon className="w-10 h-10 mr-4 text-blue-500" />;
    }
    if (name.includes("vivaldi")) {
      return <VivaldiIcon className="w-10 h-10 mr-4 text-purple-500" />;
    }
    if (name.includes("firefox")) {
      return <FirefoxIcon className="w-10 h-10 mr-4 text-orange-500" />;
    }
    if (name.includes("browser") || name.includes("kasm")) {
      return <BrowserIcon className="w-10 h-10 mr-4 text-indigo-500" />;
    }
    
    // Default icon - use a random one for variety
    const defaultIcons = [
      <CloudIcon className="w-10 h-10 mr-4 text-indigo-500" />,
      <ServerIcon className="w-10 h-10 mr-4 text-gray-500" />,
      <DatabaseIcon className="w-10 h-10 mr-4 text-green-500" />,
    ];
    return defaultIcons[service.name.length % defaultIcons.length];
  }, [service.name]);

  const isBrowser = service.name.toLowerCase().includes("browser") || 
                    service.name.toLowerCase().includes("chrome") ||
                    service.name.toLowerCase().includes("vivaldi") ||
                    service.name.toLowerCase().includes("firefox");

  return (
    <Card
      className={`flex bg-secondary items-center p-4 cursor-pointer transition-transform duration-200 hover:scale-105 ${
        selectedService === service._id
          ? "bg-muted border-2 border-primary"
          : ""
      } ${isBrowser ? "border-l-4 border-l-blue-500" : ""}`}
      onClick={() => setSelectedService(service._id)}
    >
      {serviceIcon}
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{service.name}</h3>
          <div className="flex gap-2">
            {service.isNewlyAdded && (
              <Badge variant="secondary" className="bg-primary text-white">
                New
              </Badge>
            )}
            {isBrowser && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                Browser
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
        {service.cost && (
          <p className="text-xs text-muted-foreground mt-1">
            Cost: {service.cost} credits
          </p>
        )}
      </div>
    </Card>
  );
}

function CloudIcon(props) {
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
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function DatabaseIcon(props) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function GitGraphIcon(props) {
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
      <circle cx="5" cy="6" r="3" />
      <path d="M5 9v6" />
      <circle cx="5" cy="18" r="3" />
      <path d="M12 3v18" />
      <circle cx="19" cy="6" r="3" />
      <path d="M16 15.7A9 9 0 0 0 19 9" />
    </svg>
  );
}

function KeyIcon(props) {
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
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

function MemoryStickIcon(props) {
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
      <path d="M6 19v-3" />
      <path d="M10 19v-3" />
      <path d="M14 19v-3" />
      <path d="M18 19v-3" />
      <path d="M8 11V9" />
      <path d="M16 11V9" />
      <path d="M12 11V9" />
      <path d="M2 15h20" />
      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z" />
    </svg>
  );
}

function MonitorDotIcon(props) {
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
      <circle cx="19" cy="6" r="3" />
      <path d="M22 12v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

function SearchIcon(props) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ServerIcon(props) {
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
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  );
}

function TwitchIcon(props) {
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
      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
    </svg>
  );
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
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
