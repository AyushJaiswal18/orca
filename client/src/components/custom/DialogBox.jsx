import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import axios from "axios";

export default function DialogBox({ setInstances, disabled, instance }) {
  const handleDelete = async () => {
    try {
      const data = await axios.get(
        `/containers/stopContainer/${instance.taskArn}`
      );
      const ins = await getInstances();
      setInstances(ins.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getInstances = async () => {
    const res = await axios.get("/containers/getContainers");
    return res.data;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {disabled ? (
          <Button disabled variant="destructive">
            <TrashIcon className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="destructive">
            <TrashIcon className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete an Orca Instance</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this instance?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button onClick={handleDelete} type="button" variant="destructive">
            Delete
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TrashIcon(props) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
