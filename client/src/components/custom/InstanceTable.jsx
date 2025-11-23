import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import ActiveInstanceRow from "@/components/custom/ActiveInstanceRow";

export default function InstanceTable({ instances, setInstances }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/6">Service</TableHead>
          <TableHead className="w-1/4">Name</TableHead>
          <TableHead className="w-1/4">Plan</TableHead>
          <TableHead className="w-1/6">Status</TableHead>
          <TableHead className="w-1/5">Created</TableHead>
          <TableHead className="w-1/4">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {instances.map((instance) => (
          <ActiveInstanceRow
            key={instance.name}
            instances={instances}
            setInstances={setInstances}
            instance={instance}
          />
        ))}
      </TableBody>
    </Table>
  );
}
