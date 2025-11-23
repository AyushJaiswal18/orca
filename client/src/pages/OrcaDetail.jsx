import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {Link} from "react-router-dom"
import { Progress } from "@/components/ui/progress"

export default function OrcaDetail() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <header className="bg-muted py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CloudIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Instance Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <DownloadIcon className="w-4 h-4" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <ShareIcon className="w-4 h-4" />
            Share
          </Button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Instance Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground text-sm">Region</div>
                <div>us-east-1</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Plan</div>
                <div>Standard</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground text-sm">CPU</div>
                <div>4 vCPUs</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Memory</div>
                <div>8GB</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground text-sm">Public IP</div>
                <div>
                  <Link to="#" className="text-primary underline" >
                    123.45.67.89
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Uptime</div>
                <div>45 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Instance Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground text-sm">Name</div>
                <div>my-instance-1</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>Running</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Services</div>
              <div>
                <ul className="grid gap-2">
                  <li>
                    <div className="flex items-center gap-2">
                      <ServerIcon className="w-4 h-4" />
                      <div>Nginx</div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="w-4 h-4" />
                      <div>PostgreSQL</div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <CodeIcon className="w-4 h-4" />
                      <div>Node.js</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <div className="text-muted-foreground text-sm">CPU Usage</div>
                  <Progress value={60} aria-label="CPU usage at 60%" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Memory Usage</div>
                  <Progress value={75} aria-label="Memory usage at 75%" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <div className="text-muted-foreground text-sm">Disk Usage</div>
                  <Progress value={40} aria-label="Disk usage at 40%" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Network Usage</div>
                  <Progress value={30} aria-label="Network usage at 30%" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Access Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground text-sm">Username</div>
                <div>myinstance</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Password</div>
                <div>s3cret123!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
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
  )
}


function CodeIcon(props) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
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
  )
}


function DownloadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
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
  )
}


function ShareIcon(props) {
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
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
  )
}