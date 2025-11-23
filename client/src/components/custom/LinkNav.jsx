import { Link } from "react-router-dom";
export default function LinkNav() {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="#" className="hover:underline">
        My Organization
      </Link>{" "}
      /{" "}
      <Link to="#" className="hover:underline">
        Projects{" "}
      </Link>
      / <span>Select a service</span>
    </nav>
  );
}
