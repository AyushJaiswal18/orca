import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DialogBox from "./DialogBox";

export default function ActiveInstanceRow({ instance, setInstances }) {
  return (
    <TableRow>
      <TableCell className="flex flex-col items-start space-x-2">
        <div className="flex items-center space-x-2">
          <DatabaseIcon className="w-8 h-8 text-red-500" />
          <span className="text-sm font-medium">{instance.service.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{instance.name}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm">{instance.plan}</span>
        <br />
        <span className="text-xs text-gray-500">
          {instance.specs ? instance.specs : "2 CPU / 1 GB RAM"}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="success">{instance.status}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">{instance.createdAt}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {instance.status === "RUNNING" && (
            <a
              className="rounded bg-primary p-2 text-white"
              href={instance.url}
              target="_blank"
            >
              Launch
            </a>
          )}
          {instance.status != "PROVISIONING" ? (
            <DialogBox
              setInstances={setInstances}
              disabled={false}
              instance={instance}
            />
          ) : (
            <DialogBox
              setInstances={setInstances}
              disabled={true}
              instance={instance}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function FilePenIcon(props) {
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
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}

function PowerIcon(props) {
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
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
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
