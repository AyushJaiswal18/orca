import { useAuth } from "@/contexts/authContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/custom/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Rocket } from "lucide-react";
import OrcaLogo from "@/components/custom/OrcaLogo";

export default function Terms() {
  const { authStatus } = useAuth();
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Terms of Service</h1>
                  <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using Orca, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do
                  not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily use Orca for personal and commercial
                  purposes. This is the grant of a license, not a transfer of title, and under this
                  license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without explicit permission</li>
                  <li>Attempt to reverse engineer any software contained in Orca</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>3. Service Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to
                  our services. We reserve the right to modify, suspend, or discontinue any part of
                  the service at any time with or without notice.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>4. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Ensuring your use of the service complies with applicable laws</li>
                  <li>Not using the service for illegal or unauthorized purposes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>5. Payment and Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Credits are non-refundable and expire according to our credit policy. All prices
                  are in USD and subject to change with notice. You are responsible for any taxes
                  applicable to your use of the service.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Orca shall not be liable for any indirect, incidental, special, consequential, or
                  punitive damages resulting from your use or inability to use the service.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>7. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Your continued use of
                  the service after any changes constitutes acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Questions about these terms?{" "}
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

