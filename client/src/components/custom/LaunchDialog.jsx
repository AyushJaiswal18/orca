import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function LaunchDialog({ instance, open, onOpenChange }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // KasmWeb default credentials
  const username = "kasm_user";
  const password = "password"; // This matches the VNC_PW we set in task definitions

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    if (instance.url) {
      // instance.url is already in format "https://ip:6901" from backend
      window.open(instance.url, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Launch Instance</DialogTitle>
          <DialogDescription>
            Use these credentials to access your KasmWeb instance
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <Input
                id="username"
                value={username}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(username, "Username")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex items-center gap-2">
              <Input
                id="password"
                type="password"
                value={password}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password, "Password")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Instance URL:</p>
            <p className="text-muted-foreground break-all">
              {instance.url || "Not available"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleLaunch}
            disabled={!instance.url}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Launch Instance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

