import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  Shield,
  Zap,
  Globe,
  Crown,
  Check,
  ArrowRight,
  Server,
  Lock,
  Clock,
  Play,
  Code,
  Terminal,
  Github,
  Twitter,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const observers = Object.keys(sectionRefs.current).map((key) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [key]: true }));
            }
          });
        },
        { threshold: 0.1 }
      );

      if (sectionRefs.current[key]) {
        observer.observe(sectionRefs.current[key]);
      }

      return observer;
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform hover:scale-110 duration-300">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Orca</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="transition-all duration-200 hover:scale-105">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="transition-all duration-200 hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 transition-all duration-700 ${
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Now with Pro Features</span>
          </div>
          <h1
            ref={(el) => (sectionRefs.current.hero = el)}
            className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 delay-100 ${
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Launch Containerized Services
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>
          <p
            className={`text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Deploy secure, scalable browser environments across multiple AWS regions.
            Experience the power of cloud infrastructure with zero configuration.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
          </div>
          <div
            className={`mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-700 delay-400 ${
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>50 free credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section
        ref={(el) => (sectionRefs.current.demo = el)}
        className={`container mx-auto px-4 py-20 transition-all duration-700 ${
          isVisible.demo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-3xl animate-pulse"></div>
            <Card className="relative border-2 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-muted rounded px-4 py-2 text-sm font-mono text-muted-foreground">
                      orca.console.io
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6 border">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-primary animate-pulse" />
                        <span className="font-mono text-sm">$ orca launch --region us-east-1</span>
                      </div>
                      <div className="pl-8 space-y-2 text-sm text-muted-foreground">
                        <p className="animate-fade-in">✓ Provisioning container...</p>
                        <p className="animate-fade-in delay-200">✓ Allocating resources...</p>
                        <p className="text-primary animate-fade-in delay-400">
                          ✓ Container ready at https://54.123.45.67:6901
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg transition-all duration-300 hover:bg-muted/50 hover:scale-105">
                      <div className="text-2xl font-bold text-primary">2.3s</div>
                      <div className="text-xs text-muted-foreground mt-1">Launch Time</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg transition-all duration-300 hover:bg-muted/50 hover:scale-105">
                      <div className="text-2xl font-bold text-primary">11</div>
                      <div className="text-xs text-muted-foreground mt-1">Regions</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg transition-all duration-300 hover:bg-muted/50 hover:scale-105">
                      <div className="text-2xl font-bold text-primary">99.9%</div>
                      <div className="text-xs text-muted-foreground mt-1">Uptime</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={(el) => (sectionRefs.current.how = el)}
        className={`container mx-auto px-4 py-20 transition-all duration-700 ${
          isVisible.how ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: 1,
                icon: Code,
                title: "Choose Your Service",
                desc: "Select from Chrome, Vivaldi, or other browser environments. Pick your region and plan.",
              },
              {
                num: 2,
                icon: Zap,
                title: "Instant Launch",
                desc: "Your container spins up in seconds. We handle all the infrastructure complexity for you.",
              },
              {
                num: 3,
                icon: Play,
                title: "Start Working",
                desc: "Access your isolated browser environment immediately. No setup, no configuration needed.",
              },
            ].map((step, index) => (
              <div
                key={step.num}
                className="relative transition-all duration-500 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold transition-transform hover:scale-110">
                  {step.num}
                </div>
                <Card className="pt-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <step.icon className="w-10 h-10 text-primary mb-4 transition-transform hover:scale-110" />
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={(el) => (sectionRefs.current.stats = el)}
        className={`container mx-auto px-4 py-20 transition-all duration-700 ${
          isVisible.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "11+", label: "AWS Regions" },
              { value: "<3s", label: "Launch Time" },
              { value: "24/7", label: "Support" },
              { value: "50", label: "Free Credits" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center transition-all duration-300 hover:scale-110"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={(el) => (sectionRefs.current.cta = el)}
        className={`container mx-auto px-4 py-20 transition-all duration-700 ${
          isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join developers and teams who use Orca for secure, scalable container deployments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="text-lg px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Improved Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform hover:scale-110 duration-300">
                  <Rocket className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">Orca</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Launch containerized services with ease. Built on AWS infrastructure for
                developers who value speed and reliability.
              </p>
              <div className="flex gap-4 pt-2">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-3">
                {[
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/launch-new-orca", label: "Services" },
                  { to: "/buy-credits", label: "Pricing" },
                  { to: "/upgrade", label: "Pro Features" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
              <ul className="space-y-3">
                {[
                  { to: "/documentation", label: "Documentation" },
                  { href: "#", label: "API Reference" },
                  { href: "#", label: "Guides" },
                  { href: "#", label: "Status Page" },
                ].map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-3">
                {[
                  { to: "/login", label: "Sign In" },
                  { to: "/signup", label: "Sign Up" },
                  { to: "/about", label: "About" },
                  { to: "/contact", label: "Contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Orca. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
