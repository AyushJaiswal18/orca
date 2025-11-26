import { useAuth } from "@/contexts/authContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/custom/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Users, Target, Zap, Shield, Globe } from "lucide-react";
import OrcaLogo from "@/components/custom/OrcaLogo";

export default function About() {
  const { authStatus } = useAuth();
  const values = [
    {
      icon: Zap,
      title: "Speed",
      description: "We believe in instant deployment. Your time is valuable, and we respect that.",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Privacy and security are not optional. Every container is isolated and encrypted.",
    },
    {
      icon: Globe,
      title: "Global",
      description: "Deploy anywhere, anytime. Our infrastructure spans 11+ AWS regions worldwide.",
    },
    {
      icon: Target,
      title: "Reliability",
      description: "99.9% uptime guarantee. Your services should be available when you need them.",
    },
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">About Orca</h1>
              <p className="text-xl text-muted-foreground">
                Empowering developers with instant, secure containerized services
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Orca was born from a simple idea: deploying containerized services should be
                    as easy as running a command. We've built a platform that abstracts away the
                    complexity of cloud infrastructure, allowing developers to focus on what they
                    do best—building amazing applications.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Built on AWS infrastructure, Orca provides secure, scalable browser
                    environments across multiple regions. Whether you're testing, developing, or
                    running production workloads, Orca gives you the tools you need without the
                    operational overhead.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Our Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {values.map((value, index) => {
                      const Icon = value.icon;
                      return (
                        <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold">{value.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What We Offer</CardTitle>
                  <CardDescription>
                    Everything you need to deploy and manage containerized services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong className="text-foreground">Multi-Region Deployment:</strong> Launch
                        containers in 11+ AWS regions for optimal performance and redundancy
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong className="text-foreground">Instant Launch:</strong> Get your
                        containers running in under 3 seconds with zero configuration
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong className="text-foreground">Secure & Isolated:</strong> Each
                        container runs in its own isolated environment with encrypted connections
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong className="text-foreground">Developer-First:</strong> Simple API,
                        intuitive dashboard, and comprehensive documentation
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong className="text-foreground">Cost-Effective:</strong> Pay only for
                        what you use with transparent pricing and 50 free credits to get started
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Infrastructure</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• AWS ECS Fargate</li>
                        <li>• AWS VPC</li>
                        <li>• Multi-Region Support</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Security</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Encrypted Connections</li>
                        <li>• Isolated Containers</li>
                        <li>• IAM Role-Based Access</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Monitoring</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• CloudWatch Logs</li>
                        <li>• Real-Time Status</li>
                        <li>• Health Checks</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

