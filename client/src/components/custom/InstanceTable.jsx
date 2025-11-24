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
          <TableHead className="min-w-[140px]">Service</TableHead>
          <TableHead className="min-w-[120px]">Name</TableHead>
          <TableHead className="min-w-[140px]">Plan</TableHead>
          <TableHead className="min-w-[100px]">Status</TableHead>
          <TableHead className="min-w-[120px]">Region</TableHead>
          <TableHead className="min-w-[100px]">Created</TableHead>
          <TableHead className="min-w-[120px] text-right">Actions</TableHead>
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
