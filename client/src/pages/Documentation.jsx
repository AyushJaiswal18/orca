import { useAuth } from "@/contexts/authContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/custom/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Book,
  Code,
  Terminal,
  Rocket,
  Shield,
  Globe,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import OrcaLogo from "@/components/custom/OrcaLogo";

export default function Documentation() {
  const { authStatus } = useAuth();
  const sections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Quick start guide to launch your first container",
      topics: [
        "Creating an account",
        "Launching your first instance",
        "Understanding credits",
        "Basic navigation",
      ],
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation for developers",
      topics: [
        "Authentication",
        "Container endpoints",
        "Webhooks",
        "Error handling",
      ],
    },
    {
      icon: Terminal,
      title: "CLI Tools",
      description: "Command-line interface for power users",
      topics: [
        "Installation",
        "Configuration",
        "Common commands",
        "Advanced usage",
      ],
    },
    {
      icon: Shield,
      title: "Security",
      description: "Security best practices and guidelines",
      topics: [
        "Authentication",
        "Data encryption",
        "Network security",
        "Compliance",
      ],
    },
    {
      icon: Globe,
      title: "Regions",
      description: "Understanding multi-region deployment",
      topics: [
        "Available regions",
        "Region selection",
        "Latency optimization",
        "Failover strategies",
      ],
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Advanced configuration options",
      topics: [
        "Environment variables",
        "Resource limits",
        "Networking",
        "Monitoring setup",
      ],
    },
  ];

  const quickLinks = [
    { title: "API Documentation", href: "#", icon: Code },
    { title: "Status Page", href: "#", icon: HelpCircle },
    { title: "GitHub Repository", href: "#", icon: ExternalLink },
    { title: "Community Forum", href: "#", icon: ExternalLink },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {!authStatus && (
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <OrcaLogo className="w-10 h-10" width={40} height={26.67} />
                <span className="text-2xl font-bold">Orca</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div className="flex flex-1">
        {authStatus && <Sidebar />}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Documentation</h1>
                  <p className="text-muted-foreground">Everything you need to get started with Orca</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card
                    key={index}
                    className="hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ChevronRight className="w-4 h-4 text-primary" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <Button variant="ghost" className="w-full mt-4" size="sm">
                        Read More
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Popular resources and external links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={index}
                        href={link.href}
                        className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 hover:bg-accent transition-all duration-200"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{link.title}</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Can't find what you're looking for?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Contact Support
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full sm:w-auto">
                    View Status Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

