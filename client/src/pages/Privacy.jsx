import { useAuth } from "@/contexts/authContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/custom/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Rocket } from "lucide-react";

export default function Privacy() {
  const { authStatus } = useAuth();
  const principles = [
    {
      icon: Lock,
      title: "Data Encryption",
      description: "All data in transit is encrypted using TLS 1.3. Container data is isolated and secure.",
    },
    {
      icon: Eye,
      title: "No Data Logging",
      description: "We don't log your browsing activity or store any personal data from your containers.",
    },
    {
      icon: Database,
      title: "Minimal Data Collection",
      description: "We only collect data necessary to provide and improve our services.",
    },
    {
      icon: Shield,
      title: "Your Control",
      description: "You can delete your account and all associated data at any time.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {!authStatus && (
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary-foreground" />
                </div>
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Privacy Policy</h1>
                  <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Our Commitment to Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  At Orca, we take your privacy seriously. This policy explains how we collect, use,
                  and protect your information when you use our service.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{principle.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      When you create an account, we collect your name, email address, and
                      password (encrypted). This information is used to manage your account and
                      provide customer support.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Usage Data</h3>
                    <p className="text-sm text-muted-foreground">
                      We collect information about how you use our service, including container
                      launch times, regions used, and service preferences. This helps us improve
                      our service and provide better support.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Container Data</h3>
                    <p className="text-sm text-muted-foreground">
                      We do NOT log, monitor, or store any data from within your containers. Your
                      container sessions are completely private and isolated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>To provide and maintain our service</li>
                  <li>To process payments and manage credits</li>
                  <li>To send you service-related notifications</li>
                  <li>To improve our service and develop new features</li>
                  <li>To respond to your support requests</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Encryption of data in transit (TLS 1.3)</li>
                  <li>Secure password storage using bcrypt</li>
                  <li>Regular security audits and updates</li>
                  <li>Isolated container environments</li>
                  <li>Access controls and authentication</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We use AWS for infrastructure hosting. AWS complies with industry-standard
                  security and privacy practices. We do not share your personal data with any other
                  third parties except as required by law.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies for authentication and session management. We do not use
                  tracking cookies or analytics cookies that collect personal information.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Questions about privacy?{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

