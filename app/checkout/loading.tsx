import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <LoaderCircle className="size-8 animate-spin text-peach-700" />
    </div>
  );
}
