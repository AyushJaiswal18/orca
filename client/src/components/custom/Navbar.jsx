import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-4 border-b">
      <div className="flex items-center">
        <LogInIcon className="w-12 h-12 text-primary" />
        <nav className="hidden ml-6 space-x-4 md:flex">
          <Link to="#" className="text-sm font-medium">
            Home
          </Link>
          <Link to="#" className="text-sm font-medium">
            Projects
          </Link>
          <Link to="#" className="text-sm font-medium">
            Tools
          </Link>
          <Link to="#" className="text-sm font-medium">
            Billing
          </Link>
          <Link to="#" className="text-sm font-medium">
            Support
          </Link>
          <Link to="#" className="text-sm font-medium ">
            Admin
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="#" className="text-sm font-medium ">
          My Organization
        </Link>
        <Button variant="ghost" size="icon">
          <UserIcon className="w-6 h-6" />
        </Button>
      </div>
    </header>
  );
}

function LogInIcon(props) {
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
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function UserIcon(props) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
