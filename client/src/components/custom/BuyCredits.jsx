import { Button } from "../ui/button";

export default function BuyCredits() {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Buy Orca Credits</h1>
      <Button
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        Buy Now
      </Button>
    </div>
  );
}
